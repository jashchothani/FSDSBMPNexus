import mongoose from 'mongoose';
import { Match, Problem, User, XPTransaction, Notification } from '@repo/database';
import { judge } from './judge.service.js';
import { xpForSolve } from './gamification.service.js';
import { emitToUsers } from './realtime.js';
import { notify } from './notification.service.js';

export class MatchError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'MatchError';
    this.status = status;
    this.code = code;
  }
}

interface MatchQueueItem {
  userId: string;
  difficulty: string;
  timestamp: number;
}

const queue: MatchQueueItem[] = [];

export async function activeMatchIdsFor(userId: string): Promise<string[]> {
  const activeMatches = await Match.find({
    'players.userId': userId,
    status: { $in: ['INVITED', 'WAITING', 'IN_PROGRESS'] },
  }).select('matchId');
  return activeMatches.map((m) => m.matchId);
}

export function isQueued(userId: string): boolean {
  return queue.some((q) => q.userId === userId);
}

export function leaveQueue(userId: string): void {
  const idx = queue.findIndex((q) => q.userId === userId);
  if (idx !== -1) queue.splice(idx, 1);
}

export async function joinQueue(userId: string, difficulty = 'MEDIUM'): Promise<void> {
  const diff = (difficulty || 'MEDIUM').toUpperCase();
  if (isQueued(userId)) return;

  const active = await activeMatchIdsFor(userId);
  if (active.length > 0) {
    throw new MatchError(409, 'IN_MATCH', 'You are already in an active match');
  }

  // Look for another waiting user in queue
  const opponentIdx = queue.findIndex((q) => q.userId !== userId && q.difficulty === diff);
  if (opponentIdx !== -1) {
    const opponent = queue.splice(opponentIdx, 1)[0]!;

    // Create match between userId and opponent.userId
    const match = await createMatch({
      playerIds: [opponent.userId, userId],
      difficulty: diff as 'EASY' | 'MEDIUM' | 'HARD',
      mode: 'RANKED',
      status: 'WAITING',
      durationSeconds: 600,
    });

    emitToUsers([opponent.userId, userId], 'match:found', {
      matchId: match.matchId,
      difficulty: diff,
    });
  } else {
    queue.push({ userId, difficulty: diff, timestamp: Date.now() });
  }
}

