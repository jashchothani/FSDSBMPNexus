import { z } from 'zod';

// ============================================================
// AI Types
// ============================================================

export const AIAnswerMode = {
  SIMPLE_EXPLANATION: 'SIMPLE_EXPLANATION',
  QUICK_REVISION: 'QUICK_REVISION',
  TWO_MARK: 'TWO_MARK',
  FIVE_MARK: 'FIVE_MARK',
  TEN_MARK: 'TEN_MARK',
  DETAILED: 'DETAILED',
  VIVA_PREP: 'VIVA_PREP',
} as const;

export type AIAnswerMode = (typeof AIAnswerMode)[keyof typeof AIAnswerMode];
export const AIAnswerModeValues = Object.values(AIAnswerMode) as [AIAnswerMode, ...AIAnswerMode[]];

export const AISourceType = {
  DATABASE: 'DATABASE',
  GENERATED: 'GENERATED',
  UNCERTAIN: 'UNCERTAIN',
} as const;

export type AISourceType = (typeof AISourceType)[keyof typeof AISourceType];

export interface AISource {
  type: AISourceType;
  title: string;
  resourceType: 'paper' | 'question' | 'material' | 'topic';
  resourceId: string;
  url?: string;
  relevanceScore?: number;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  imageUrl?: string;
  sources?: AISource[];
  answerMode?: AIAnswerMode;
  suggestedQuestions?: string[];
  relatedResources?: AISource[];
  timestamp: Date;
}

export interface AIConversation {
  _id: string;
  userId: string;
  title: string;
  messages: AIMessage[];
  subjectId?: string;
  contextTopicIds?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AIProviderConfig {
  provider: 'nvidia' | 'mock' | 'local';
  textModel: string;
  visionModel?: string;
  baseUrl: string;
  apiKey?: string;
  maxTokens: number;
  temperature: number;
}

export interface AICompletionRequest {
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface AICompletionResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

export interface AIImageAnalysisRequest {
  imageBase64: string;
  prompt: string;
  mimeType: string;
}

export interface DocumentAnalysisResult {
  questions: {
    text: string;
    questionNumber?: string;
    marks?: number;
    estimatedType: string;
  }[];
  topics: string[];
  units: string[];
  difficulty: string;
  metadata: {
    totalQuestions: number;
    estimatedMarks: number;
    subjectHints: string[];
  };
}

// ============================================================
// Validation Schemas
// ============================================================

export const aiChatSchema = z.object({
  message: z.string().min(1).max(10000),
  conversationId: z.string().optional(),
  answerMode: z.enum(AIAnswerModeValues).optional(),
  subjectId: z.string().optional(),
  usePlatformSources: z.boolean().default(true),
});

export const aiImageAnalysisSchema = z.object({
  prompt: z.string().min(1).max(2000).optional(),
  subjectId: z.string().optional(),
});

export const aiDocumentAnalysisSchema = z.object({
  subjectId: z.string().optional(),
  extractQuestions: z.boolean().default(true),
  identifyTopics: z.boolean().default(true),
  findSimilar: z.boolean().default(true),
});

export type AIChatInput = z.infer<typeof aiChatSchema>;
export type AIImageAnalysisInput = z.infer<typeof aiImageAnalysisSchema>;
export type AIDocumentAnalysisInput = z.infer<typeof aiDocumentAnalysisSchema>;
