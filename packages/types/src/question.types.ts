import { z } from 'zod';

// ============================================================
// Question Types
// ============================================================

export const Difficulty = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
} as const;

export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];
export const DifficultyValues = Object.values(Difficulty) as [Difficulty, ...Difficulty[]];

export const QuestionType = {
  SHORT_ANSWER: 'SHORT_ANSWER',
  LONG_ANSWER: 'LONG_ANSWER',
  MCQ: 'MCQ',
  TRUE_FALSE: 'TRUE_FALSE',
  NUMERICAL: 'NUMERICAL',
  DIAGRAM: 'DIAGRAM',
  CASE_STUDY: 'CASE_STUDY',
  OTHER: 'OTHER',
} as const;

export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType];
export const QuestionTypeValues = Object.values(QuestionType) as [QuestionType, ...QuestionType[]];

export interface IQuestion {
  _id: string;
  text: string;
  subjectId: string;
  paperId?: string;
  unitId?: string;
  topicIds: string[];
  marks?: number;
  questionNumber?: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  year?: number;
  examType?: string;
  frequency: number; // How many times this question appeared
  similarQuestionIds: string[];
  embedding?: number[]; // Vector embedding for semantic search
  tags: string[];
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuestionFrequency {
  questionText: string;
  topic: string;
  appearances: {
    year: number;
    examType: string;
    paperId: string;
    wordingVariation: string;
  }[];
  totalAppearances: number;
  isFrequentlyAsked: boolean;
}

// ============================================================
// Validation Schemas
// ============================================================

export const createQuestionSchema = z.object({
  text: z.string().min(5).max(5000),
  subjectId: z.string().min(1),
  paperId: z.string().optional(),
  unitId: z.string().optional(),
  topicIds: z.array(z.string()).default([]),
  marks: z.number().int().min(1).max(100).optional(),
  questionNumber: z.string().max(20).optional(),
  questionType: z.enum(QuestionTypeValues).default('OTHER'),
  difficulty: z.enum(DifficultyValues).default('MEDIUM'),
  year: z.number().int().min(1990).max(2100).optional(),
  examType: z.string().max(50).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

export const questionFilterSchema = z.object({
  subjectId: z.string().optional(),
  unitId: z.string().optional(),
  topicId: z.string().optional(),
  difficulty: z.enum(DifficultyValues).optional(),
  questionType: z.enum(QuestionTypeValues).optional(),
  marks: z.coerce.number().int().optional(),
  year: z.coerce.number().int().optional(),
  minFrequency: z.coerce.number().int().min(1).optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['frequency', 'year', 'marks', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type QuestionFilterInput = z.infer<typeof questionFilterSchema>;
