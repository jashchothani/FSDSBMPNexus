export interface IConversation {
  _id: string;
  type?: 'DM' | 'GROUP' | 'ROOM';
  isGroup: boolean;
  name?: string;
  description?: string;
  avatar?: string;
  participants: string[];
  admins: string[];
  blockedBy?: string[];
  lastMessage?: string;
  lastMessageAt?: Date;
  roomId?: string; // If this conversation is linked to a room
  courseId?: string; // If this is a class chat
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'TEXT' | 'CODE' | 'PROBLEM' | 'PAPER' | 'ROOM_INVITE';
  clientId?: string;
  metadata?: any;
  isDeleted: boolean;
  deliveredTo?: string[];
  readBy: {
    userId: string;
    readAt: Date;
  }[];
  reactions?: {
    userId: string;
    emoji: string;
  }[];
  replyTo?: string;
  createdAt: Date;
  updatedAt: Date;
}
