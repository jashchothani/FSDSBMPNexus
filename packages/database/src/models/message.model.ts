import mongoose, { Schema, type Document } from 'mongoose';
import type { IMessage } from '@repo/types';

export interface MessageDocument extends Omit<IMessage, '_id'>, Document {}

const messageSchema = new Schema<MessageDocument>(
  {
    conversationId: { type: Schema.Types.ObjectId as any, ref: 'Conversation', required: true },
    senderId: { type: Schema.Types.ObjectId as any, ref: 'User', required: true },
    content: { type: String },
    type: {
      type: String,
      enum: ['TEXT', 'CODE', 'PROBLEM', 'PAPER', 'ROOM_INVITE'],
      default: 'TEXT',
    },
    clientId: { type: String, index: true },
    metadata: { type: Schema.Types.Mixed },
    isDeleted: { type: Boolean, default: false },
    deliveredTo: [{ type: Schema.Types.ObjectId as any, ref: 'User' }],
    readBy: [
      {
        userId: { type: Schema.Types.ObjectId as any, ref: 'User' },
        readAt: { type: Date },
      },
    ],
    reactions: [
      {
        userId: { type: Schema.Types.ObjectId as any, ref: 'User' },
        emoji: { type: String },
      },
    ],
    replyTo: { type: Schema.Types.ObjectId as any, ref: 'Message' },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ conversationId: 1, clientId: 1 }, { sparse: true });

export const Message = mongoose.model<MessageDocument>('Message', messageSchema);
