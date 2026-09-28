import mongoose, { Schema, type Document } from 'mongoose';
import type { IRoom, IRoomMember } from '@repo/types';

export interface RoomDocument extends Omit<IRoom, '_id'>, Document {
  invited?: mongoose.Types.ObjectId[];
}
export interface RoomMemberDocument extends Omit<IRoomMember, '_id'>, Document {}

const roomMemberSchema = new Schema<RoomMemberDocument>({
  roomId: { type: Schema.Types.ObjectId as any, ref: 'Room', required: true },
  userId: { type: Schema.Types.ObjectId as any, ref: 'User', required: true },
  role: { type: String, enum: ['HOST', 'MODERATOR', 'MEMBER'], default: 'MEMBER' },
  status: { type: String, enum: ['ONLINE', 'OFFLINE'], default: 'ONLINE' },
  joinedAt: { type: Date, default: Date.now },
  leftAt: { type: Date },
});

const roomSchema = new Schema<RoomDocument>(
  {
    name: { type: String, required: true },
    description: { type: String },
    type: {
      type: String,
      enum: ['STUDY', 'CODING', 'CLASH', 'QUIZ', 'CUSTOM'],
      default: 'STUDY',
    },
    hostId: { type: Schema.Types.ObjectId as any, ref: 'User', required: true },
    privacy: {
      type: String,
      enum: ['PUBLIC', 'CLASS_ONLY', 'PRIVATE'],
      default: 'PUBLIC',
    },
    courseId: { type: Schema.Types.ObjectId as any, ref: 'Course' },
    status: {
      type: String,
      enum: ['WAITING', 'ACTIVE', 'FINISHED'],
      default: 'WAITING',
    },
    maxParticipants: { type: Number, default: 50 },
    currentProblemId: { type: Schema.Types.ObjectId as any, ref: 'Problem' },
    currentQuizId: { type: Schema.Types.ObjectId as any, ref: 'Quiz' },
    invited: [{ type: Schema.Types.ObjectId as any, ref: 'User' }],
  },
  { timestamps: true }
);

roomSchema.index({ type: 1, status: 1 });
roomSchema.index({ hostId: 1 });

export const RoomMember = mongoose.model<RoomMemberDocument>('RoomMember', roomMemberSchema);
export const Room = mongoose.model<RoomDocument>('Room', roomSchema);
