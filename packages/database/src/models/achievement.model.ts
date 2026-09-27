import mongoose, { Schema, type Document } from 'mongoose';
import type { IAchievement, IUserAchievement } from '@repo/types';

export interface AchievementDocument extends Omit<IAchievement, '_id'>, Document {}
export interface UserAchievementDocument extends Omit<IUserAchievement, '_id'>, Document {}

const achievementSchema = new Schema<AchievementDocument>(
  {
    achievementId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    category: {
      type: String,
      enum: ['STREAK', 'CLASH', 'PRACTICE', 'SOCIAL', 'MILESTONE'],
      required: true,
    },
    criteria: {
      type: { type: String, required: true },
      value: { type: Number, required: true },
    },
    xpReward: { type: Number, default: 100 },
    rarity: {
      type: String,
      enum: ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'],
      default: 'COMMON',
    },
  },
  { timestamps: true }
);

const userAchievementSchema = new Schema<UserAchievementDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  achievementId: { type: Schema.Types.ObjectId, ref: 'Achievement', required: true },
  earnedAt: { type: Date, default: Date.now },
});

achievementSchema.index({ achievementId: 1 }, { unique: true });
userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

export const Achievement = mongoose.model<AchievementDocument>('Achievement', achievementSchema);
export const UserAchievement = mongoose.model<UserAchievementDocument>('UserAchievement', userAchievementSchema);
