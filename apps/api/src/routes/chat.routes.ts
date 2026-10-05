import { Router, type Request, type Response } from 'express';
import { Conversation, Message, User, Notification } from '@repo/database';
import { authenticate } from '../middleware/auth.middleware.js';
import { AppError } from '../middleware/error.middleware.js';
import { assertObjectId } from '../services/chat.service.js';
import { emitToUsers } from '../services/realtime.js';

export const chatRoutes = Router();
chatRoutes.use(authenticate);

const uid = (req: any): string => req.user!.userId;
const ok = (res: any, data: unknown, status = 200, extra: object = {}) => res.status(status).json({ success: true, data, ...extra });

function wrap(fn: (req: Request, res: Response) => Promise<unknown>) {
  return async (req: Request, res: Response, next: any) => {
    try {
      await fn(req, res);
    } catch (e) {
      next(e);
    }
  };
}

// ============================================================
// USERS SEARCH
// ============================================================
chatRoutes.get('/users/search', wrap(async (req, res) => {
  const q = String(req.query.q ?? '').trim();
  if (!q) return ok(res, []);

  const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const users: any[] = await User.find({
    _id: { $ne: uid(req) },
    isActive: true,
    $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
  })
    .select('firstName lastName avatar role')
    .limit(20)
    .lean();

  ok(res, users.map((u) => ({ id: String(u._id), firstName: u.firstName, lastName: u.lastName, avatar: u.avatar, role: u.role })));
}));

// ============================================================
// CONVERSATIONS
// ============================================================
chatRoutes.get('/conversations', wrap(async (req, res) => {
  const userId = uid(req);
  const convs: any[] = await Conversation.find({
    participants: userId,
  })
    .populate('participants', 'firstName lastName avatar role')
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .lean();

  const results = await Promise.all(
    convs.map(async (c) => {
      const isDM = !c.isGroup && c.participants.length <= 2;
      const peer = isDM ? c.participants.find((p: any) => String(p._id) !== userId) : null;
      const name = c.name || (peer ? `${peer.firstName} ${peer.lastName}` : 'Group');

      const unreadCount = await Message.countDocuments({
        conversationId: c._id,
        senderId: { $ne: userId },
        'readBy.userId': { $ne: userId },
        isDeleted: false,
      });

      return {
        id: String(c._id),
        isGroup: c.isGroup,
        type: c.type || (isDM ? 'DM' : 'GROUP'),
        name,
        avatar: c.avatar || peer?.avatar,
        lastMessage: c.lastMessage || '',
        lastMessageAt: c.lastMessageAt || c.updatedAt,
        unreadCount,
        participants: c.participants.map((p: any) => ({
          id: String(p._id),
          firstName: p.firstName,
          lastName: p.lastName,
          avatar: p.avatar,
        })),
      };
    })
  );

  ok(res, results);
}));

chatRoutes.post('/conversations', wrap(async (req, res) => {
  const { type = 'DM', userId: targetUserId, memberIds = [], name } = req.body ?? {};
  const currentUserId = uid(req);

  if (type === 'DM' || targetUserId) {
    assertObjectId(targetUserId, 'userId');
    if (targetUserId === currentUserId) throw new AppError(400, 'INVALID_TARGET', 'Cannot start DM with self');

    const existing: any = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [currentUserId, targetUserId], $size: 2 },
    });

    if (existing) {
      return ok(res, { id: String(existing._id), name: existing.name || 'DM' }, 200);
    }

    const conv = await Conversation.create({
      type: 'DM',
      isGroup: false,
      participants: [currentUserId, targetUserId],
    });

    return ok(res, { id: String(conv._id), isGroup: false }, 201);
  }

  // GROUP conversation
  const members = [...new Set([currentUserId, ...memberIds.map(String)])];
  const groupName = typeof name === 'string' && name.trim() ? name.trim() : 'Group Chat';

  const conv = await Conversation.create({
    type: 'GROUP',
    isGroup: true,
    name: groupName,
    participants: members,
    admins: [currentUserId],
  });

  ok(res, { id: String(conv._id), name: groupName, isGroup: true }, 201);
}));

// ============================================================
// MESSAGES
// ============================================================
chatRoutes.get('/conversations/:id/messages', wrap(async (req, res) => {
  assertObjectId(req.params.id, 'conversation id');
  const userId = uid(req);

  const conv = await Conversation.findOne({ _id: req.params.id, participants: userId });
  if (!conv) throw new AppError(404, 'NOT_FOUND', 'Conversation not found');

  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const before = req.query.before ? new Date(String(req.query.before)) : null;

  const filter: any = { conversationId: req.params.id };
  if (before && !isNaN(before.getTime())) {
    filter.createdAt = { $lt: before };
  }

  const rawMessages: any[] = await Message.find(filter)
    .populate('senderId', 'firstName lastName avatar')
    .sort({ createdAt: -1 })
    .limit(limit + 1)
    .lean();

  const hasMore = rawMessages.length > limit;
  const sliced = hasMore ? rawMessages.slice(0, limit) : rawMessages;
  const formatted = sliced.reverse().map((m) => ({
    id: String(m._id),
    conversationId: String(m.conversationId),
    senderId: String(m.senderId._id ?? m.senderId),
    senderName: `${m.senderId.firstName ?? ''} ${m.senderId.lastName ?? ''}`.trim(),
    content: m.isDeleted ? '' : m.content,
    isDeleted: m.isDeleted,
    type: m.type,
    reactions: m.reactions || [],
    deliveredTo: (m.deliveredTo || []).map(String),
    createdAt: m.createdAt,
  }));

  const nextCursor = sliced.length > 0 ? sliced[0].createdAt : null;
  ok(res, { messages: formatted, hasMore, nextCursor });
}));

