/**
 * End-to-end integration test. Boots the REAL API server (no mocks) against a real MongoDB,
 * then drives it with real HTTP and real Socket.IO clients, including tampering attempts.
 *
 *   TEST_MONGODB_URI=mongodb://127.0.0.1:27017/nexus_test JUDGE_MODE=local pnpm --filter api test
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { io as ioClient, type Socket } from 'socket.io-client';
import { Problem, User, Match, Notification, Message, connectDB } from '@repo/database';

const PORT = 4111;
const API = `http://127.0.0.1:${PORT}/api`;
const MONGO = process.env.TEST_MONGODB_URI ?? 'mongodb://127.0.0.1:27017/nexus_test';
const SUFFIX = Date.now().toString(36);
const PW = 'Str0ngPass!';
let server: ChildProcess;
const sockets: Socket[] = [];

interface Actor { id: string; token: string; email: string; name: string }
const actors: Record<string, Actor> = {};

async function http(method: string, path: string, opts: { token?: string; body?: unknown } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}) },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
  const json: any = await res.json().catch(() => ({}));
  return { status: res.status, json, data: json.data };
}

function connect(token?: string): Promise<Socket> {
  return new Promise((resolve, reject) => {
    const s = ioClient(`http://127.0.0.1:${PORT}`, { auth: token ? { token } : {}, reconnection: false, transports: ['websocket'] });
    sockets.push(s);
    s.on('connect', () => resolve(s));
    s.on('connect_error', (e) => reject(e));
  });
}
const waitFor = <T = any>(s: Socket, ev: string, ms = 5000, pred: (x: T) => boolean = () => true) =>
  new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timeout waiting for "${ev}"`)), ms);
    const h = (x: T) => { if (pred(x)) { clearTimeout(t); s.off(ev, h); resolve(x); } };
    s.on(ev, h);
  });
const emitAck = (s: Socket, ev: string, payload: unknown) =>
  new Promise<any>((resolve) => s.emit(ev, payload, resolve));
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function makeActor(key: string): Promise<Actor> {
  const email = `${key}.${SUFFIX}@test.sbmp.edu`;
  const reg = await http('POST', '/auth/register', { body: { email, password: PW, firstName: key.toUpperCase(), lastName: 'Tester' } });
  assert.equal(reg.status, 201, `register ${key}: ${JSON.stringify(reg.json)}`);
  const login = await http('POST', '/auth/login', { body: { email, password: PW } });
  assert.equal(login.status, 200);
  const a = { id: String(login.data.user._id ?? login.data.user.id), token: login.data.tokens.accessToken, email, name: `${key.toUpperCase()} Tester` };
  console.log(`ACTOR ${key}:`, a);
  actors[key] = a;
  return a;
}

let mongoMemServer: any;

before(async () => {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  mongoMemServer = await MongoMemoryServer.create({ instance: { dbName: 'nexus_test' } });
  const mongoUri = mongoMemServer.getUri();
  await mongoose.connect(mongoUri);

  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  server = spawn(npxCmd, ['tsx', 'src/server.ts'], {
    shell: true,
    cwd: process.cwd(),
    env: {
      ...process.env, NODE_ENV: 'development', PORT: String(PORT), MONGODB_URI: mongoUri,
      JWT_SECRET: 'test-secret-test-secret-test-secret-123', JWT_REFRESH_SECRET: 'test-refresh-test-refresh-test-refresh-1',
      FRONTEND_URL: 'http://localhost:3000', JUDGE_MODE: process.env.JUDGE_MODE ?? 'local', JUDGE_TIME_LIMIT_MS: '2000',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let log = '';
  server.stdout!.on('data', (d) => { console.log('[SERVER]', d.toString()); log += d; });
  server.stderr!.on('data', (d) => { console.error('[SERVER ERR]', d.toString()); log += d; });
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/health`); if (r.ok) break; } catch { /* not up yet */ }
    await sleep(500);
    if (i === 59) throw new Error('server failed to start:\n' + log.slice(-1500));
  }
  await Problem.create({
    problemId: `T-ADD-${SUFFIX}`, title: 'Add Two Numbers', description: 'Read a and b, print a+b.', difficulty: 'EASY',
    subject: 'Test Subject', topic: 'Arithmetic', semester: 1, unit: 1, supportedLanguages: ['python', 'javascript'],
    testCases: [
      { input: '2 3\n', expectedOutput: '5', isHidden: false },
      { input: '10 20\n', expectedOutput: '30', isHidden: true },
      { input: '-4 1\n', expectedOutput: '-3', isHidden: true },
    ],
  });
});

