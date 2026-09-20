// ============================================================
// @repo/types — Shared TypeScript types for SBMPNexus
// ============================================================

// User & Auth
export {
  UserRole,
  UserRoleValues,
  AuthProvider,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type RegisterInput,
  type LoginInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type UserGamification,
  type UserPreferences,
  type IUser,
  type IUserPublic,
  type AuthTokens,
  type JWTPayload,
} from './user.types.js';

// Academic Hierarchy
export {
  type IUniversity,
  type ICollege,
  type IDepartment,
  type ICourse,
  type IBranch,
  type ISubject,
  type IUnit,
  type ITopic,
  createUniversitySchema,
  createCollegeSchema,
  createDepartmentSchema,
  createCourseSchema,
  createBranchSchema,
  createSubjectSchema,
  createUnitSchema,
  createTopicSchema,
  type CreateUniversityInput,
  type CreateCollegeInput,
  type CreateDepartmentInput,
  type CreateCourseInput,
  type CreateBranchInput,
  type CreateSubjectInput,
  type CreateUnitInput,
  type CreateTopicInput,
} from './university.types.js';

// Papers
export {
  ExamType,
  ExamTypeValues,
  ContentStatus,
  ContentStatusValues,
  type IPaper,
  uploadPaperSchema,
  paperFilterSchema,
  type UploadPaperInput,
  type PaperFilterInput,
} from './paper.types.js';

// Questions
export {
  Difficulty,
  DifficultyValues,
  QuestionType,
  QuestionTypeValues,
  type IQuestion,
  type IQuestionFrequency,
  createQuestionSchema,
  questionFilterSchema,
  type CreateQuestionInput,
  type QuestionFilterInput,
} from './question.types.js';

// Materials
export {
  MaterialType,
  MaterialTypeValues,
  FileType,
  FileTypeValues,
  type IMaterial,
  uploadMaterialSchema,
  materialFilterSchema,
  type UploadMaterialInput,
  type MaterialFilterInput,
} from './material.types.js';

// Quiz & Study Plans
export {
  QuizQuestionType,
  QuizQuestionTypeValues,
  type IQuizQuestion,
  type IQuiz,
  type IQuizAttempt,
  type IStudyPlanDay,
  type IStudyPlan,
  generateQuizSchema,
  submitQuizSchema,
  createStudyPlanSchema,
  type GenerateQuizInput,
  type SubmitQuizInput,
  type CreateStudyPlanInput,
} from './quiz.types.js';

// AI
export {
  AIAnswerMode,
  AIAnswerModeValues,
  AISourceType,
  type AISource,
  type AIMessage,
  type AIConversation,
  type AIProviderConfig,
  type AICompletionRequest,
  type AICompletionResponse,
  type AIImageAnalysisRequest,
  type DocumentAnalysisResult,
  aiChatSchema,
  aiImageAnalysisSchema,
  aiDocumentAnalysisSchema,
  type AIChatInput,
  type AIImageAnalysisInput,
  type AIDocumentAnalysisInput,
} from './ai.types.js';

// API & Common
export {
  type ApiResponse,
  type ApiErrorResponse,
  type ApiResult,
  type PaginationMeta,
  type PaginatedResponse,
  BookmarkResourceType,
  BookmarkResourceTypeValues,
  type IBookmark,
  createBookmarkSchema,
  type CreateBookmarkInput,
  NotificationType,
  type INotification,
  ContributionType,
  type IContribution,
  type IAuditLog,
  SearchResourceType,
  type SearchResult,
  type SearchSuggestion,
  searchQuerySchema,
  type SearchQueryInput,
  type IDownloadHistory,
} from './api.types.js';
