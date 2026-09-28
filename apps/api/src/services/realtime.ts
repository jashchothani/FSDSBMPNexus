import type { Server } from 'socket.io';

let ioInstance: Server | null = null;

export function setSocketIO(io: Server): void {
  ioInstance = io;
}

export function getSocketIO(): Server | null {
  return ioInstance;
}

export function emitToUsers(userIds: string[], event: string, payload: unknown): void {
  if (!ioInstance || !userIds || userIds.length === 0) return;
  const uniqueUsers = [...new Set(userIds.map(String))];
  for (const uid of uniqueUsers) {
    ioInstance.to(`user:${uid}`).emit(event as any, payload as any);
  }
}