after(async () => {
  sockets.forEach((s) => s.disconnect());
  if (server?.pid) {
    if (process.platform === 'win32') {
      try { spawn('taskkill', ['/F', '/T', '/PID', String(server.pid)]); } catch {}
    } else {
      server.kill('SIGKILL');
    }
  }
  await mongoose.disconnect();
  await mongoMemServer?.stop();
});

const GOOD = 'a,b=map(int,input().split())\nprint(a+b)';
const BAD_BUT_LONG = 'print("this is a long but completely wrong answer that the old mock would have accepted")';

// ----------------------------------------------------------------------------
test('AUTH: anonymous access is rejected everywhere', async () => {
  for (const p of ['/chat/conversations', '/arena/problems', '/arena/leaderboard', '/arena/stats/me', '/chat/notifications']) {
    const r = await http('GET', p);
    assert.equal(r.status, 401, `${p} should be 401 without a token`);
  }
  assert.equal((await http('POST', '/arena/execute', { body: { problemId: 'x', code: 'x', language: 'python' } })).status, 401);
  assert.equal((await http('GET', '/chat/conversations', { token: 'garbage.token.value' })).status, 401);
});

test('AUTH: register, login, bad password, unknown account, /me', async () => {
  await makeActor('alice'); await makeActor('bob'); await makeActor('carol');
  const wrongPw = await http('POST', '/auth/login', { body: { email: actors.alice!.email, password: 'WrongPass1!' } });
  assert.equal(wrongPw.status, 401);
  const unknown = await http('POST', '/auth/login', { body: { email: `nobody.${SUFFIX}@test.sbmp.edu`, password: PW } });
  assert.equal(unknown.status, 401);
  const dup = await http('POST', '/auth/register', { body: { email: actors.alice!.email, password: PW, firstName: 'A', lastName: 'B' } });
  assert.equal(dup.status, 409);
  const me = await http('GET', '/auth/me', { token: actors.alice!.token });
  assert.equal(me.status, 200);
  assert.equal(me.data.user.email, actors.alice!.email);
  assert.equal(me.data.user.passwordHash, undefined, 'password hash must never be returned');
  const stored: any = await User.findById(actors.alice!.id).select('+passwordHash').lean();
  assert.ok(stored.passwordHash && stored.passwordHash !== PW && stored.passwordHash.startsWith('$2'), 'password stored as bcrypt hash');
});

test('RBAC: student cannot reach admin APIs; role-escalation attempts fail', async () => {
  const a = actors.alice!;
  assert.equal((await http('GET', '/admin/users', { token: a.token })).status, 403);
  // Try to escalate by claiming a role at registration.
  const email = `evil.${SUFFIX}@test.sbmp.edu`;
  await http('POST', '/auth/register', { body: { email, password: PW, firstName: 'E', lastName: 'V', role: 'ADMIN' } });
  const u: any = await User.findOne({ email: email.toLowerCase() }).lean();
  assert.equal(u.role, 'STUDENT', 'client-supplied role must be ignored');
});

test('SOCKET: only a real access token can connect', async () => {
  await assert.rejects(connect(), /UNAUTHORIZED/);
  await assert.rejects(connect('demo-jwt-token'), /INVALID_TOKEN/);
  const s = await connect(actors.alice!.token);
  assert.ok(s.connected);
  s.disconnect();
});

