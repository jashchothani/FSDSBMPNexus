import mongoose, { Schema, type Document } from 'mongoose';
import type { IMessage } from '@repo/types';

export interface MessageDocument extends Omit<IMessage, '_id'>, Document {}

const messageSchema = new Schema<MessageDocument>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ['TEXT', 'CODE', 'PROBLEM', 'PAPER', 'ROOM_INVITE'],
      default: 'TEXT',
    },
    metadata: { type: Schema.Types.Mixed },
    isDeleted: { type: Boolean, default: false },
    readBy: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        readAt: { type: Date },
      },
    ],
    replyTo: { type: Schema.Types.ObjectId, ref: 'Message' },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message = mongoose.model<MessageDocument>('Message', messageSchema);
