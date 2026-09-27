import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { getEnv } from '@repo/config';
import { User, Message, Conversation } from '@repo/database';

export interface ServerToClientEvents {
  'message:receive': (data: { messageId: string, content: string, senderId: string, senderName: string, conversationId: string, createdAt: Date }) => void;
  'typing:start': (data: { userId: string, conversationId: string }) => void;
  'typing:stop': (data: { userId: string, conversationId: string }) => void;
  'room:userJoined': (data: { userId: string, roomId: string, fullName: string }) => void;
  'room:userLeft': (data: { userId: string, roomId: string }) => void;
  'room:error': (data: { message: string }) => void;
  'code:update': (data: { code: string, userId: string }) => void;
  'cursor:update': (data: { cursor: any, userId: string }) => void;
  'code:result': (data: { status: string, output?: string, executionTimeMs?: number }) => void;
  'match:found': (data: { matchId: string, opponentId: string, opponentName: string, difficulty: string }) => void;
  'match:start': (data: { matchId: string, problemId: string, endTime: Date }) => void;
  'match:end': (data: { matchId: string, winnerId: string, results: any }) => void;
  'notification:new': (data: { type: string, content: string, timestamp: Date }) => void;
}

export interface ClientToServerEvents {
  'message:send': (data: { conversationId: string, content: string, type?: string }) => void;
  'typing:start': (data: { conversationId: string }) => void;
  'typing:stop': (data: { conversationId: string }) => void;
  'room:join': (data: { roomId: string }) => void;
  'room:leave': (data: { roomId: string }) => void;
  'code:update': (data: { roomId: string, code: string }) => void;
  'cursor:update': (data: { roomId: string, cursor: any }) => void;
  'code:run': (data: { roomId: string, code: string, language: string, problemId: string }) => void;
  'code:submit': (data: { roomId: string, code: string, language: string, problemId: string }) => void;
  'match:queue': (data: { type: string, rating: number }) => void;
  'match:accept': (data: { matchId: string }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  role: string;
  fullName: string;
}

export function initSocketServer(httpServer: HttpServer) {
  const env = getEnv();
  
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    }
  });

  // Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication error'));

      const decoded = verify(token, env.JWT_SECRET) as { id: string, role: string };
      const user = await User.findById(decoded.id).select('firstName lastName role');
      
      if (!user) return next(new Error('User not found'));

      socket.data.userId = user._id.toString();
      socket.data.role = user.role;
      socket.data.fullName = `${user.firstName} ${user.lastName}`;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  // In-memory matchmaking queue
  const matchmakingQueue: { userId: string, rating: number, socketId: string, fullName: string }[] = [];

  // Connection Handler
  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.data.fullName} (${socket.data.userId})`);

    // Join personal room for DMs and notifications
    socket.join(`user:${socket.data.userId}`);

    // ----- CHAT EVENTS -----
    socket.on('message:send', async (data) => {
      const messageId = Math.random().toString(36).substring(7);
      const createdAt = new Date();

      // Persist to MongoDB
      try {
        await Message.create({
          conversationId: data.conversationId,
          senderId: socket.data.userId,
          content: data.content,
          type: data.type || 'TEXT',
        });

        await Conversation.findByIdAndUpdate(data.conversationId, {
          lastMessage: data.content,
          lastMessageAt: createdAt,
        });
      } catch (err) {
        console.error('Failed to persist message:', err);
      }

      // Broadcast to conversation room
      io.to(`conversation:${data.conversationId}`).emit('message:receive', {
        messageId,
        content: data.content,
        senderId: socket.data.userId,
        senderName: socket.data.fullName,
        conversationId: data.conversationId,
        createdAt,
      });
    });

    socket.on('typing:start', (data) => {
      socket.to(`conversation:${data.conversationId}`).emit('typing:start', {
        userId: socket.data.userId,
        conversationId: data.conversationId,
      });
    });

    socket.on('typing:stop', (data) => {
      socket.to(`conversation:${data.conversationId}`).emit('typing:stop', {
        userId: socket.data.userId,
        conversationId: data.conversationId,
      });
    });

    // ----- ROOM EVENTS -----
    socket.on('room:join', (data) => {
      socket.join(`room:${data.roomId}`);
      socket.to(`room:${data.roomId}`).emit('room:userJoined', {
        userId: socket.data.userId,
        roomId: data.roomId,
        fullName: socket.data.fullName,
      });
    });

    socket.on('room:leave', (data) => {
      socket.leave(`room:${data.roomId}`);
      socket.to(`room:${data.roomId}`).emit('room:userLeft', {
        userId: socket.data.userId,
        roomId: data.roomId,
      });
    });

    // ----- CODE EVENTS -----
    socket.on('code:update', (data) => {
      socket.to(`room:${data.roomId}`).emit('code:update', {
        code: data.code,
        userId: socket.data.userId,
      });
    });

    socket.on('cursor:update', (data) => {
      socket.to(`room:${data.roomId}`).emit('cursor:update', {
        cursor: data.cursor,
        userId: socket.data.userId,
      });
    });

    // ----- MATCHMAKING EVENTS -----
    socket.on('match:queue', (data) => {
      console.log(`⚔️ User ${socket.data.fullName} joined matchmaking queue (Rating: ${data.rating})`);
      
      if (matchmakingQueue.length > 0) {
        const opponent = matchmakingQueue.shift()!;
        const matchId = 'match-' + Math.random().toString(36).substring(7);

        const matchData1 = { matchId, opponentId: opponent.userId, opponentName: opponent.fullName, difficulty: 'Medium' };
        const matchData2 = { matchId, opponentId: socket.data.userId, opponentName: socket.data.fullName, difficulty: 'Medium' };

        socket.emit('match:found', matchData1);
        io.to(opponent.socketId).emit('match:found', matchData2);
        
        console.log(`🏆 Match Found! ${socket.data.fullName} vs ${opponent.fullName}`);
      } else {
        matchmakingQueue.push({
          userId: socket.data.userId,
          rating: data.rating,
          socketId: socket.id,
          fullName: socket.data.fullName
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.data.fullName}`);
      const index = matchmakingQueue.findIndex(u => u.userId === socket.data.userId);
      if (index !== -1) matchmakingQueue.splice(index, 1);
    });
  });

  return io;
}