// ----------------------------------------------------------------------------
test('CHAT: DM send/receive, persistence, membership, idempotency, read state', async () => {
  const [a, b, c] = [actors.alice!, actors.bob!, actors.carol!];
  const sa = await connect(a.token); const sb = await connect(b.token); const sc = await connect(c.token);

  const found = await http('GET', `/chat/users/search?q=${encodeURIComponent('BOB')}`, { token: a.token });
  assert.ok(found.data.some((u: any) => u.id === b.id), 'alice can find bob');
  assert.ok(!found.data.some((u: any) => u.id === a.id), 'search excludes self');
  assert.equal(found.data[0].email, undefined, 'search does not leak emails');

  const conv = await http('POST', '/chat/conversations', { token: a.token, body: { type: 'DM', userId: b.id } });
  assert.equal(conv.status, 201);
  const cid = conv.data.id;
  const again = await http('POST', '/chat/conversations', { token: b.token, body: { type: 'DM', userId: a.id } });
  assert.equal(again.data.id, cid, 'DM between the same two users is unique');

  // Live delivery A -> B
  const incoming = waitFor(sb, 'message:new');
  const ack = await emitAck(sa, 'message:send', { conversationId: cid, content: 'Hello', clientId: 'c-1' });
  assert.equal(ack.ok, true, JSON.stringify(ack));
  const got = await incoming;
  assert.equal(got.content, 'Hello');
  assert.equal(got.senderId, a.id);
  assert.ok(got.deliveredTo.includes(b.id), 'delivered because bob is online');

  // Retry with same clientId (reconnect scenario) => same message, no duplicate
  const retry = await emitAck(sa, 'message:send', { conversationId: cid, content: 'Hello', clientId: 'c-1' });
  assert.equal(retry.data.id, ack.data.id);

  // "Refresh": history comes from MongoDB
  const hist = await http('GET', `/chat/conversations/${cid}/messages`, { token: b.token });
  assert.equal(hist.data.messages.length, 1, 'exactly one message stored');
  assert.equal(hist.data.messages[0].content, 'Hello');

  // Unread count then read receipt
  const before = (await http('GET', '/chat/conversations', { token: b.token })).data.find((x: any) => x.id === cid);
  assert.equal(before.unreadCount, 1);
  assert.equal(before.name, 'ALICE Tester');
  const readEvt = waitFor(sa, 'message:read');
  await http('PATCH', `/chat/conversations/${cid}/read`, { token: b.token });
  assert.equal((await readEvt).readerId, b.id);
  const after = (await http('GET', '/chat/conversations', { token: b.token })).data.find((x: any) => x.id === cid);
  assert.equal(after.unreadCount, 0);

  // Outsider (carol) — REST and socket
  assert.equal((await http('GET', `/chat/conversations/${cid}/messages`, { token: c.token })).status, 404);
  assert.equal((await http('POST', `/chat/conversations/${cid}/messages`, { token: c.token, body: { content: 'let me in' } })).status, 404);
  const sneaky = await emitAck(sc, 'message:send', { conversationId: cid, content: 'intrude' });
  assert.equal(sneaky.ok, false);
  let leaked = false; sa.on('message:new', () => (leaked = true)); sc.on('message:new', () => (leaked = true));
  await sleep(300);
  assert.equal(leaked, false);
  assert.equal(await Message.countDocuments({ conversationId: new mongoose.Types.ObjectId(cid) }), 1, 'intruder message not stored');

  // Typing goes only to members
  let carolSawTyping = false; sc.on('typing:start', () => (carolSawTyping = true));
  const typing = waitFor(sb, 'typing:start');
  sa.emit('typing:start', { conversationId: cid });
  assert.equal((await typing).userId, a.id);
  await sleep(200); assert.equal(carolSawTyping, false);

  // Validation, delete permissions, reactions
  assert.equal((await http('POST', `/chat/conversations/${cid}/messages`, { token: a.token, body: { content: '   ' } })).status, 400);
  assert.equal((await http('POST', `/chat/conversations/${cid}/messages`, { token: a.token, body: { content: 'x'.repeat(4001) } })).status, 400);
  const mid = ack.data.id;
  assert.equal((await http('DELETE', `/chat/messages/${mid}`, { token: b.token })).status, 403, "can't delete someone else's message");
  const react = await http('POST', `/chat/messages/${mid}/reactions`, { token: b.token, body: { emoji: '👍' } });
  assert.equal(react.data.length, 1);
  assert.equal((await http('DELETE', `/chat/messages/${mid}`, { token: a.token })).status, 200);
  const h2 = await http('GET', `/chat/conversations/${cid}/messages`, { token: b.token });
  assert.equal(h2.data.messages[0].isDeleted, true);
  assert.equal(h2.data.messages[0].content, '', 'deleted content is not returned');

  // Block prevents sending
  await http('POST', `/chat/conversations/${cid}/block`, { token: b.token });
  assert.equal((await http('POST', `/chat/conversations/${cid}/messages`, { token: a.token, body: { content: 'hi' } })).status, 403);
});