export async function createMatch(opts: {
  playerIds: string[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  mode?: string;
  status?: 'INVITED' | 'WAITING' | 'IN_PROGRESS';
  roomId?: string;
  durationSeconds?: number;
  subject?: string;
  topic?: string;
}): Promise<any> {
  const matchId = `clash_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const users = await User.find({ _id: { $in: opts.playerIds } }).select('gamification.rating');

  const userRatingMap = new Map(users.map((u) => [String(u._id), (u.gamification as any)?.rating ?? 1200]));

  // Find suitable problem from DB
  const filter: any = { difficulty: opts.difficulty };
  if (opts.subject) filter.subject = opts.subject;
  if (opts.topic) filter.topic = opts.topic;

  let problem = await Problem.findOne(filter);
  if (!problem) {
    problem = await Problem.findOne({ difficulty: opts.difficulty }) || (await Problem.findOne({}));
  }

  const players = opts.playerIds.map((pid) => ({
    userId: new mongoose.Types.ObjectId(pid),
    rating: userRatingMap.get(pid) ?? 1200,
    score: 0,
    passedCount: 0,
    totalCount: problem ? problem.testCases.length : 0,
    isReady: false,
    status: 'PENDING',
  }));

  const match = await Match.create({
    matchId,
    mode: opts.mode || 'RANKED',
    status: opts.status || 'INVITED',
    difficulty: opts.difficulty,
    durationSeconds: opts.durationSeconds || 600,
    players,
    problemId: problem ? problem._id : undefined,
    roomId: opts.roomId ? new mongoose.Types.ObjectId(opts.roomId) : undefined,
    subject: opts.subject,
    topic: opts.topic,
  });

  return match;
}

export async function matchView(matchId: string, userId: string): Promise<any> {
  const match: any = await Match.findOne({ matchId })
    .populate('players.userId', 'firstName lastName avatar gamification.rating')
    .populate('problemId')
    .lean();

  if (!match) throw new MatchError(404, 'NOT_FOUND', 'Match not found');

  const isPlayer = match.players.some((p: any) => String(p.userId._id ?? p.userId) === userId);
  if (!isPlayer) throw new MatchError(403, 'FORBIDDEN', 'You are not a player in this match');

  const now = Date.now();
  const isStarted = match.status === 'IN_PROGRESS' || (match.startedAt && new Date(match.startedAt).getTime() <= now);

  // Hide problem until countdown finishes/match starts
  let problem = null;
  if (isStarted && match.problemId) {
    const { testCases, editorial, ...safeProb } = match.problemId;
    problem = {
      ...safeProb,
      testCases: (testCases || []).filter((t: any) => !t.isHidden).map((t: any) => ({ input: t.input, expectedOutput: t.expectedOutput })),
    };
  }

  return {
    matchId: match.matchId,
    status: match.status,
    mode: match.mode,
    difficulty: match.difficulty,
    startedAt: match.startedAt,
    endsAt: match.endedAt || (match.startedAt ? new Date(new Date(match.startedAt).getTime() + match.durationSeconds * 1000) : null),
    durationSeconds: match.durationSeconds,
    isDraw: match.isDraw,
    winnerId: match.winnerId,
    endReason: match.endReason,
    ratingChanges: match.ratingChanges,
    problem,
    players: match.players.map((p: any) => ({
      userId: String(p.userId._id ?? p.userId),
      name: `${p.userId.firstName} ${p.userId.lastName}`,
      avatar: p.userId.avatar,
      rating: p.rating,
      isReady: p.isReady,
      passedCount: p.passedCount,
      totalCount: p.totalCount,
      status: p.status,
    })),
  };
}

export async function respondToInvite(matchId: string, userId: string, accept: boolean): Promise<void> {
  const match: any = await Match.findOne({ matchId });
  if (!match) throw new MatchError(404, 'NOT_FOUND', 'Match not found');

  const pIdx = match.players.findIndex((p: any) => String(p.userId) === userId);
  if (pIdx === -1) throw new MatchError(403, 'FORBIDDEN', 'You are not in this match');

  // Challenger cannot respond to their own invite
  if (match.players.length > 0 && String(match.players[0].userId) === userId) {
    throw new MatchError(409, 'CONFLICT', 'Challenger cannot accept their own challenge');
  }

  if (!accept) {
    match.status = 'CANCELLED';
    await match.save();
    emitToUsers(match.players.map((p: any) => String(p.userId)), 'match:cancelled', { matchId });
    return;
  }

  match.status = 'WAITING';
  await match.save();

  const playerIds = match.players.map((p: any) => String(p.userId));
  emitToUsers(playerIds, 'match:found', { matchId });
}

export async function setReady(matchId: string, userId: string): Promise<void> {
  const match: any = await Match.findOne({ matchId });
  if (!match) throw new MatchError(404, 'NOT_FOUND', 'Match not found');

  const player = match.players.find((p: any) => String(p.userId) === userId);
  if (!player) throw new MatchError(403, 'FORBIDDEN', 'You are not in this match');

  player.isReady = true;
  await match.save();

  const allReady = match.players.every((p: any) => p.isReady);
  if (allReady && match.status === 'WAITING') {
    // Start countdown: 2 seconds in future
    const startedAt = new Date(Date.now() + 2000);
    const endsAt = new Date(startedAt.getTime() + match.durationSeconds * 1000);

    match.status = 'IN_PROGRESS';
    match.startedAt = startedAt;
    match.endedAt = endsAt;
    await match.save();

    const playerIds = match.players.map((p: any) => String(p.userId));
    emitToUsers(playerIds, 'match:start', {
      matchId: match.matchId,
      startedAt,
      endsAt,
    });
  }
}

export async function leaveLobby(matchId: string, userId: string): Promise<void> {
  const match: any = await Match.findOne({ matchId });
  if (!match) throw new MatchError(404, 'NOT_FOUND', 'Match not found');

  if (match.status === 'FINISHED') return;

  match.status = 'CANCELLED';
  match.endReason = 'DISCONNECT';
  await match.save();

  const playerIds = match.players.map((p: any) => String(p.userId));
  emitToUsers(playerIds, 'match:cancelled', { matchId });
}

export async function submitInMatch(matchId: string, userId: string, code: string, language: string): Promise<any> {
  const match: any = await Match.findOne({ matchId }).populate('problemId');
  if (!match) throw new MatchError(404, 'NOT_FOUND', 'Match not found');

  if (match.status !== 'IN_PROGRESS') {
    throw new MatchError(409, 'CONFLICT', 'Match is not in progress');
  }

  const now = Date.now();
  if (match.startedAt && new Date(match.startedAt).getTime() > now) {
    throw new MatchError(409, 'CONFLICT', 'Match countdown has not finished yet');
  }

  const problem = match.problemId;
  if (!problem) throw new MatchError(404, 'NOT_FOUND', 'Problem not found');

  const player = match.players.find((p: any) => String(p.userId) === userId);
  if (!player) throw new MatchError(403, 'FORBIDDEN', 'You are not a player in this match');

  // Execute judge
  const result = await judge({
    language,
    code,
    tests: problem.testCases,
    stopOnFail: false,
  });

  player.code = code;
  player.submittedAt = new Date();
  player.passedCount = result.passedCount;
  player.totalCount = result.totalCount;
  player.status = result.status;

  const otherPlayerIds = match.players
    .filter((p: any) => String(p.userId) !== userId)
    .map((p: any) => String(p.userId));

  emitToUsers(otherPlayerIds, 'match:opponent-progress', {
    userId,
    passedCount: result.passedCount,
    totalCount: result.totalCount,
    status: result.status,
  });

  if (result.status === 'ACCEPTED') {
    // Current player wins the match!
    match.status = 'FINISHED';
    match.winnerId = player.userId;
    match.endedAt = new Date();
    match.endReason = 'SOLVED';

    // Calculate rating changes (Elo rating K=32)
    const opponentPlayer = match.players.find((p: any) => String(p.userId) !== userId);
    const winnerRating = player.rating || 1200;
    const loserRating = opponentPlayer ? opponentPlayer.rating || 1200 : 1200;

    const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
    const kFactor = 32;
    const ratingDiff = Math.round(kFactor * (1 - expectedWinner));

    const newWinnerRating = winnerRating + ratingDiff;
    const newLoserRating = Math.max(100, loserRating - ratingDiff);

    const xpAwarded = xpForSolve(problem.difficulty) + 50;

    match.ratingChanges = [
      { userId: player.userId, before: winnerRating, after: newWinnerRating, xp: xpAwarded },
      ...(opponentPlayer
        ? [{ userId: opponentPlayer.userId, before: loserRating, after: newLoserRating, xp: 0 }]
        : []),
    ];

    await match.save();

    // Update winner user stats
    await User.findByIdAndUpdate(player.userId, {
      $set: { 'gamification.rating': newWinnerRating },
      $inc: { 'gamification.wins': 1, 'gamification.totalMatches': 1, 'gamification.xp': xpAwarded },
    });

    // Update loser user stats
    if (opponentPlayer) {
      await User.findByIdAndUpdate(opponentPlayer.userId, {
        $set: { 'gamification.rating': newLoserRating },
        $inc: { 'gamification.losses': 1, 'gamification.totalMatches': 1 },
      });
    }

    const allPlayerIds = match.players.map((p: any) => String(p.userId));
    emitToUsers(allPlayerIds, 'match:end', {
      matchId,
      winnerId: String(player.userId),
      ratingChanges: match.ratingChanges,
    });

    // Send notification
    for (const pid of allPlayerIds) {
      const isWinner = pid === userId;
      await notify({
        userId: pid,
        type: 'MATCH_RESULT',
        title: isWinner ? 'Victory in Code Clash!' : 'Code Clash Defeat',
        message: isWinner ? 'You won the Code Clash match!' : 'Your opponent solved the problem first.',
        link: `/arena/clash/${matchId}`,
      });
    }
  } else {
    await match.save();
  }

  return result;
}
