import { z } from 'zod';

// ============================================================
// Quiz Types
// ============================================================

export const QuizQuestionType = {
  MCQ: 'MCQ',
  TRUE_FALSE: 'TRUE_FALSE',
  SHORT_ANSWER: 'SHORT_ANSWER',
  CONCEPTUAL: 'CONCEPTUAL',
} as const;

export type QuizQuestionType = (typeof QuizQuestionType)[keyof typeof QuizQuestionType];
export const QuizQuestionTypeValues = Object.values(QuizQuestionType) as [QuizQuestionType, ...QuizQuestionType[]];

export interface IQuizQuestion {
  question: string;
  type: QuizQuestionType;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  topicId?: string;
  difficulty: string;
  marks: number;
}

export interface IQuiz {
  _id: string;
  title: string;
  subjectId: string;
  topicIds: string[];
  difficulty: string;
  questionCount: number;
  questions: IQuizQuestion[];
  timeLimitMinutes: number;
  generatedBy: 'AI' | 'MANUAL';
  createdAt: Date;
}

export interface IQuizAttempt {
  _id: string;
  userId: string;
  quizId: string;
  subjectId: string;
  answers: {
    questionIndex: number;
    selectedAnswer: string;
    isCorrect: boolean;
    timeTakenSeconds: number;
  }[];
  score: number;
  totalMarks: number;
  accuracy: number;
  timeTakenSeconds: number;
  weakTopics: string[];
  strongTopics: string[];
  completedAt: Date;
  createdAt: Date;
}

// ============================================================
// Study Plan Types
// ============================================================

export interface IStudyPlanDay {
  day: number;
  date: string;
  topics: {
    topicId: string;
    topicName: string;
    unitName: string;
    estimatedMinutes: number;
    isCompleted: boolean;
    completedAt?: Date;
  }[];
  practiceQuestions: number;
  hasPreviousPaperReview: boolean;
}

export interface IStudyPlan {
  _id: string;
  userId: string;
  subjectId: string;
  universityId?: string;
  courseId?: string;
  examDate: Date;
  totalDays: number;
  plan: IStudyPlanDay[];
  progress: number; // 0-100 percentage
  isAdaptive: boolean;
  lastAdaptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// Validation Schemas
// ============================================================

export const generateQuizSchema = z.object({
  subjectId: z.string().min(1),
  topicIds: z.array(z.string()).optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  questionCount: z.number().int().min(5).max(50).default(10),
  questionTypes: z.array(z.enum(QuizQuestionTypeValues)).optional(),
  timeLimitMinutes: z.number().int().min(5).max(180).default(30),
});

export const submitQuizSchema = z.object({
  quizId: z.string().min(1),
  answers: z.array(
    z.object({
      questionIndex: z.number().int().min(0),
      selectedAnswer: z.string(),
      timeTakenSeconds: z.number().int().min(0),
    })
  ),
  timeTakenSeconds: z.number().int().min(0),
});

export const createStudyPlanSchema = z.object({
  subjectId: z.string().min(1),
  universityId: z.string().optional(),
  courseId: z.string().optional(),
  examDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

export type GenerateQuizInput = z.infer<typeof generateQuizSchema>;
export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
export type CreateStudyPlanInput = z.infer<typeof createStudyPlanSchema>;