test('CHAT: pagination returns newest first with cursor', async () => {
  const [a, b] = [actors.alice!, actors.bob!];
  const g = await http('POST', '/chat/conversations', { token: a.token, body: { type: 'GROUP', name: 'DBMS Group', memberIds: [b.id] } });
  assert.equal(g.status, 201);
  for (let i = 1; i <= 7; i++) await http('POST', `/chat/conversations/${g.data.id}/messages`, { token: a.token, body: { content: `m${i}` } });
  const p1 = await http('GET', `/chat/conversations/${g.data.id}/messages?limit=3`, { token: b.token });
  assert.deepEqual(p1.data.messages.map((m: any) => m.content), ['m5', 'm6', 'm7']);
  assert.equal(p1.data.hasMore, true);
  const p2 = await http('GET', `/chat/conversations/${g.data.id}/messages?limit=3&before=${p1.data.nextCursor}`, { token: b.token });
  assert.deepEqual(p2.data.messages.map((m: any) => m.content), ['m2', 'm3', 'm4']);
});

// ----------------------------------------------------------------------------
test('JUDGE: real execution; wrong-but-long code fails; hidden tests hidden; XP only once', async () => {
  const [a, b] = [actors.alice!, actors.bob!];
  const pid = `T-ADD-${SUFFIX}`;

  const p = await http('GET', `/arena/problems/${pid}`, { token: a.token });
  assert.equal(p.data.testCases.length, 1, 'only visible tests are sent');
  assert.equal(p.data.totalTests, 3);
  assert.ok(!JSON.stringify(p.data).includes('"-3"'), 'hidden expected output must not leak');

  const run = await http('POST', '/arena/execute', { token: a.token, body: { problemId: pid, code: GOOD, language: 'python' } });
  assert.equal(run.data.status, 'ACCEPTED');
  assert.equal(run.data.totalCount, 1, 'Run uses visible tests only');
  await sleep(1600);

  const bad = await http('POST', '/arena/execute', { token: a.token, body: { problemId: pid, code: BAD_BUT_LONG, language: 'python', isSubmit: true } });
  assert.equal(bad.data.status, 'WRONG_ANSWER', 'long-but-wrong code must NOT be accepted');
  assert.equal(bad.data.xpAwarded, 0);
  await sleep(1600);

  // Attempt to credit XP to bob by spoofing userId in the body.
  const good = await http('POST', '/arena/execute', { token: a.token, body: { problemId: pid, code: GOOD, language: 'python', isSubmit: true, userId: b.id, xp: 999999 } });
  assert.equal(good.data.status, 'ACCEPTED');
  assert.equal(good.data.passedCount, 3);
  assert.equal(good.data.xpAwarded, 50);
  const ua: any = await User.findById(a.id).lean(); const ub: any = await User.findById(b.id).lean();
  assert.equal(ua.gamification.xp, 50);
  assert.equal(ub.gamification.xp, 0, 'spoofed userId must not receive XP');
  await sleep(1600);

  const again = await http('POST', '/arena/execute', { token: a.token, body: { problemId: pid, code: GOOD, language: 'python', isSubmit: true } });
  assert.equal(again.data.xpAwarded, 0, 'no XP farming on repeat solves');

  const loop = await sleep(1600).then(() => http('POST', '/arena/execute', { token: a.token, body: { problemId: pid, code: 'while True: pass', language: 'python' } }));
  assert.equal(loop.data.status, 'TIME_LIMIT_EXCEEDED');
  await sleep(1600);
  const leak = await http('POST', '/arena/execute', { token: a.token, body: { problemId: pid, code: 'import os\nprint(os.environ.get("JWT_SECRET","hidden"))', language: 'python' } });
  assert.ok(!JSON.stringify(leak.data).includes('test-secret'), 'server secrets are invisible to student code');

  // Rate limiting
  const rl1 = await http('POST', '/arena/execute', { token: b.token, body: { problemId: pid, code: GOOD, language: 'python' } });
  const rl2 = await http('POST', '/arena/execute', { token: b.token, body: { problemId: pid, code: GOOD, language: 'python' } });
  assert.equal(rl1.status, 200); assert.equal(rl2.status, 429);
});