chatRoutes.post('/conversations/:id/messages', wrap(async (req, res) => {
  assertObjectId(req.params.id, 'conversation id');
  const userId = uid(req);
  const { content, clientId, type = 'TEXT' } = req.body ?? {};

  if (typeof content !== 'string' || !content.trim()) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Message content is required');
  }
  if (content.length > 4000) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Message is too long');
  }

  const conv: any = await Conversation.findOne({ _id: req.params.id, participants: userId });
  if (!conv) throw new AppError(404, 'NOT_FOUND', 'Conversation not found');

  if ((conv.blockedBy || []).length > 0) {
    throw new AppError(403, 'FORBIDDEN', 'This conversation is blocked');
  }

  // Idempotency check with clientId
  if (clientId) {
    const existing: any = await Message.findOne({ conversationId: req.params.id, clientId });
    if (existing) {
      return ok(res, { id: String(existing._id), content: existing.content }, 200);
    }
  }

  // Determine deliveredTo for online participants
  const deliveredTo = conv.participants.map(String);

  const msg = await Message.create({
    conversationId: req.params.id,
    senderId: userId,
    content: content.trim(),
    clientId,
    type,
    deliveredTo,
  });

  await Conversation.updateOne({ _id: req.params.id }, { $set: { lastMessage: content.trim(), lastMessageAt: new Date() } });

  const sender: any = await User.findById(userId).select('firstName lastName').lean();
  const payload = {
    id: String(msg._id),
    conversationId: req.params.id,
    senderId: userId,
    senderName: `${sender?.firstName} ${sender?.lastName}`,
    content: content.trim(),
    deliveredTo,
    createdAt: msg.createdAt,
  };

  emitToUsers(conv.participants.map(String), 'message:new', payload);
  ok(res, payload, 201);
}));

chatRoutes.patch('/conversations/:id/read', wrap(async (req, res) => {
  assertObjectId(req.params.id, 'conversation id');
  const userId = uid(req);

  const conv: any = await Conversation.findOne({ _id: req.params.id, participants: userId });
  if (!conv) throw new AppError(404, 'NOT_FOUND', 'Conversation not found');

  await Message.updateMany(
    { conversationId: req.params.id, 'readBy.userId': { $ne: userId } },
    { $push: { readBy: { userId, readAt: new Date() } } }
  );

  emitToUsers(conv.participants.map(String), 'message:read', {
    conversationId: req.params.id,
    readerId: userId,
  });

  ok(res, { read: true });
}));

chatRoutes.delete('/messages/:id', wrap(async (req, res) => {
  assertObjectId(req.params.id, 'message id');
  const userId = uid(req);

  const msg: any = await Message.findOne({ _id: req.params.id });
  if (!msg) throw new AppError(404, 'NOT_FOUND', 'Message not found');

  if (String(msg.senderId) !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'Cannot delete someone else message');
  }

  msg.isDeleted = true;
  msg.content = '';
  await msg.save();

  ok(res, { deleted: true });
}));

chatRoutes.post('/messages/:id/reactions', wrap(async (req, res) => {
  assertObjectId(req.params.id, 'message id');
  const userId = uid(req);
  const emoji = req.body?.emoji;
  if (typeof emoji !== 'string' || !emoji) throw new AppError(400, 'VALIDATION_ERROR', 'Emoji is required');

  const msg: any = await Message.findById(req.params.id);
  if (!msg) throw new AppError(404, 'NOT_FOUND', 'Message not found');

  const reactions = msg.reactions || [];
  const existingIdx = reactions.findIndex((r: any) => String(r.userId) === userId);
  if (existingIdx !== -1) {
    reactions[existingIdx].emoji = emoji;
  } else {
    reactions.push({ userId, emoji });
  }

  msg.reactions = reactions;
  await msg.save();

  ok(res, msg.reactions);
}));

chatRoutes.post('/conversations/:id/block', wrap(async (req, res) => {
  assertObjectId(req.params.id, 'conversation id');
  const userId = uid(req);

  await Conversation.updateOne({ _id: req.params.id }, { $addToSet: { blockedBy: userId } });
  ok(res, { blocked: true });
}));

// ============================================================
// NOTIFICATIONS
// ============================================================
chatRoutes.get('/notifications', wrap(async (req, res) => {
  const userId = uid(req);
  const notifs = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  ok(res, { notifications: notifs });
}));

chatRoutes.patch('/notifications/:id/read', wrap(async (req, res) => {
  assertObjectId(req.params.id, 'notification id');
  const userId = uid(req);

  await Notification.updateOne({ _id: req.params.id, userId }, { $set: { isRead: true } });
  ok(res, { read: true });
}));
