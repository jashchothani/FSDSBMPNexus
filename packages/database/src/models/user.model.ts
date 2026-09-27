import mongoose, { Schema, type Document } from 'mongoose';
import type { IUser } from '@repo/types';

export interface UserDocument extends Omit<IUser, '_id'>, Document {}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String },
    firstName: { type: String, required: true, trim: true, maxlength: 100 },
    lastName: { type: String, required: true, trim: true, maxlength: 100 },
    role: {
      type: String,
      enum: ['STUDENT', 'CONTRIBUTOR', 'FACULTY', 'MODERATOR', 'ADMIN'],
      default: 'STUDENT',
      index: true,
    },
    authProvider: {
      type: String,
      enum: ['LOCAL', 'GOOGLE'],
      default: 'LOCAL',
    },
    googleId: { type: String, sparse: true },
    avatar: { type: String },
    bio: { type: String, maxlength: 500 },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    refreshTokens: { type: [String], default: [] },
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      notifications: {
        newPaper: { type: Boolean, default: true },
        contributorApproval: { type: Boolean, default: true },
        studyReminders: { type: Boolean, default: true },
        quizResults: { type: Boolean, default: true },
        examCountdown: { type: Boolean, default: true },
        announcements: { type: Boolean, default: true },
      },
      defaultUniversityId: { type: Schema.Types.ObjectId as any, ref: 'University' },
      defaultCourseId: { type: Schema.Types.ObjectId as any, ref: 'Course' },
      defaultSemester: { type: Number },
    },
    gamification: {
      xp: { type: Number, default: 0 },
      level: { type: Number, default: 1 },
      rating: { type: Number, default: 1200 },
      streak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      lastActiveDate: { type: Date },
      badges: { type: [String], default: [] },
      papersViewed: { type: Number, default: 0 },
      questionsSolved: { type: Number, default: 0 },
      quizzesCompleted: { type: Number, default: 0 },
      totalMatches: { type: Number, default: 0 },
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      problemsSolved: { type: Number, default: 0 },
    },
    universityId: { type: Schema.Types.ObjectId as any, ref: 'University' },
    courseId: { type: Schema.Types.ObjectId as any, ref: 'Course' },
    currentSemester: { type: Number },
    contributorReputation: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const obj = ret as any;
        delete obj.passwordHash;
        delete obj.refreshTokens;
        delete obj.emailVerificationToken;
        delete obj.emailVerificationExpires;
        delete obj.passwordResetToken;
        delete obj.passwordResetExpires;
        delete obj.__v;
        return obj;
      },
    },
  }
);

// Indexes
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ emailVerificationToken: 1 }, { sparse: true });
userSchema.index({ passwordResetToken: 1 }, { sparse: true });

// Virtual full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

export const User = mongoose.model<UserDocument>('User', userSchema);
