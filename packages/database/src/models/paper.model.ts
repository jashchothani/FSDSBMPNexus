import mongoose, { Schema, type Document } from 'mongoose';
import type { IPaper } from '@repo/types';

export interface PaperDocument extends Omit<IPaper, '_id'>, Document {}

const paperSchema = new Schema<PaperDocument>(
  {
    subjectId: { type: Schema.Types.ObjectId as any, ref: 'Subject', required: true, index: true },
    universityId: { type: Schema.Types.ObjectId as any, ref: 'University', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId as any, ref: 'Course' },
    branchId: { type: Schema.Types.ObjectId as any, ref: 'Branch' },
    semester: { type: Number, required: true, min: 1, max: 20 },
    year: { type: Number, required: true, min: 1990, max: 2100 },
    examType: {
      type: String,
      enum: ['PT1', 'PT2', 'MID_SEM', 'END_SEM', 'END_SEM_WINTER', 'END_SEM_SUMMER', 'SUPPLEMENTARY', 'INTERNAL', 'PRACTICE', 'OTHER'],
      required: true,
    },
    scheme: {
      type: String,
      enum: ['K-Scheme', 'I-Scheme', 'Revised'],
      default: 'K-Scheme',
    },
    uploadedByRole: {
      type: String,
      enum: ['STUDENT', 'CR', 'TEACHER', 'ADMIN'],
      default: 'STUDENT',
    },
    title: { type: String, trim: true, maxlength: 300 },
    fileUrl: { type: String, required: true },
    fileKey: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    pageCount: { type: Number },
    thumbnailUrl: { type: String },
    hasSolutions: { type: Boolean, default: false },
    solutionFileUrl: { type: String },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'APPROVED', 'REJECTED', 'FLAGGED'],
      default: 'PENDING',
      index: true,
    },
    uploadedBy: { type: Schema.Types.ObjectId as any, ref: 'User', required: true, index: true },
    approvedBy: { type: Schema.Types.ObjectId as any, ref: 'User' },
    approvedAt: { type: Date },
    rejectionReason: { type: String, maxlength: 1000 },
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    bookmarkCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    processingStatus: {
      textExtracted: { type: Boolean, default: false },
      questionsExtracted: { type: Boolean, default: false },
      topicsIdentified: { type: Boolean, default: false },
      similarityChecked: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

paperSchema.index({ subjectId: 1, year: -1 });
paperSchema.index({ universityId: 1, year: -1 });
paperSchema.index({ subjectId: 1, examType: 1, year: -1 });
paperSchema.index({ status: 1, createdAt: -1 });
paperSchema.index({ uploadedBy: 1, createdAt: -1 });

export const Paper = mongoose.model<PaperDocument>('Paper', paperSchema);