// ----------------------------------------------------------------------------
test('ROOMS: identity from token, privacy, invites, permissions, room chat isolation', async () => {
  const [a, b, c] = [actors.alice!, actors.bob!, actors.carol!];
  const room = await http('POST', '/arena/rooms', { token: a.token, body: { name: 'Secret Study', type: 'STUDY', privacy: 'PRIVATE', hostId: b.id } });
  assert.equal(room.status, 201);
  assert.equal(String(room.data.hostId), a.id, 'hostId from body is ignored — host is the authenticated user');
  const rid = room.data._id;

  assert.equal((await http('GET', `/arena/rooms/${rid}`, { token: b.token })).status, 404, 'private room invisible to outsiders');
  assert.equal((await http('POST', `/arena/rooms/${rid}/join`, { token: b.token })).status, 403);
  assert.equal((await http('POST', '/arena/rooms', { token: b.token, body: { name: 'Class', privacy: 'CLASS_ONLY' } })).status, 403, 'students cannot create class rooms');

  assert.equal((await http('POST', `/arena/rooms/${rid}/invite`, { token: b.token, body: { userId: c.id } })).status, 403, 'non-members cannot invite');
  assert.equal((await http('POST', `/arena/rooms/${rid}/invite`, { token: a.token, body: { userId: b.id } })).status, 200);
  const notes = await http('GET', '/chat/notifications', { token: b.token });
  assert.ok(notes.data.notifications.some((n: any) => n.type === 'ROOM_INVITE' && n.link === `/arena/rooms/${rid}`));
  assert.equal((await http('POST', `/arena/rooms/${rid}/join`, { token: b.token })).status, 200);

  const detail = await http('GET', `/arena/rooms/${rid}`, { token: b.token });
  assert.equal(detail.data.myRole, 'MEMBER');
  const convId = detail.data.conversationId;
  const msg = await http('POST', `/chat/conversations/${convId}/messages`, { token: b.token, body: { content: 'hi room' } });
  assert.equal(msg.status, 201);
  assert.equal((await http('GET', `/chat/conversations/${convId}/messages`, { token: c.token })).status, 404, 'outsider cannot read room chat');

  assert.equal((await http('DELETE', `/arena/rooms/${rid}/members/${a.id}`, { token: b.token })).status, 403, 'member cannot kick the host');
  assert.equal((await http('POST', `/arena/rooms/${rid}/members/${b.id}/role`, { token: b.token, body: { role: 'MODERATOR' } })).status, 403, 'member cannot self-promote');
  assert.equal((await http('DELETE', `/arena/rooms/${rid}/members/${b.id}`, { token: a.token })).status, 200);
  assert.equal((await http('GET', `/chat/conversations/${convId}/messages`, { token: b.token })).status, 404, 'kicked member loses room chat access');
});

