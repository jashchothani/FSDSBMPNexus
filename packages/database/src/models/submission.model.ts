import mongoose, { Schema, type Document } from 'mongoose';
import type { ISubmission } from '@repo/types';

export interface SubmissionDocument extends Omit<ISubmission, '_id'>, Document {}

const submissionSchema = new Schema<SubmissionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'COMPILE_ERROR', 'RUNTIME_ERROR'],
      default: 'PENDING',
    },
    executionTimeMs: { type: Number },
    memoryUsedKb: { type: Number },
    passedCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
    matchId: { type: Schema.Types.ObjectId, ref: 'Match' },
  },
  { timestamps: true }
);

submissionSchema.index({ userId: 1, problemId: 1 });
submissionSchema.index({ roomId: 1 });

export const Submission = mongoose.model<SubmissionDocument>('Submission', submissionSchema);
