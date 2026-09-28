import { z } from 'zod';
import { ContentStatusValues } from './paper.types.js';

// ============================================================
// Material Types
// ============================================================

export const MaterialType = {
  NOTES: 'NOTES',
  STUDY_MATERIAL: 'STUDY_MATERIAL',
  SOLUTION: 'SOLUTION',
  QUESTION_BANK: 'QUESTION_BANK',
  REFERENCE: 'REFERENCE',
  PRESENTATION: 'PRESENTATION',
  OTHER: 'OTHER',
} as const;

export type MaterialType = (typeof MaterialType)[keyof typeof MaterialType];
export const MaterialTypeValues = Object.values(MaterialType) as [MaterialType, ...MaterialType[]];

export const FileType = {
  PDF: 'PDF',
  DOC: 'DOC',
  DOCX: 'DOCX',
  PPT: 'PPT',
  PPTX: 'PPTX',
  IMAGE: 'IMAGE',
  LINK: 'LINK',
  OTHER: 'OTHER',
} as const;

export type FileType = (typeof FileType)[keyof typeof FileType];
export const FileTypeValues = Object.values(FileType) as [FileType, ...FileType[]];

export interface IMaterial {
  _id: string;
  title: string;
  description?: string;
  subjectId: string;
  unitId?: string;
  topicIds: string[];
  type: MaterialType;
  fileType: FileType;
  fileUrl?: string;
  fileKey?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  externalUrl?: string;
  status: string; // ContentStatus
  uploadedBy: string;
  approvedBy?: string;
  views: number;
  downloads: number;
  bookmarkCount: number;
  rating: {
    average: number;
    count: number;
  };
  isVerified: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// Validation Schemas
// ============================================================

export const uploadMaterialSchema = z.object({
  title: z.string().min(2).max(300),
  description: z.string().max(2000).optional(),
  subjectId: z.string().min(1),
  unitId: z.string().optional(),
  topicIds: z.array(z.string()).default([]),
  type: z.enum(MaterialTypeValues),
  fileType: z.enum(FileTypeValues),
  externalUrl: z.string().url().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

export const materialFilterSchema = z.object({
  subjectId: z.string().optional(),
  unitId: z.string().optional(),
  topicId: z.string().optional(),
  type: z.enum(MaterialTypeValues).optional(),
  fileType: z.enum(FileTypeValues).optional(),
  status: z.enum(ContentStatusValues).optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'views', 'downloads', 'rating']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type UploadMaterialInput = z.infer<typeof uploadMaterialSchema>;
export type MaterialFilterInput = z.infer<typeof materialFilterSchema>;
