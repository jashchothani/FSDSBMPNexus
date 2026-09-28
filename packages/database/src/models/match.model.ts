import mongoose, { Schema, type Document } from 'mongoose';
import type { IMatch } from '@repo/types';

export interface MatchDocument extends Omit<IMatch, '_id'>, Document {
  mode?: string;
  endReason?: string;
  isDraw?: boolean;
  subject?: string;
  topic?: string;
  ratingChanges?: Array<{ userId: mongoose.Types.ObjectId; before: number; after: number; xp: number }>;
}

const matchSchema = new Schema<MatchDocument>(
  {
    matchId: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ['1V1', 'TEAM', 'SURVIVAL'],
      default: '1V1',
    },
    mode: { type: String, default: 'RANKED' },
    status: {
      type: String,
      enum: ['INVITED', 'WAITING', 'IN_PROGRESS', 'FINISHED', 'CANCELLED'],
      default: 'WAITING',
    },
    players: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, default: 1200 },
        score: { type: Number, default: 0 },
        code: { type: String },
        submittedAt: { type: Date },
        status: { type: String, enum: ['ACCEPTED', 'WRONG_ANSWER', 'PENDING'], default: 'PENDING' },
        passedCount: { type: Number, default: 0 },
        totalCount: { type: Number, default: 0 },
        isReady: { type: Boolean, default: false },
      },
    ],
    problemId: { type: Schema.Types.ObjectId, ref: 'Problem' },
    winnerId: { type: Schema.Types.ObjectId, ref: 'User' },
    endReason: { type: String },
    isDraw: { type: Boolean, default: false },
    difficulty: {
      type: String,
      enum: ['EASY', 'MEDIUM', 'HARD'],
      default: 'MEDIUM',
    },
    startedAt: { type: Date },
    endedAt: { type: Date },
    durationSeconds: { type: Number, default: 600 },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
    subject: { type: String },
    topic: { type: String },
    ratingChanges: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        before: { type: Number },
        after: { type: Number },
        xp: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

matchSchema.index({ status: 1 });
matchSchema.index({ 'players.userId': 1 });

export const Match = mongoose.model<MatchDocument>('Match', matchSchema);