// ----------------------------------------------------------------------------
test('CODE CLASH: challenge → lobby → countdown → judged result → rating/XP/notification/history', async () => {
  const [a, b, c] = [actors.alice!, actors.bob!, actors.carol!];
  const sa = await connect(a.token); const sb = await connect(b.token);

  const invited = waitFor(sb, 'match:invite');
  const ch = await http('POST', '/arena/challenges', { token: a.token, body: { userId: b.id, difficulty: 'EASY', durationMinutes: 5 } });
  assert.equal(ch.status, 201, JSON.stringify(ch.json));
  const mid = ch.data.matchId;
  assert.equal((await invited).from.id, a.id);
  const bn = await http('GET', '/chat/notifications', { token: b.token });
  assert.ok(bn.data.notifications.some((n: any) => n.type === 'CLASH_CHALLENGE'));

  assert.equal((await http('GET', `/arena/matches/${mid}`, { token: c.token })).status, 403, 'non-players cannot view a match');
  assert.equal((await http('POST', `/arena/matches/${mid}/respond`, { token: a.token, body: { accept: true } })).status, 409, 'challenger cannot accept their own challenge');

  const found = Promise.all([waitFor(sa, 'match:found'), waitFor(sb, 'match:found')]);
  assert.equal((await http('POST', `/arena/matches/${mid}/respond`, { token: b.token, body: { accept: true } })).status, 200);
  await found;

  // Lobby: problem must not be revealed yet
  const lobby = await http('GET', `/arena/matches/${mid}`, { token: a.token });
  assert.equal(lobby.data.status, 'WAITING');
  assert.equal(lobby.data.problem, null, 'problem hidden until countdown ends');
  assert.equal((await http('POST', `/arena/matches/${mid}/submit`, { token: a.token, body: { code: GOOD, language: 'python' } })).status, 409, 'cannot submit before start');

  const started = Promise.all([waitFor(sa, 'match:start'), waitFor(sb, 'match:start')]);
  await http('POST', `/arena/matches/${mid}/ready`, { token: a.token });
  await http('POST', `/arena/matches/${mid}/ready`, { token: b.token });
  const [st] = await started;
  const startedAt = new Date(st.startedAt).getTime(); const endsAt = new Date(st.endsAt).getTime();
  assert.equal(endsAt - startedAt, 300_000, 'server-defined duration');
  assert.ok(startedAt > Date.now(), 'countdown is in the future (server clock)');

  // Refresh mid-countdown: same timer comes back from the server
  const view = await http('GET', `/arena/matches/${mid}`, { token: b.token });
  assert.equal(new Date(view.data.endsAt).getTime(), endsAt);

  await sleep(Math.max(0, startedAt - Date.now()) + 300);

  const live = await http('GET', `/arena/matches/${mid}`, { token: a.token });
  assert.ok(live.data.problem, 'problem revealed after countdown');
  assert.equal(live.data.problem.testCases.length, 1, 'hidden tests never sent');
  assert.equal(live.data.players.length, 2);

  // Bob submits a wrong answer -> Alice sees real (partial) progress, match continues
  const progress = waitFor(sa, 'match:opponent-progress');
  const wrong = await http('POST', `/arena/matches/${mid}/submit`, { token: b.token, body: { code: BAD_BUT_LONG, language: 'python' } });
  assert.equal(wrong.data.status, 'WRONG_ANSWER');
  assert.equal((await progress).passedCount, 0);
  assert.equal((await http('GET', `/arena/matches/${mid}`, { token: a.token })).data.status, 'IN_PROGRESS');

  // Alice submits a correct answer while trying to force herself as winner
  await sleep(3100);
  const ended = Promise.all([waitFor(sa, 'match:end'), waitFor(sb, 'match:end')]);
  const win = await http('POST', `/arena/matches/${mid}/submit`, { token: a.token, body: { code: GOOD, language: 'python', winnerId: b.id } });
  assert.equal(win.data.status, 'ACCEPTED');
  await ended;

  const done = await http('GET', `/arena/matches/${mid}`, { token: b.token });
  assert.equal(done.data.status, 'FINISHED');
  assert.equal(done.data.winnerId, a.id, 'server decided the winner (client-sent winnerId ignored)');
  assert.equal(done.data.endReason, 'SOLVED');
  const ra = done.data.ratingChanges.find((x: any) => x.userId === a.id); const rb = done.data.ratingChanges.find((x: any) => x.userId === b.id);
  assert.ok(ra.after > ra.before && rb.after < rb.before, 'winner gains rating, loser loses');
  assert.equal(ra.after - ra.before, 16, 'Elo K=32 between equal ratings => +16');
  assert.equal(ra.after - ra.before, rb.before - rb.after, 'rating is zero-sum for 1v1');

  const ua: any = await User.findById(a.id).lean(); const ub: any = await User.findById(b.id).lean();
  assert.equal(ua.gamification.rating, ra.after); assert.equal(ub.gamification.rating, rb.after);
  assert.equal(ua.gamification.wins, 1); assert.equal(ub.gamification.losses, 1);
  assert.equal(ua.gamification.totalMatches, 1);

  assert.equal((await http('POST', `/arena/matches/${mid}/submit`, { token: b.token, body: { code: GOOD, language: 'python' } })).status, 409, 'no submissions after the match ends');

  const notif = await http('GET', '/chat/notifications', { token: b.token });
  assert.ok(notif.data.notifications.some((n: any) => n.type === 'MATCH_RESULT' && n.link === `/arena/clash/${mid}`));

  const hist = await http('GET', '/arena/matches', { token: b.token });
  assert.equal(hist.data[0].matchId, mid); assert.equal(hist.data[0].result, 'LOSS');
  assert.equal((await http('GET', '/arena/matches', { token: a.token })).data[0].result, 'WIN');

  const stored: any = await Match.findOne({ matchId: mid }).lean();
  assert.equal(String(stored.winnerId), a.id);
  assert.ok(await Notification.countDocuments({ type: 'MATCH_RESULT' }) >= 2);
});

