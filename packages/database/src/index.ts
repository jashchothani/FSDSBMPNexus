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

// Arena & Chat Models
export { Conversation, type ConversationDocument } from './models/conversation.model.js';
export { Message, Message as ChatMessage, type MessageDocument } from './models/message.model.js';
export { Room, Room as ArenaRoom, RoomMember, type RoomDocument, type RoomMemberDocument } from './models/room.model.js';
export { Problem, type ProblemDocument } from './models/problem.model.js';
export { Submission, type SubmissionDocument } from './models/submission.model.js';
export { Match, type MatchDocument } from './models/match.model.js';
export { Achievement, UserAchievement, type AchievementDocument, type UserAchievementDocument } from './models/achievement.model.js';
export { XPTransaction, type XPTransactionDocument } from './models/xp-transaction.model.js';
export { Leaderboard, type LeaderboardDocument } from './models/leaderboard.model.js';
export { Curriculum, type CurriculumDocument } from './models/curriculum.model.js';


