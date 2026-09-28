import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { getEnv } from '@repo/config';
import { User, Message, Conversation } from '@repo/database';

export function initSocketServer(httpServer: HttpServer) {
  const env = getEnv();

  const io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) return next(new Error('UNAUTHORIZED'));

      let decoded: any;
      try {
        decoded = jwt.verify(token, env.JWT_SECRET);
      } catch {
        return next(new Error('INVALID_TOKEN'));
      }

      const uid = decoded.userId || decoded.id;
      if (!uid) return next(new Error('INVALID_TOKEN'));

      const user: any = await User.findById(uid).select('firstName lastName role isActive').lean();
      if (!user || user.isActive === false) return next(new Error('UNAUTHORIZED'));

      socket.data.userId = String(user._id);
      socket.data.role = user.role;
      socket.data.fullName = `${user.firstName} ${user.lastName}`;
      next();
    } catch {
      next(new Error('UNAUTHORIZED'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    const fullName = socket.data.fullName;

    socket.join(`user:${userId}`);

    // ----- CHAT EVENTS -----
    socket.on('message:send', async (data: any, ackFn?: (res: any) => void) => {
      try {
        const { conversationId, content, clientId, type = 'TEXT' } = data ?? {};
        if (!conversationId || typeof content !== 'string' || !content.trim()) {
          if (ackFn) ackFn({ ok: false, error: 'Invalid message' });
          return;
        }

        const conv: any = await Conversation.findOne({ _id: conversationId, participants: userId });
        if (!conv) {
          if (ackFn) ackFn({ ok: false, error: 'Conversation not found' });
          return;
        }

        if ((conv.blockedBy || []).length > 0) {
          if (ackFn) ackFn({ ok: false, error: 'Conversation is blocked' });
          return;
        }

        // Idempotency check with clientId
        if (clientId) {
          const existing: any = await Message.findOne({ conversationId, clientId });
          if (existing) {
            const resp = {
              ok: true,
              data: {
                id: String(existing._id),
                conversationId,
                senderId: userId,
                senderName: fullName,
                content: existing.content,
                deliveredTo: (existing.deliveredTo || []).map(String),
                createdAt: existing.createdAt,
              },
            };
            if (ackFn) ackFn(resp);
            return;
          }
        }

        const deliveredTo = conv.participants.map(String);
        const msg = await Message.create({
          conversationId,
          senderId: userId,
          content: content.trim(),
          clientId,
          type,
          deliveredTo,
        });

        await Conversation.updateOne({ _id: conversationId }, { $set: { lastMessage: content.trim(), lastMessageAt: new Date() } });

        const payload = {
          id: String(msg._id),
          conversationId,
          senderId: userId,
          senderName: fullName,
          content: content.trim(),
          deliveredTo,
          createdAt: msg.createdAt,
        };

        // Broadcast to all participant personal rooms
        for (const p of conv.participants.map(String)) {
          io.to(`user:${p}`).emit('message:new', payload);
        }

        if (ackFn) ackFn({ ok: true, data: payload });
      } catch (err: any) {
        if (ackFn) ackFn({ ok: false, error: err?.message || 'Failed to send message' });
      }
    });

    socket.on('typing:start', async (data: any) => {
      const { conversationId } = data ?? {};
      if (!conversationId) return;

      const conv: any = await Conversation.findOne({ _id: conversationId, participants: userId });
      if (!conv) return;

      const peers = conv.participants.map(String).filter((p: string) => p !== userId);
      for (const p of peers) {
        io.to(`user:${p}`).emit('typing:start', { userId, conversationId });
      }
    });

    socket.on('typing:stop', async (data: any) => {
      const { conversationId } = data ?? {};
      if (!conversationId) return;

      const conv: any = await Conversation.findOne({ _id: conversationId, participants: userId });
      if (!conv) return;

      const peers = conv.participants.map(String).filter((p: string) => p !== userId);
      for (const p of peers) {
        io.to(`user:${p}`).emit('typing:stop', { userId, conversationId });
      }
    });

    // ----- ROOM EVENTS -----
    socket.on('room:join', (data: any) => {
      if (data?.roomId) {
        socket.join(`room:${data.roomId}`);
      }
    });

    socket.on('room:leave', (data: any) => {
      if (data?.roomId) {
        socket.leave(`room:${data.roomId}`);
      }
    });

    socket.on('disconnect', () => {
      // Disconnect cleanup if any
    });
  });

  return io;
}
