import { Router } from 'express';
import mongoose from 'mongoose';
import {
  Problem, Submission, Room, RoomMember, Match, Leaderboard, User, XPTransaction, UserAchievement, Conversation,
} from '@repo/database';
import { authenticate } from '../middleware/auth.middleware.js';
import { AppError } from '../middleware/error.middleware.js';
import { judge, JudgeUnavailableError, UnsupportedLanguageError } from '../services/judge.service.js';
import { levelFromXp, xpForSolve } from '../services/gamification.service.js';
import * as matches from '../services/match.service.js';
import { MatchError } from '../services/match.service.js';
import { assertObjectId } from '../services/chat.service.js';
import { emitToUsers } from '../services/realtime.js';
import { notify } from '../services/notification.service.js';

export const arenaRoutes = Router();
arenaRoutes.use(authenticate); // EVERY arena endpoint requires a verified user

const uid = (req: any): string => req.user!.userId;
const ok = (res: any, data: unknown, status = 200, extra: object = {}) => res.status(status).json({ success: true, data, ...extra });
const num = (v: unknown, d: number, min = 1, max = 100) => Math.min(Math.max(Number(v) || d, min), max);
const str = (v: unknown) => (typeof v === 'string' && v.length ? v : undefined);
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const DIFFS = ['EASY', 'MEDIUM', 'HARD'] as const;
const parseDifficulty = (v: unknown) => {
  const d = String(v ?? 'MEDIUM').toUpperCase();
  if (!(DIFFS as readonly string[]).includes(d)) throw new AppError(400, 'VALIDATION_ERROR', 'difficulty must be EASY, MEDIUM or HARD');
  return d as (typeof DIFFS)[number];
};

/** Map service-layer errors onto the API error format handled by the central error middleware. */
function wrap(fn: (req: any, res: any) => Promise<unknown>) {
  return async (req: any, res: any, next: any) => {
    try { await fn(req, res); }
    catch (e) {
      if (e instanceof MatchError) return next(new AppError(e.status, e.code, e.message));
      if (e instanceof JudgeUnavailableError) return next(new AppError(503, 'JUDGE_UNAVAILABLE', e.message));
      if (e instanceof UnsupportedLanguageError) return next(new AppError(400, 'UNSUPPORTED_LANGUAGE', e.message));
      next(e);
    }
  };
}

// ============================================================
// CURRICULUM & PROBLEMS
// ============================================================

// Semester → Subject → Unit → Topic tree, derived from the problem collection (DB-driven, not hardcoded in React).
arenaRoutes.get('/curriculum', wrap(async (_req, res) => {
  const rows = await Problem.aggregate([
    { $group: { _id: { s: '$semester', sub: '$subject', u: '$unit', t: '$topic' }, count: { $sum: 1 } } },
    { $sort: { '_id.s': 1, '_id.sub': 1, '_id.u': 1, '_id.t': 1 } },
  ]);
  ok(res, rows.map((r) => ({ semester: r._id.s, subject: r._id.sub, unit: r._id.u, topic: r._id.t, problems: r.count })));
}));

arenaRoutes.get('/subjects', wrap(async (_req, res) => {
  const subjects = await Problem.distinct('subject');
  const topics = await Problem.aggregate([
    { $group: { _id: { subject: '$subject', topic: '$topic' } } },
    { $group: { _id: '$_id.subject', topics: { $push: '$_id.topic' } } },
  ]);
  ok(res, { subjects, topicsBySubject: topics });
}));

