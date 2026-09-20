import mongoose, { Schema, type Document } from 'mongoose';
import type { IQuestion } from '@repo/types';

export interface QuestionDocument extends Omit<IQuestion, '_id'>, Document {}

const questionSchema = new Schema<QuestionDocument>(
  {
    text: { type: String, required: true, maxlength: 5000 },
    subjectId: { type: Schema.Types.ObjectId as any, ref: 'Subject', required: true, index: true },
    paperId: { type: Schema.Types.ObjectId as any, ref: 'Paper', index: true },
    unitId: { type: Schema.Types.ObjectId as any, ref: 'Unit' },
    topicIds: [{ type: Schema.Types.ObjectId as any, ref: 'Topic' }],
    marks: { type: Number, min: 1, max: 100 },
    questionNumber: { type: String, maxlength: 20 },
    questionType: {
      type: String,
      enum: ['SHORT_ANSWER', 'LONG_ANSWER', 'MCQ', 'TRUE_FALSE', 'NUMERICAL', 'DIAGRAM', 'CASE_STUDY', 'OTHER'],
      default: 'OTHER',
    },
    difficulty: {
      type: String,
      enum: ['EASY', 'MEDIUM', 'HARD'],
      default: 'MEDIUM',
      index: true,
    },
    year: { type: Number, min: 1990, max: 2100 },
    examType: { type: String },
    frequency: { type: Number, default: 1, index: true },
    similarQuestionIds: [{ type: Schema.Types.ObjectId as any, ref: 'Question' }],
    embedding: { type: [Number] },
    tags: { type: [String], default: [] },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

questionSchema.index({ subjectId: 1, topicIds: 1 });
questionSchema.index({ paperId: 1 });
questionSchema.index({ subjectId: 1, frequency: -1 });
questionSchema.index({ subjectId: 1, difficulty: 1, year: -1 });
questionSchema.index({ text: 'text' });

export const Question = mongoose.model<QuestionDocument>('Question', questionSchema);
