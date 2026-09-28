import mongoose, { Schema, type Document } from 'mongoose';
import type { IProblem } from '@repo/types';

export interface ProblemDocument extends Omit<IProblem, '_id'>, Document {}

const problemSchema = new Schema<ProblemDocument>(
  {
    problemId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['EASY', 'MEDIUM', 'HARD'],
      required: true,
    },
    subject: { type: String, required: true },
    topic: { type: String, required: true },
    semester: { type: Number, required: true },
    unit: { type: Number, required: true },
    marks: { type: Number, default: 0 },
    concept: { type: String },
    supportedLanguages: { type: [String], default: ['javascript', 'python', 'java', 'c', 'cpp'] },
    constraints: { type: String },
    hints: { type: [String], default: [] },
    editorial: { type: String },
    testCases: [
      {
        input: { type: String, required: true },
        expectedOutput: { type: String, required: true },
        isHidden: { type: Boolean, default: false },
      },
    ],
    starterCode: { type: Map, of: String, default: {} },
    solveCount: { type: Number, default: 0 },
    attemptCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

problemSchema.index({ subject: 1, topic: 1 });
problemSchema.index({ difficulty: 1 });

export const Problem = mongoose.model<ProblemDocument>('Problem', problemSchema);
