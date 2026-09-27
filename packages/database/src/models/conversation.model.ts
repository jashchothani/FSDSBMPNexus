import mongoose, { Schema, type Document } from 'mongoose';
import type { IConversation } from '@repo/types';

export interface ConversationDocument extends Omit<IConversation, '_id'>, Document {}

const conversationSchema = new Schema<ConversationDocument>(
  {
    isGroup: { type: Boolean, default: false },
    name: { type: String },
    description: { type: String },
    avatar: { type: String },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ roomId: 1 });

export const Conversation = mongoose.model<ConversationDocument>('Conversation', conversationSchema);
