import { z } from 'zod';

// ============================================================
// Paper Types
// ============================================================

export const ExamType = {
  MID_SEM: 'MID_SEM',
  END_SEM: 'END_SEM',
  SUPPLEMENTARY: 'SUPPLEMENTARY',
  INTERNAL: 'INTERNAL',
  PRACTICE: 'PRACTICE',
  OTHER: 'OTHER',
} as const;

export type ExamType = (typeof ExamType)[keyof typeof ExamType];
export const ExamTypeValues = Object.values(ExamType) as [ExamType, ...ExamType[]];

export const ContentStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  FLAGGED: 'FLAGGED',
} as const;

export type ContentStatus = (typeof ContentStatus)[keyof typeof ContentStatus];
export const ContentStatusValues = Object.values(ContentStatus) as [ContentStatus, ...ContentStatus[]];

export interface IPaper {
  _id: string;
  subjectId: string;
  universityId: string;
  courseId?: string;
  branchId?: string;
  semester: number;
  year: number;
  examType: ExamType;
  title?: string;
  fileUrl: string;
  fileKey: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  pageCount?: number;
  thumbnailUrl?: string;
  hasSolutions: boolean;
  solutionFileUrl?: string;
  status: ContentStatus;
  uploadedBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  views: number;
  downloads: number;
  bookmarkCount: number;
  isVerified: boolean;
  tags: string[];
  processingStatus?: {
    textExtracted: boolean;
    questionsExtracted: boolean;
    topicsIdentified: boolean;
    similarityChecked: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// Validation Schemas
// ============================================================

export const uploadPaperSchema = z.object({
  subjectId: z.string().min(1),
  universityId: z.string().min(1),
  courseId: z.string().optional(),
  branchId: z.string().optional(),
  semester: z.number().int().min(1).max(20),
  year: z.number().int().min(1990).max(2100),
  examType: z.enum(ExamTypeValues),
  title: z.string().max(300).optional(),
  hasSolutions: z.boolean().default(false),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

export const paperFilterSchema = z.object({
  subjectId: z.string().optional(),
  universityId: z.string().optional(),
  courseId: z.string().optional(),
  branchId: z.string().optional(),
  semester: z.coerce.number().int().min(1).max(20).optional(),
  year: z.coerce.number().int().min(1990).max(2100).optional(),
  examType: z.enum(ExamTypeValues).optional(),
  status: z.enum(ContentStatusValues).optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['year', 'createdAt', 'views', 'downloads']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type UploadPaperInput = z.infer<typeof uploadPaperSchema>;
export type PaperFilterInput = z.infer<typeof paperFilterSchema>;