arenaRoutes.get('/problems', wrap(async (req, res) => {
  const { subject, topic, difficulty, semester, unit, search, status } = req.query;
  const page = num(req.query.page, 1, 1, 10_000);
  const limit = num(req.query.limit, 20, 1, 50);

  const filter: any = {};
  if (str(subject)) filter.subject = String(subject);
  if (str(topic)) filter.topic = String(topic);
  if (str(difficulty)) filter.difficulty = String(difficulty).toUpperCase();
  if (str(semester)) filter.semester = Number(semester);
  if (str(unit)) filter.unit = Number(unit);
  if (str(search)) filter.title = { $regex: esc(String(search).slice(0, 60)), $options: 'i' };

  const solvedIds = await Submission.distinct('problemId', { userId: uid(req), status: 'ACCEPTED' });
  if (status === 'solved') filter._id = { $in: solvedIds };
  if (status === 'unsolved') filter._id = { $nin: solvedIds };
  const solvedSet = new Set(solvedIds.map(String));

  const [rows, total] = await Promise.all([
    Problem.find(filter).select('problemId title difficulty subject topic semester unit marks solveCount attemptCount')
      .sort({ semester: 1, unit: 1, createdAt: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    Problem.countDocuments(filter),
  ]);
  ok(res, rows.map((p: any) => ({ ...p, solved: solvedSet.has(String(p._id)) })), 200,
    { pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}));

// Old-paper integration: "Practice similar problems" for a paper question's text/topic.
arenaRoutes.get('/practice-similar', wrap(async (req, res) => {
  const q = str(req.query.q);
  if (!q) throw new AppError(400, 'VALIDATION_ERROR', 'q is required');
  const words = [...new Set(q.toLowerCase().match(/[a-z]{4,}/g) ?? [])].slice(0, 8);
  if (!words.length) return ok(res, []);
  const rx = words.map((w) => new RegExp(esc(w), 'i'));
  const rows = await Problem.find({ $or: [{ topic: { $in: rx } }, { concept: { $in: rx } }, { title: { $in: rx } }] })
    .select('problemId title difficulty subject topic').sort({ difficulty: 1 }).limit(8).lean();
  ok(res, rows);
}));

arenaRoutes.get('/problems/:problemId', wrap(async (req, res) => {
  const p: any = await Problem.findOne({ problemId: req.params.problemId }).lean();
  if (!p) throw new AppError(404, 'NOT_FOUND', 'Problem not found');
  // Hidden test cases never leave the server.
  const { testCases, editorial, ...safe } = p;
  const solved = await Submission.exists({ userId: uid(req), problemId: p._id, status: 'ACCEPTED' });
  ok(res, {
    ...safe,
    testCases: testCases.filter((t: any) => !t.isHidden).map((t: any) => ({ input: t.input, expectedOutput: t.expectedOutput })),
    totalTests: testCases.length,
    solved: !!solved,
    editorial: solved ? editorial : undefined,
  });
}));

// ============================================================
// CODE EXECUTION (real judge)
// ============================================================
const lastExec = new Map<string, number>();

arenaRoutes.post('/execute', wrap(async (req, res) => {
  const { problemId, code, language } = req.body ?? {};
  const isSubmit = req.body?.isSubmit === true;
  if (typeof problemId !== 'string' || typeof code !== 'string' || typeof language !== 'string') {
    throw new AppError(400, 'VALIDATION_ERROR', 'problemId, code and language are required');
  }
  if (!code.trim()) throw new AppError(400, 'VALIDATION_ERROR', 'Code cannot be empty');

  const userId = uid(req);
  const now = Date.now();
  if (now - (lastExec.get(userId) ?? 0) < 1500) throw new AppError(429, 'RATE_LIMITED', 'Slow down — wait a moment before running again');
  lastExec.set(userId, now);

  const problem: any = await Problem.findOne({ problemId });
  if (!problem) throw new AppError(404, 'NOT_FOUND', 'Problem not found');
  if (!problem.supportedLanguages.map((l: string) => l.toLowerCase()).includes(language.toLowerCase().replace('python3', 'python'))) {
    throw new AppError(400, 'UNSUPPORTED_LANGUAGE', `${language} is not supported for this problem`);
  }

  // "Run" = visible samples only. "Submit" = every test, including hidden.
  const tests = isSubmit ? problem.testCases : problem.testCases.filter((t: any) => !t.isHidden);
  if (!tests.length) throw new AppError(409, 'NO_TESTS', 'This problem has no runnable test cases');
  const result = await judge({ language, code, tests, stopOnFail: false });

  if (!isSubmit) return ok(res, { ...result, isSubmit: false });

  const alreadySolved = await Submission.exists({ userId, problemId: problem._id, status: 'ACCEPTED' });
  const submission = await Submission.create({
    userId, problemId: problem._id, code, language, status: result.status,
    executionTimeMs: result.executionTimeMs, memoryUsedKb: result.memoryUsedKb ?? undefined,
    passedCount: result.passedCount, totalCount: result.totalCount,
  } as any);
  await Problem.updateOne({ _id: problem._id }, { $inc: { attemptCount: 1, ...(result.status === 'ACCEPTED' && !alreadySolved ? { solveCount: 1 } : {}) } });

  let xpAwarded = 0;
  if (result.status === 'ACCEPTED' && !alreadySolved) {
    // XP is granted once per problem, computed on the server only.
    xpAwarded = xpForSolve(problem.difficulty);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const me: any = await User.findById(userId).select('gamification.lastActiveDate gamification.streak gamification.longestStreak gamification.xp').lean();
    const last = me?.gamification?.lastActiveDate ? new Date(me.gamification.lastActiveDate) : null;
    if (last) last.setHours(0, 0, 0, 0);
    const dayDiff = last ? Math.round((today.getTime() - last.getTime()) / 86_400_000) : null;
    const streak = dayDiff === 0 ? me.gamification.streak || 1 : dayDiff === 1 ? (me.gamification.streak || 0) + 1 : 1;

    const updated: any = await User.findByIdAndUpdate(userId, {
      $inc: { 'gamification.xp': xpAwarded, 'gamification.problemsSolved': 1 },
      $set: { 'gamification.streak': streak, 'gamification.lastActiveDate': new Date(),
              'gamification.longestStreak': Math.max(streak, me?.gamification?.longestStreak ?? 0) },
    }, { new: true }).select('gamification.xp');
    if (updated) await User.updateOne({ _id: userId }, { $set: { 'gamification.level': levelFromXp(updated.gamification.xp) } });
    await XPTransaction.create({ userId, amount: xpAwarded, source: 'PROBLEM_SOLVE', description: `Solved: ${problem.title}`, referenceId: String(submission._id) });
    for (const subject of [undefined, problem.subject]) {
      await Leaderboard.updateOne({ userId, subject }, { $inc: { xp: xpAwarded, solvedCount: 1 } }, { upsert: true });
    }
  }
  ok(res, { ...result, isSubmit: true, submissionId: String(submission._id), xpAwarded, firstSolve: xpAwarded > 0 });
}));

arenaRoutes.get('/submissions', wrap(async (req, res) => {
  const page = num(req.query.page, 1, 1, 10_000);
  const limit = num(req.query.limit, 20, 1, 50);
  const filter: any = { userId: uid(req) }; // users only ever see their own submissions
  if (str(req.query.problemId)) { assertObjectId(req.query.problemId, 'problemId'); filter.problemId = req.query.problemId; }
  const [rows, total] = await Promise.all([
    Submission.find(filter).select('-code').populate('problemId', 'problemId title difficulty').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Submission.countDocuments(filter),
  ]);
  ok(res, rows, 200, { pagination: { page, limit, total } });
}));

// ============================================================
// ROOMS
// ============================================================
const ROOM_TYPES = ['STUDY', 'CODING', 'CLASH', 'QUIZ', 'CUSTOM'];
const PRIVACY = ['PUBLIC', 'CLASS_ONLY', 'PRIVATE'];

async function memberOf(roomId: string, userId: string) {
  assertObjectId(roomId, 'room id');
  return RoomMember.findOne({ roomId, userId, status: 'ONLINE' });
}
async function requireRoomRole(roomId: string, userId: string, roles: string[]) {
  const m: any = await memberOf(roomId, userId);
  if (!m) throw new AppError(403, 'FORBIDDEN', 'You are not a member of this room');
  if (!roles.includes(m.role)) throw new AppError(403, 'FORBIDDEN', 'You do not have permission to do that in this room');
  return m;
}
async function syncRoomConversation(roomId: string, add?: string, remove?: string) {
  if (add) await Conversation.updateOne({ roomId }, { $addToSet: { participants: add } });
  if (remove) await Conversation.updateOne({ roomId }, { $pull: { participants: remove } });
}

arenaRoutes.post('/rooms', wrap(async (req, res) => {
  const { name, description, type = 'STUDY', privacy = 'PUBLIC' } = req.body ?? {};
  const trimmed = typeof name === 'string' ? name.trim() : '';
  if (trimmed.length < 3 || trimmed.length > 60) throw new AppError(400, 'VALIDATION_ERROR', 'Room name must be 3–60 characters');
  if (!ROOM_TYPES.includes(type)) throw new AppError(400, 'VALIDATION_ERROR', 'Invalid room type');
  if (!PRIVACY.includes(privacy)) throw new AppError(400, 'VALIDATION_ERROR', 'Invalid privacy setting');
  const maxParticipants = num(req.body?.maxParticipants, 50, 2, 200);
  // Class-restricted rooms are a CR/teacher capability; students cannot create them.
  if (privacy === 'CLASS_ONLY' && !['CR', 'TEACHER', 'ADMIN', 'FACULTY'].includes(req.user!.role)) {
    throw new AppError(403, 'FORBIDDEN', 'Only CRs and teachers can create class rooms');
  }

  const room = await Room.create({
    name: trimmed, description: typeof description === 'string' ? description.slice(0, 300) : undefined,
    type, privacy, hostId: uid(req), maxParticipants,
  } as any);
  await RoomMember.create({ roomId: room._id, userId: uid(req), role: 'HOST', status: 'ONLINE' } as any);
  await Conversation.create({ isGroup: true, name: trimmed, roomId: room._id, participants: [uid(req)], admins: [uid(req)] } as any);
  ok(res, room, 201);
}));

arenaRoutes.get('/rooms', wrap(async (req, res) => {
  const mine = await RoomMember.find({ userId: uid(req), status: 'ONLINE' }).distinct('roomId');
  const filter: any = {
    status: { $in: ['WAITING', 'ACTIVE'] },
    $or: [{ privacy: 'PUBLIC' }, { _id: { $in: mine } }],
  };
  if (str(req.query.type)) filter.type = String(req.query.type);
  const rooms: any[] = await Room.find(filter).populate('hostId', 'firstName lastName avatar').sort({ createdAt: -1 }).limit(50).lean();
  const counts = await RoomMember.aggregate([
    { $match: { roomId: { $in: rooms.map((r) => r._id) }, status: 'ONLINE' } },
    { $group: { _id: '$roomId', count: { $sum: 1 } } },
  ]);
  const cm = new Map(counts.map((c) => [String(c._id), c.count]));
  const mineSet = new Set(mine.map(String));
  ok(res, rooms.map((r) => ({ ...r, memberCount: cm.get(String(r._id)) ?? 0, isMember: mineSet.has(String(r._id)) })));
}));

arenaRoutes.get('/rooms/:id', wrap(async (req, res) => {
  assertObjectId(req.params.id, 'room id');
  const room: any = await Room.findById(req.params.id).populate('hostId', 'firstName lastName avatar').lean();
  if (!room) throw new AppError(404, 'NOT_FOUND', 'Room not found');
  const me: any = await memberOf(req.params.id, uid(req));
  const invited = (room.invited ?? []).map(String).includes(uid(req));
  if (room.privacy !== 'PUBLIC' && !me && !invited) throw new AppError(404, 'NOT_FOUND', 'Room not found');

  const members = me ? await RoomMember.find({ roomId: room._id, status: 'ONLINE' }).populate('userId', 'firstName lastName avatar gamification.rating').lean() : [];
  const conv: any = me ? await Conversation.findOne({ roomId: room._id }).select('_id').lean() : null;
  const activeMatch = me ? await Match.findOne({ roomId: room._id, status: { $in: ['WAITING', 'IN_PROGRESS'] } }).select('matchId status').lean() : null;
  const { invited: _omit, ...publicRoom } = room;
  ok(res, { ...publicRoom, myRole: me?.role ?? null, isInvited: invited, members, conversationId: conv ? String(conv._id) : null, activeMatch });
}));

arenaRoutes.post('/rooms/:id/join', wrap(async (req, res) => {
  assertObjectId(req.params.id, 'room id');
  const room: any = await Room.findById(req.params.id);
  if (!room || room.status === 'FINISHED') throw new AppError(404, 'NOT_FOUND', 'Room not found');
  const invited = (room.invited ?? []).map(String).includes(uid(req));
  if (room.privacy === 'PRIVATE' && !invited) throw new AppError(403, 'FORBIDDEN', 'This room is invite-only');
  if (room.privacy === 'CLASS_ONLY' && !invited && !['CR', 'TEACHER', 'ADMIN', 'FACULTY'].includes(req.user!.role)) {
    throw new AppError(403, 'FORBIDDEN', 'This room is restricted to its class');
  }
  const existing: any = await RoomMember.findOne({ roomId: room._id, userId: uid(req) });
  if (!existing || existing.status !== 'ONLINE') {
    const count = await RoomMember.countDocuments({ roomId: room._id, status: 'ONLINE' });
    if (count >= room.maxParticipants) throw new AppError(409, 'ROOM_FULL', 'This room is full');
  }
  if (existing) { existing.status = 'ONLINE'; existing.leftAt = undefined; await existing.save(); }
  else await RoomMember.create({ roomId: room._id, userId: uid(req), role: 'MEMBER', status: 'ONLINE' } as any);
  await syncRoomConversation(String(room._id), uid(req));
  emitToUsers((await RoomMember.find({ roomId: room._id, status: 'ONLINE' }).distinct('userId')).map(String), 'room:members', { roomId: String(room._id) });
  ok(res, { joined: true });
}));

arenaRoutes.post('/rooms/:id/leave', wrap(async (req, res) => {
  const m: any = await memberOf(req.params.id, uid(req));
  if (!m) throw new AppError(404, 'NOT_FOUND', 'You are not in this room');
  if (m.role === 'HOST') {
    // Host leaving closes the room (simple, predictable ownership rule).
    await Room.updateOne({ _id: req.params.id }, { $set: { status: 'FINISHED' } });
    await RoomMember.updateMany({ roomId: req.params.id }, { $set: { status: 'OFFLINE', leftAt: new Date() } });
    return ok(res, { closed: true });
  }
  m.status = 'OFFLINE'; m.leftAt = new Date(); await m.save();
  await syncRoomConversation(req.params.id, undefined, uid(req));
  ok(res, { left: true });
}));

arenaRoutes.post('/rooms/:id/invite', wrap(async (req, res) => {
  await requireRoomRole(req.params.id, uid(req), ['HOST', 'MODERATOR']);
  const target = req.body?.userId;
  assertObjectId(target, 'user id');
  const [room, user, inviter]: any[] = await Promise.all([
    Room.findById(req.params.id), User.findOne({ _id: target, isActive: true }).select('_id'), User.findById(uid(req)).select('firstName lastName').lean(),
  ]);
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  await Room.updateOne({ _id: room._id }, { $addToSet: { invited: target } });
  await notify({ userId: target, type: 'ROOM_INVITE', title: `Invitation to ${room.name}`,
    message: `${inviter?.firstName ?? 'Someone'} invited you to join this room`, link: `/arena/rooms/${room._id}` });
  ok(res, { invited: true });
}));

arenaRoutes.post('/rooms/:id/members/:userId/role', wrap(async (req, res) => {
  await requireRoomRole(req.params.id, uid(req), ['HOST']);
  const role = req.body?.role;
  if (!['MODERATOR', 'MEMBER'].includes(role)) throw new AppError(400, 'VALIDATION_ERROR', 'role must be MODERATOR or MEMBER');
  assertObjectId(req.params.userId, 'user id');
  const r = await RoomMember.updateOne({ roomId: req.params.id, userId: req.params.userId, role: { $ne: 'HOST' }, status: 'ONLINE' }, { $set: { role } });
  if (!r.matchedCount) throw new AppError(404, 'NOT_FOUND', 'Member not found');
  ok(res, { role });
}));

arenaRoutes.delete('/rooms/:id/members/:userId', wrap(async (req, res) => {
  const actor: any = await requireRoomRole(req.params.id, uid(req), ['HOST', 'MODERATOR']);
  assertObjectId(req.params.userId, 'user id');
  const target: any = await RoomMember.findOne({ roomId: req.params.id, userId: req.params.userId, status: 'ONLINE' });
  if (!target) throw new AppError(404, 'NOT_FOUND', 'Member not found');
  if (target.role === 'HOST' || (target.role === 'MODERATOR' && actor.role !== 'HOST')) throw new AppError(403, 'FORBIDDEN', 'You cannot remove this member');
  target.status = 'OFFLINE'; target.leftAt = new Date(); await target.save();
  await Room.updateOne({ _id: req.params.id }, { $pull: { invited: req.params.userId } });
  await syncRoomConversation(req.params.id, undefined, req.params.userId);
  emitToUsers([req.params.userId], 'room:kicked', { roomId: req.params.id });
  ok(res, { removed: true });
}));

arenaRoutes.patch('/rooms/:id', wrap(async (req, res) => {
  await requireRoomRole(req.params.id, uid(req), ['HOST']);
  const set: any = {};
  if (typeof req.body?.name === 'string') {
    const n = req.body.name.trim();
    if (n.length < 3 || n.length > 60) throw new AppError(400, 'VALIDATION_ERROR', 'Room name must be 3–60 characters');
    set.name = n;
  }
  if (typeof req.body?.description === 'string') set.description = req.body.description.slice(0, 300);
  if (req.body?.privacy && PRIVACY.includes(req.body.privacy)) set.privacy = req.body.privacy;
  if (req.body?.maxParticipants) set.maxParticipants = num(req.body.maxParticipants, 50, 2, 200);
  await Room.updateOne({ _id: req.params.id }, { $set: set });
  ok(res, set);
}));

// Room Code Clash — host/moderator picks settings; selected members land in a lobby.
arenaRoutes.post('/rooms/:id/clash', wrap(async (req, res) => {
  await requireRoomRole(req.params.id, uid(req), ['HOST', 'MODERATOR']);
  const difficulty = parseDifficulty(req.body?.difficulty);
  const online = (await RoomMember.find({ roomId: req.params.id, status: 'ONLINE' }).distinct('userId')).map(String);
  let players: string[] = Array.isArray(req.body?.playerIds) ? [...new Set<string>(req.body.playerIds.map(String))] : online;
  if (players.some((p) => !online.includes(p))) throw new AppError(400, 'VALIDATION_ERROR', 'Every selected player must be a room member');
  players = players.slice(0, 8);
  if (players.length < 2) throw new AppError(400, 'VALIDATION_ERROR', 'At least two room members are needed for a clash');
  if (await Match.exists({ roomId: req.params.id, status: { $in: ['WAITING', 'IN_PROGRESS'] } })) {
    throw new AppError(409, 'CONFLICT', 'This room already has an active clash');
  }
  const match = await matches.createMatch({
    playerIds: players, difficulty, mode: 'ROOM', status: 'WAITING', roomId: req.params.id,
    durationSeconds: num(req.body?.durationMinutes, 10, 3, 60) * 60,
    subject: str(req.body?.subject), topic: str(req.body?.topic),
  });
  for (const p of players.filter((p) => p !== uid(req))) {
    void notify({ userId: p, type: 'CLASH_CHALLENGE', title: 'Room Code Clash', message: 'A clash is starting in your room — get ready!', link: `/arena/clash/${match.matchId}` });
  }
  emitToUsers(players, 'match:found', { matchId: match.matchId });
  ok(res, { matchId: match.matchId }, 201);
}));

// ============================================================
// CODE CLASH — challenges, queue, lobby, submission
// ============================================================
arenaRoutes.post('/challenges', wrap(async (req, res) => {
  const target = req.body?.userId;
  assertObjectId(target, 'user id');
  if (target === uid(req)) throw new AppError(400, 'INVALID_TARGET', 'You cannot challenge yourself');
  const [meDoc, other]: any[] = await Promise.all([
    User.findById(uid(req)).select('firstName lastName').lean(), User.findOne({ _id: target, isActive: true }).select('_id'),
  ]);
  if (!other) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  if ((await matches.activeMatchIdsFor(uid(req))).length) throw new AppError(409, 'IN_MATCH', 'You are already in a match');

  const match = await matches.createMatch({
    playerIds: [uid(req), target], difficulty: parseDifficulty(req.body?.difficulty), mode: 'FRIEND', status: 'INVITED',
    durationSeconds: num(req.body?.durationMinutes, 10, 3, 60) * 60, subject: str(req.body?.subject), topic: str(req.body?.topic),
  });
  await notify({ userId: target, type: 'CLASH_CHALLENGE', title: 'Code Clash challenge',
    message: `${meDoc.firstName} ${meDoc.lastName} challenged you to a Code Clash.`, link: `/arena/clash/${match.matchId}` });
  emitToUsers([target], 'match:invite', { matchId: match.matchId, from: { id: uid(req), name: `${meDoc.firstName} ${meDoc.lastName}` } });
  ok(res, { matchId: match.matchId }, 201);
}));

arenaRoutes.post('/queue', wrap(async (req, res) => {
  await matches.joinQueue(uid(req), parseDifficulty(req.body?.difficulty));
  ok(res, { queued: true });
}));
arenaRoutes.delete('/queue', wrap(async (req, res) => { matches.leaveQueue(uid(req)); ok(res, { queued: false }); }));
arenaRoutes.get('/queue', wrap(async (req, res) => ok(res, { queued: matches.isQueued(uid(req)) })));

arenaRoutes.get('/matches', wrap(async (req, res) => {
  const page = num(req.query.page, 1, 1, 10_000);
  const limit = num(req.query.limit, 20, 1, 50);
  const filter = { 'players.userId': uid(req), status: 'FINISHED' };
  const [rows, total] = await Promise.all([
    Match.find(filter).populate('players.userId', 'firstName lastName avatar').populate('problemId', 'title difficulty subject topic')
      .sort({ endedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Match.countDocuments(filter),
  ]);
  ok(res, rows.map((m: any) => {
    const me = m.players.find((p: any) => String(p.userId._id ?? p.userId) === uid(req));
    const opp = m.players.filter((p: any) => String(p.userId._id ?? p.userId) !== uid(req));
    const change = (m.ratingChanges ?? []).find((c: any) => String(c.userId) === uid(req));
    return {
      matchId: m.matchId, endedAt: m.endedAt, difficulty: m.difficulty, endReason: m.endReason, mode: m.mode,
      problem: m.problemId ? { title: m.problemId.title, subject: m.problemId.subject, topic: m.problemId.topic } : null,
      result: m.isDraw ? 'DRAW' : String(m.winnerId) === uid(req) ? 'WIN' : 'LOSS',
      opponents: opp.map((o: any) => ({ id: String(o.userId._id ?? o.userId), name: `${o.userId.firstName} ${o.userId.lastName}`, rating: o.rating })),
      myPassed: me?.passedCount ?? 0,
      ratingBefore: change?.before, ratingAfter: change?.after, xp: change?.xp,
    };
  }), 200, { pagination: { page, limit, total } });
}));

arenaRoutes.get('/matches/active', wrap(async (req, res) => {
  const m: any = await Match.findOne({ 'players.userId': uid(req), status: { $in: ['INVITED', 'WAITING', 'IN_PROGRESS'] } }).sort({ createdAt: -1 }).select('matchId status').lean();
  ok(res, m ? { matchId: m.matchId, status: m.status } : null);
}));

arenaRoutes.get('/matches/:matchId', wrap(async (req, res) => ok(res, await matches.matchView(req.params.matchId, uid(req)))));
arenaRoutes.post('/matches/:matchId/respond', wrap(async (req, res) => {
  await matches.respondToInvite(req.params.matchId, uid(req), req.body?.accept === true); ok(res, { done: true });
}));
arenaRoutes.post('/matches/:matchId/ready', wrap(async (req, res) => { await matches.setReady(req.params.matchId, uid(req)); ok(res, { ready: true }); }));
arenaRoutes.post('/matches/:matchId/leave', wrap(async (req, res) => { await matches.leaveLobby(req.params.matchId, uid(req)); ok(res, { left: true }); }));
arenaRoutes.post('/matches/:matchId/submit', wrap(async (req, res) => {
  const { code, language } = req.body ?? {};
  if (typeof code !== 'string' || !code.trim() || typeof language !== 'string') throw new AppError(400, 'VALIDATION_ERROR', 'code and language are required');
  const r = await matches.submitInMatch(req.params.matchId, uid(req), code, language);
  ok(res, r);
}));

// ============================================================
// LEADERBOARD  (real data only)
// ============================================================
arenaRoutes.get('/leaderboard', wrap(async (req, res) => {
  const period = ['weekly', 'monthly', 'all'].includes(String(req.query.period)) ? String(req.query.period) : 'all';
  const sortBy = req.query.sortBy === 'xp' ? 'xp' : 'rating';
  const page = num(req.query.page, 1, 1, 10_000);
  const limit = num(req.query.limit, 50, 1, 100);
  const skip = (page - 1) * limit;
  const subject = str(req.query.subject);
  const semester = req.query.semester ? Number(req.query.semester) : undefined;

  let rows: any[] = [];
  let total = 0;

  if (period !== 'all') {
    const since = new Date(Date.now() - (period === 'weekly' ? 7 : 30) * 86_400_000);
    const agg = await XPTransaction.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$userId', xp: { $sum: '$amount' } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'u' } },
      { $unwind: '$u' },
      { $match: { 'u.isActive': true, ...(semester ? { 'u.currentSemester': semester } : {}) } },
      { $sort: { xp: -1 } },
      { $facet: { rows: [{ $skip: skip }, { $limit: limit }], total: [{ $count: 'n' }] } },
    ]);
    total = agg[0]?.total[0]?.n ?? 0;
    rows = (agg[0]?.rows ?? []).map((r: any) => ({ userId: String(r._id), firstName: r.u.firstName, lastName: r.u.lastName, avatar: r.u.avatar, xp: r.xp, rating: r.u.gamification?.rating ?? 1200 }));
  } else if (subject) {
    const filter = { subject };
    const [entries, n] = await Promise.all([
      Leaderboard.find(filter).populate('userId', 'firstName lastName avatar').sort({ [sortBy]: -1 }).skip(skip).limit(limit).lean(),
      Leaderboard.countDocuments(filter),
    ]);
    total = n;
    rows = entries.filter((e: any) => e.userId).map((e: any) => ({ userId: String(e.userId._id), firstName: e.userId.firstName, lastName: e.userId.lastName, avatar: e.userId.avatar, xp: e.xp, rating: e.rating, solved: e.solvedCount, wins: e.winCount }));
  } else {
    const filter: any = { isActive: true, ...(semester ? { currentSemester: semester } : {}) };
    const field = sortBy === 'xp' ? 'gamification.xp' : 'gamification.rating';
    const [users, n] = await Promise.all([
      User.find(filter).select('firstName lastName avatar gamification').sort({ [field]: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);
    total = n;
    rows = users.map((u: any) => ({ userId: String(u._id), firstName: u.firstName, lastName: u.lastName, avatar: u.avatar, xp: u.gamification?.xp ?? 0, rating: u.gamification?.rating ?? 1200, solved: u.gamification?.problemsSolved ?? 0, wins: u.gamification?.wins ?? 0 }));
  }
  ok(res, rows.map((r, i) => ({ ...r, rank: skip + i + 1, isYou: r.userId === uid(req) })), 200, { pagination: { page, limit, total } });
}));

// ============================================================
// PROFILE / STATS / RECOMMENDATIONS
// ============================================================
async function buildStats(targetId: string) {
  assertObjectId(targetId, 'user id');
  const user: any = await User.findOne({ _id: targetId, isActive: true }).select('firstName lastName avatar role gamification currentSemester').lean();
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  const oid = new mongoose.Types.ObjectId(targetId);

  const [perSubject, totals, recentXP, achievements, recentMatches, higher] = await Promise.all([
    Submission.aggregate([
      { $match: { userId: oid } },
      { $lookup: { from: 'problems', localField: 'problemId', foreignField: '_id', as: 'p' } }, { $unwind: '$p' },
      { $group: { _id: '$p.subject', attempts: { $sum: 1 }, accepted: { $sum: { $cond: [{ $eq: ['$status', 'ACCEPTED'] }, 1, 0] } }, solved: { $addToSet: { $cond: [{ $eq: ['$status', 'ACCEPTED'] }, '$problemId', '$$REMOVE'] } } } },
    ]),
    Problem.aggregate([{ $group: { _id: '$subject', total: { $sum: 1 } } }]),
    XPTransaction.find({ userId: targetId }).sort({ createdAt: -1 }).limit(10).lean(),
    UserAchievement.find({ userId: targetId }).populate('achievementId').lean(),
    Match.find({ 'players.userId': targetId, status: 'FINISHED' }).sort({ endedAt: -1 }).limit(10).select('matchId winnerId isDraw endedAt difficulty ratingChanges').lean(),
    User.countDocuments({ isActive: true, 'gamification.rating': { $gt: user.gamification?.rating ?? 1200 } }),
  ]);
  const totalMap = new Map(totals.map((t: any) => [t._id, t.total]));
  const g = user.gamification ?? {};
  const matchesPlayed = g.totalMatches ?? 0;
  return {
    user: { id: String(user._id), firstName: user.firstName, lastName: user.lastName, avatar: user.avatar, role: user.role, ...g },
    rank: higher + 1,
    winRate: matchesPlayed ? Math.round(((g.wins ?? 0) / matchesPlayed) * 100) : 0,
    skillMap: perSubject.map((s: any) => ({
      subject: s._id, solved: s.solved.length, total: totalMap.get(s._id) ?? 0, attempts: s.attempts,
      accuracy: s.attempts ? Math.round((s.accepted / s.attempts) * 100) : 0,
      percentage: totalMap.get(s._id) ? Math.round((s.solved.length / totalMap.get(s._id)) * 100) : 0,
    })),
    recentXP, achievements,
    recentMatches: recentMatches.map((m: any) => ({
      matchId: m.matchId, endedAt: m.endedAt, difficulty: m.difficulty,
      result: m.isDraw ? 'DRAW' : String(m.winnerId) === targetId ? 'WIN' : 'LOSS',
      ratingChange: (m.ratingChanges ?? []).find((c: any) => String(c.userId) === targetId),
    })),
  };
}

arenaRoutes.get('/stats/me', wrap(async (req, res) => ok(res, await buildStats(uid(req)))));
arenaRoutes.get('/stats/:userId', wrap(async (req, res) => ok(res, await buildStats(req.params.userId))));

/**
 * Recommendations are a transparent heuristic over the user's own history
 * (weak topics = low accept-rate with enough attempts). It is not a trained model;
 * the backend still owns every authoritative result.
 */
arenaRoutes.get('/recommendations', wrap(async (req, res) => {
  const oid = new mongoose.Types.ObjectId(uid(req));
  const topics = await Submission.aggregate([
    { $match: { userId: oid } },
    { $lookup: { from: 'problems', localField: 'problemId', foreignField: '_id', as: 'p' } }, { $unwind: '$p' },
    { $group: { _id: { subject: '$p.subject', topic: '$p.topic' }, attempts: { $sum: 1 }, accepted: { $sum: { $cond: [{ $eq: ['$status', 'ACCEPTED'] }, 1, 0] } } } },
  ]);
  const weak = topics
    .map((t: any) => ({ subject: t._id.subject, topic: t._id.topic, attempts: t.attempts, accuracy: Math.round((t.accepted / t.attempts) * 100) }))
    .filter((t) => t.attempts >= 2 && t.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);

  const me: any = await User.findById(uid(req)).select('gamification.rating').lean();
  const rating = me?.gamification?.rating ?? 1200;
  const targetDifficulty = rating < 1300 ? 'EASY' : rating < 1600 ? 'MEDIUM' : 'HARD';
  const solved = await Submission.distinct('problemId', { userId: oid, status: 'ACCEPTED' });

  const focus = weak.length ? { $or: weak.map((w) => ({ subject: w.subject, topic: w.topic })) } : {};
  const next = await Problem.find({ ...focus, _id: { $nin: solved }, difficulty: weak.length ? { $in: ['EASY', targetDifficulty] } : targetDifficulty })
    .select('problemId title difficulty subject topic').limit(5).lean();
  ok(res, { weakTopics: weak, suggestedDifficulty: targetDifficulty, nextProblems: next });
}));
