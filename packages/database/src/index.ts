// ============================================================
// @repo/database — MongoDB models & connection for SBMPNexus
// ============================================================

export { connectDB, disconnectDB, isDBConnected } from './connection.js';

// Models
export { User, type UserDocument } from './models/user.model.js';
export {
  University,
  College,
  Department,
  Course,
  Branch,
  Subject,
  Unit,
  Topic,
  type UniversityDocument,
  type CollegeDocument,
  type DepartmentDocument,
  type CourseDocument,
  type BranchDocument,
  type SubjectDocument,
  type UnitDocument,
  type TopicDocument,
} from './models/university.model.js';
export { Paper, type PaperDocument } from './models/paper.model.js';
export { Question, type QuestionDocument } from './models/question.model.js';
export { Material, type MaterialDocument } from './models/material.model.js';
export {
  Bookmark,
  Quiz,
  QuizAttempt,
  StudyPlan,
  AIConversationModel,
  Notification,
  Contribution,
  AuditLog,
  DownloadHistory,
  type BookmarkDocument,
  type QuizDocument,
  type QuizAttemptDocument,
  type StudyPlanDocument,
  type AIConversationDocument,
  type NotificationDocument,
  type ContributionDocument,
  type AuditLogDocument,
  type DownloadHistoryDocument,
} from './models/misc.model.js';
