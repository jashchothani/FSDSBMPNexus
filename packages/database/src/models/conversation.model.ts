import mongoose, { Schema, type Document } from 'mongoose';
import type { IConversation } from '@repo/types';

export interface ConversationDocument extends Omit<IConversation, '_id'>, Document {}

const conversationSchema = new Schema<ConversationDocument>(
  {
    type: { type: String, enum: ['DM', 'GROUP', 'ROOM'], default: 'DM' },
    isGroup: { type: Boolean, default: false },
    name: { type: String },
    description: { type: String },
    avatar: { type: String },
    participants: [{ type: Schema.Types.ObjectId as any, ref: 'User' }],
    admins: [{ type: Schema.Types.ObjectId as any, ref: 'User' }],
    blockedBy: [{ type: Schema.Types.ObjectId as any, ref: 'User' }],
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
    roomId: { type: Schema.Types.ObjectId as any, ref: 'Room' },
    courseId: { type: Schema.Types.ObjectId as any, ref: 'Course' },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ roomId: 1 });

export const Conversation = mongoose.model<ConversationDocument>('Conversation', conversationSchema);