test('CODE CLASH: quick-match queue pairs two real users within a rating window', async () => {
  const [b, c] = [actors.bob!, actors.carol!];
  const sb = await connect(b.token); const sc = await connect(c.token);
  assert.equal((await http('POST', '/arena/queue', { token: b.token, body: { difficulty: 'EASY' } })).status, 200);
  const fb = waitFor(sb, 'match:found', 8000); const fc = waitFor(sc, 'match:found', 8000);
  assert.equal((await http('POST', '/arena/queue', { token: c.token, body: { difficulty: 'EASY' } })).status, 200);
  const [x, y] = await Promise.all([fb, fc]);
  assert.equal(x.matchId, y.matchId);
  const view = await http('GET', `/arena/matches/${x.matchId}`, { token: b.token });
  assert.deepEqual(view.data.players.map((p: any) => p.userId).sort(), [b.id, c.id].sort());
});

test('OPERATIONS: health endpoint is safe; unauthenticated leaderboard blocked', async () => {
  const h = await fetch(`http://127.0.0.1:${PORT}/health`); const j: any = await h.json();
  assert.equal(h.status, 200); assert.equal(j.data.database, 'up');
  const text = JSON.stringify(j);
  assert.ok(!/mongodb:|secret|password/i.test(text), 'health leaks nothing');
});
