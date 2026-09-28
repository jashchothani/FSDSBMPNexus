import mongoose, { Schema, type Document } from 'mongoose';
import type { IBookmark, INotification, IContribution, IAuditLog, IDownloadHistory } from '@repo/types';
import type { IQuiz, IQuizAttempt, IStudyPlan, AIConversation } from '@repo/types';

export interface BookmarkDocument extends Omit<IBookmark, '_id'>, Document {}

const bookmarkSchema = new Schema<BookmarkDocument>(
  {
    userId: { type: Schema.Types.ObjectId as any, ref: 'User', required: true, index: true },
    resourceType: {
      type: String,
      enum: ['PAPER', 'QUESTION', 'MATERIAL', 'TOPIC', 'AI_RESPONSE'],
      required: true,
    },
    resourceId: { type: Schema.Types.ObjectId as any, required: true },
    folder: { type: String, maxlength: 100, default: 'Default' },
    note: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

bookmarkSchema.index({ userId: 1, resourceId: 1 }, { unique: true });
bookmarkSchema.index({ userId: 1, resourceType: 1 });
bookmarkSchema.index({ userId: 1, folder: 1 });

export const Bookmark = mongoose.model<BookmarkDocument>('Bookmark', bookmarkSchema);

export interface QuizDocument extends Omit<IQuiz, '_id'>, Document {}

const quizSchema = new Schema<QuizDocument>(
  {
    title: { type: String, required: true },
    subjectId: { type: Schema.Types.ObjectId as any, ref: 'Subject', required: true },
    topicIds: [{ type: Schema.Types.ObjectId as any, ref: 'Topic' }],
    difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], required: true },
    questionCount: { type: Number, required: true },
    questions: [
      {
        question: { type: String, required: true },
        type: { type: String, enum: ['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'CONCEPTUAL'], required: true },
        options: [String],
        correctAnswer: { type: String, required: true },
        explanation: String,
        topicId: { type: Schema.Types.ObjectId as any, ref: 'Topic' },
        difficulty: String,
        marks: { type: Number, default: 1 },
      },
    ],
    timeLimitMinutes: { type: Number, required: true },
    generatedBy: { type: String, enum: ['AI', 'MANUAL'], default: 'AI' },
  },
  { timestamps: true }
);

export const Quiz = mongoose.model<QuizDocument>('Quiz', quizSchema);

export interface QuizAttemptDocument extends Omit<IQuizAttempt, '_id'>, Document {}

const quizAttemptSchema = new Schema<QuizAttemptDocument>(
  {
    userId: { type: Schema.Types.ObjectId as any, ref: 'User', required: true, index: true },
    quizId: { type: Schema.Types.ObjectId as any, ref: 'Quiz', required: true },
    subjectId: { type: Schema.Types.ObjectId as any, ref: 'Subject', required: true },
    answers: [
      {
        questionIndex: Number,
        selectedAnswer: String,
        isCorrect: Boolean,
        timeTakenSeconds: Number,
      },
    ],
    score: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    timeTakenSeconds: { type: Number, required: true },
    weakTopics: [{ type: Schema.Types.ObjectId as any, ref: 'Topic' }],
    strongTopics: [{ type: Schema.Types.ObjectId as any, ref: 'Topic' }],
    completedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

quizAttemptSchema.index({ userId: 1, subjectId: 1 });
quizAttemptSchema.index({ userId: 1, createdAt: -1 });

export const QuizAttempt = mongoose.model<QuizAttemptDocument>('QuizAttempt', quizAttemptSchema);

export interface StudyPlanDocument extends Omit<IStudyPlan, '_id'>, Document {}

const studyPlanSchema = new Schema<StudyPlanDocument>(
  {
    userId: { type: Schema.Types.ObjectId as any, ref: 'User', required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId as any, ref: 'Subject', required: true },
    universityId: { type: Schema.Types.ObjectId as any, ref: 'University' },
    courseId: { type: Schema.Types.ObjectId as any, ref: 'Course' },
    examDate: { type: Date, required: true },
    totalDays: { type: Number, required: true },
    plan: [
      {
        day: Number,
        date: String,
        topics: [
          {
            topicId: { type: Schema.Types.ObjectId as any, ref: 'Topic' },
            topicName: String,
            unitName: String,
            estimatedMinutes: Number,
            isCompleted: { type: Boolean, default: false },
            completedAt: Date,
          },
        ],
        practiceQuestions: { type: Number, default: 0 },
        hasPreviousPaperReview: { type: Boolean, default: false },
      },
    ],
    progress: { type: Number, default: 0 },
    isAdaptive: { type: Boolean, default: true },
    lastAdaptedAt: { type: Date },
  },
  { timestamps: true }
);

export const StudyPlan = mongoose.model<StudyPlanDocument>('StudyPlan', studyPlanSchema);

export interface AIConversationDocument extends Omit<AIConversation, '_id'>, Document {}

const aiConversationSchema = new Schema<AIConversationDocument>(
  {
    userId: { type: Schema.Types.ObjectId as any, ref: 'User', required: true, index: true },
    title: { type: String, required: true, default: 'New Conversation' },
    messages: [
      {
        id: { type: String, required: true },
        role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
        content: { type: String, required: true },
        imageUrl: String,
        sources: [
          {
            type: { type: String, enum: ['DATABASE', 'GENERATED', 'UNCERTAIN'] },
            title: String,
            resourceType: { type: String, enum: ['paper', 'question', 'material', 'topic'] },
            resourceId: { type: Schema.Types.ObjectId as any },
            url: String,
            relevanceScore: Number,
          },
        ],
        answerMode: String,
        suggestedQuestions: [String],
        relatedResources: [
          {
            type: { type: String },
            title: String,
            resourceType: String,
            resourceId: { type: Schema.Types.ObjectId as any },
          },
        ],
        timestamp: { type: Date, default: Date.now },
      },
    ],
    subjectId: { type: Schema.Types.ObjectId as any, ref: 'Subject' },
    contextTopicIds: [{ type: Schema.Types.ObjectId as any, ref: 'Topic' }],
  },
  { timestamps: true }
);

aiConversationSchema.index({ userId: 1, updatedAt: -1 });

export const AIConversationModel = mongoose.model<AIConversationDocument>(
  'AIConversation',
  aiConversationSchema
);

export interface NotificationDocument extends Omit<INotification, '_id'>, Document {
  link?: string;
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId as any, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'NEW_PAPER',
        'CONTRIBUTION_APPROVED',
        'CONTRIBUTION_REJECTED',
        'STUDY_REMINDER',
        'QUIZ_RESULT',
        'EXAM_COUNTDOWN',
        'ANNOUNCEMENT',
        'ROOM_INVITE',
        'CLASH_CHALLENGE',
        'MATCH_RESULT',
        'MESSAGE',
        'SYSTEM',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    resourceType: String,
    resourceId: { type: Schema.Types.ObjectId as any },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<NotificationDocument>('Notification', notificationSchema);

export interface ContributionDocument extends Omit<IContribution, '_id'>, Document {}

const contributionSchema = new Schema<ContributionDocument>(
  {
    userId: { type: Schema.Types.ObjectId as any, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['PAPER', 'NOTES', 'SOLUTION', 'QUESTION_BANK', 'STUDY_MATERIAL'],
      required: true,
    },
    resourceId: { type: Schema.Types.ObjectId as any, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'APPROVED', 'REJECTED', 'FLAGGED'],
      default: 'PENDING',
      index: true,
    },
    moderatorId: { type: Schema.Types.ObjectId as any, ref: 'User' },
    moderatorNote: { type: String, maxlength: 1000 },
    reputation: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Contribution = mongoose.model<ContributionDocument>('Contribution', contributionSchema);

export interface AuditLogDocument extends Omit<IAuditLog, '_id'>, Document {}

const auditLogSchema = new Schema<AuditLogDocument>(
  {
    userId: { type: Schema.Types.ObjectId as any, ref: 'User', required: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: { type: Schema.Types.ObjectId as any },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<AuditLogDocument>('AuditLog', auditLogSchema);

export interface DownloadHistoryDocument extends Omit<IDownloadHistory, '_id'>, Document {}

const downloadHistorySchema = new Schema<DownloadHistoryDocument>({
  userId: { type: Schema.Types.ObjectId as any, ref: 'User', required: true, index: true },
  resourceType: { type: String, enum: ['PAPER', 'MATERIAL'], required: true },
  resourceId: { type: Schema.Types.ObjectId as any, required: true },
  fileName: { type: String, required: true },
  subjectName: String,
  year: Number,
  downloadedAt: { type: Date, default: Date.now },
});

downloadHistorySchema.index({ userId: 1, downloadedAt: -1 });

export const DownloadHistory = mongoose.model<DownloadHistoryDocument>(
  'DownloadHistory',
  downloadHistorySchema
);
