import mongoose, { Schema, type Document } from 'mongoose';
import type { IXPTransaction } from '@repo/types';

export interface XPTransactionDocument extends Omit<IXPTransaction, '_id'>, Document {}

const xpTransactionSchema = new Schema<XPTransactionDocument>(
  {
    userId: { type: Schema.Types.ObjectId as any, ref: 'User', required: true },
    amount: { type: Number, required: true },
    source: {
      type: String,
      enum: ['PROBLEM_SOLVE', 'CLASH_WIN', 'CLASH_LOSS', 'DAILY_CHALLENGE', 'STREAK_BONUS', 'ACHIEVEMENT', 'QUIZ'],
      required: true,
    },
    description: { type: String, required: true },
    referenceId: { type: String },
  },
  { timestamps: true }
);

xpTransactionSchema.index({ userId: 1 });
xpTransactionSchema.index({ createdAt: -1 });

export const XPTransaction = mongoose.model<XPTransactionDocument>('XPTransaction', xpTransactionSchema);
