import mongoose, { Schema, type Document } from 'mongoose';
import type { IMaterial } from '@repo/types';

export interface MaterialDocument extends Omit<IMaterial, '_id'>, Document {}

const materialSchema = new Schema<MaterialDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 300 },
    description: { type: String, maxlength: 2000 },
    subjectId: { type: Schema.Types.ObjectId as any, ref: 'Subject', required: true, index: true },
    unitId: { type: Schema.Types.ObjectId as any, ref: 'Unit' },
    topicIds: [{ type: Schema.Types.ObjectId as any, ref: 'Topic' }],
    type: {
      type: String,
      enum: ['NOTES', 'STUDY_MATERIAL', 'SOLUTION', 'QUESTION_BANK', 'REFERENCE', 'PRESENTATION', 'OTHER'],
      required: true,
    },
    fileType: {
      type: String,
      enum: ['PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'IMAGE', 'LINK', 'OTHER'],
      required: true,
    },
    fileUrl: { type: String },
    fileKey: { type: String },
    fileName: { type: String },
    fileSize: { type: Number },
    mimeType: { type: String },
    externalUrl: { type: String },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'APPROVED', 'REJECTED', 'FLAGGED'],
      default: 'PENDING',
      index: true,
    },
    uploadedBy: { type: Schema.Types.ObjectId as any, ref: 'User', required: true, index: true },
    approvedBy: { type: Schema.Types.ObjectId as any, ref: 'User' },
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    bookmarkCount: { type: Number, default: 0 },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    isVerified: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

materialSchema.index({ subjectId: 1, type: 1 });
materialSchema.index({ status: 1, createdAt: -1 });
materialSchema.index({ title: 'text', description: 'text' });

export const Material = mongoose.model<MaterialDocument>('Material', materialSchema);
