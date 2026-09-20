import { z } from 'zod';

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResult<T = unknown> = ApiResponse<T> | ApiErrorResponse;

// ============================================================
// Pagination
// ============================================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// ============================================================
// Bookmark Types
// ============================================================

export const BookmarkResourceType = {
  PAPER: 'PAPER',
  QUESTION: 'QUESTION',
  MATERIAL: 'MATERIAL',
  TOPIC: 'TOPIC',
  AI_RESPONSE: 'AI_RESPONSE',
} as const;

export type BookmarkResourceType = (typeof BookmarkResourceType)[keyof typeof BookmarkResourceType];
export const BookmarkResourceTypeValues = Object.values(BookmarkResourceType) as [
  BookmarkResourceType,
  ...BookmarkResourceType[],
];

export interface IBookmark {
  _id: string;
  userId: string;
  resourceType: BookmarkResourceType;
  resourceId: string;
  folder?: string;
  note?: string;
  createdAt: Date;
}

export const createBookmarkSchema = z.object({
  resourceType: z.enum(BookmarkResourceTypeValues),
  resourceId: z.string().min(1),
  folder: z.string().max(100).optional(),
  note: z.string().max(500).optional(),
});

export type CreateBookmarkInput = z.infer<typeof createBookmarkSchema>;

// ============================================================
// Notification Types
// ============================================================

export const NotificationType = {
  NEW_PAPER: 'NEW_PAPER',
  CONTRIBUTION_APPROVED: 'CONTRIBUTION_APPROVED',
  CONTRIBUTION_REJECTED: 'CONTRIBUTION_REJECTED',
  STUDY_REMINDER: 'STUDY_REMINDER',
  QUIZ_RESULT: 'QUIZ_RESULT',
  EXAM_COUNTDOWN: 'EXAM_COUNTDOWN',
  ANNOUNCEMENT: 'ANNOUNCEMENT',
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export interface INotification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  resourceType?: string;
  resourceId?: string;
  isRead: boolean;
  createdAt: Date;
}

// ============================================================
// Contribution Types
// ============================================================

export const ContributionType = {
  PAPER: 'PAPER',
  NOTES: 'NOTES',
  SOLUTION: 'SOLUTION',
  QUESTION_BANK: 'QUESTION_BANK',
  STUDY_MATERIAL: 'STUDY_MATERIAL',
} as const;

export type ContributionType = (typeof ContributionType)[keyof typeof ContributionType];

export interface IContribution {
  _id: string;
  userId: string;
  type: ContributionType;
  resourceId: string;
  status: string; // ContentStatus
  moderatorId?: string;
  moderatorNote?: string;
  reputation: number; // XP earned for this contribution
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// Audit Log Types
// ============================================================

export interface IAuditLog {
  _id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// ============================================================
// Search Types
// ============================================================

export const SearchResourceType = {
  PAPER: 'PAPER',
  QUESTION: 'QUESTION',
  MATERIAL: 'MATERIAL',
  SUBJECT: 'SUBJECT',
  TOPIC: 'TOPIC',
} as const;

export type SearchResourceType = (typeof SearchResourceType)[keyof typeof SearchResourceType];

export interface SearchResult {
  type: SearchResourceType;
  id: string;
  title: string;
  description?: string;
  highlight?: string;
  metadata: Record<string, unknown>;
  score?: number;
}

export interface SearchSuggestion {
  text: string;
  type: SearchResourceType;
  count: number;
}

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(500),
  types: z.array(z.string()).optional(),
  universityId: z.string().optional(),
  courseId: z.string().optional(),
  branchId: z.string().optional(),
  semester: z.coerce.number().int().optional(),
  subjectId: z.string().optional(),
  year: z.coerce.number().int().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;

// ============================================================
// Download History Types
// ============================================================

export interface IDownloadHistory {
  _id: string;
  userId: string;
  resourceType: 'PAPER' | 'MATERIAL';
  resourceId: string;
  fileName: string;
  subjectName?: string;
  year?: number;
  downloadedAt: Date;
}
