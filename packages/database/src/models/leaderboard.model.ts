import mongoose, { Schema, type Document } from 'mongoose';
import type { ILeaderboardEntry } from '@repo/types';

export interface LeaderboardDocument extends Omit<ILeaderboardEntry, '_id'>, Document {}

const leaderboardSchema = new Schema<LeaderboardDocument>(
  {
    userId: { type: Schema.Types.ObjectId as any, ref: 'User', required: true },
    subject: { type: String },
    rating: { type: Number, default: 1200 },
    xp: { type: Number, default: 0 },
    solvedCount: { type: Number, default: 0 },
    winCount: { type: Number, default: 0 },
    rank: { type: Number },
  },
  { timestamps: true }
);

leaderboardSchema.index({ subject: 1, rating: -1 });
leaderboardSchema.index({ userId: 1, subject: 1 }, { unique: true });
leaderboardSchema.index({ xp: -1 });

export const Leaderboard = mongoose.model<LeaderboardDocument>('Leaderboard', leaderboardSchema);
