import mongoose, { Schema, type Document } from 'mongoose';
import type { IMatch } from '@repo/types';

export interface MatchDocument extends Omit<IMatch, '_id'>, Document {}

const matchSchema = new Schema<MatchDocument>(
  {
    matchId: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ['1V1', 'TEAM', 'SURVIVAL'],
      default: '1V1',
    },
    status: {
      type: String,
      enum: ['WAITING', 'IN_PROGRESS', 'FINISHED', 'CANCELLED'],
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
      },
    ],
    problemId: { type: Schema.Types.ObjectId, ref: 'Problem' },
    winnerId: { type: Schema.Types.ObjectId, ref: 'User' },
    difficulty: {
      type: String,
      enum: ['EASY', 'MEDIUM', 'HARD'],
      default: 'MEDIUM',
    },
    startedAt: { type: Date },
    endedAt: { type: Date },
    durationSeconds: { type: Number, default: 600 },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
  },
  { timestamps: true }
);

matchSchema.index({ matchId: 1 }, { unique: true });
matchSchema.index({ status: 1 });
matchSchema.index({ 'players.userId': 1 });

export const Match = mongoose.model<MatchDocument>('Match', matchSchema);
