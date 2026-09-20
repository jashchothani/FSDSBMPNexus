// ============================================================
// Application Constants
// ============================================================

export const APP_NAME = 'SBMPNexus';
export const APP_TAGLINE = 'Every Paper. Every Note. Every Semester.';
export const APP_DESCRIPTION =
  'Your AI-powered academic knowledge nexus. Discover question papers, notes, study material, and AI-powered exam preparation.';

// ============================================================
// File Upload Constants
// ============================================================

export const ALLOWED_PAPER_MIMES = [
  'application/pdf',
] as const;

export const ALLOWED_MATERIAL_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

// ============================================================
// Pagination
// ============================================================

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ============================================================
// Auth
// ============================================================

export const PASSWORD_SALT_ROUNDS = 12;
export const EMAIL_VERIFICATION_EXPIRY_HOURS = 24;
export const PASSWORD_RESET_EXPIRY_HOURS = 1;
export const MAX_REFRESH_TOKENS = 5; // Max active sessions per user

// ============================================================
// Rate Limiting
// ============================================================

export const AUTH_RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
} as const;

export const API_RATE_LIMIT = {
  windowMs: 15 * 60 * 1000,
  max: 100,
} as const;

export const AI_RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  max: 10,
} as const;

// ============================================================
// Gamification
// ============================================================

export const XP_VALUES = {
  VIEW_PAPER: 5,
  DOWNLOAD_PAPER: 2,
  COMPLETE_QUIZ: 20,
  PERFECT_QUIZ: 50,
  UPLOAD_PAPER: 100,
  UPLOAD_NOTES: 50,
  CONTRIBUTION_APPROVED: 200,
  DAILY_LOGIN: 10,
  STREAK_BONUS_7: 100,
  STREAK_BONUS_30: 500,
} as const;

export const BADGES = {
  PAPER_EXPLORER: { name: 'Paper Explorer', description: 'Viewed 10 papers', threshold: 10 },
  QUESTION_MASTER: { name: 'Question Master', description: 'Solved 100 questions', threshold: 100 },
  SEVEN_DAY_SCHOLAR: { name: '7-Day Scholar', description: 'Maintained a 7-day streak', threshold: 7 },
  REVISION_CHAMPION: { name: 'Revision Champion', description: 'Completed 20 quizzes', threshold: 20 },
  CONTRIBUTOR_BRONZE: { name: 'Bronze Contributor', description: 'First approved upload', threshold: 1 },
  CONTRIBUTOR_SILVER: { name: 'Silver Contributor', description: '10 approved uploads', threshold: 10 },
  CONTRIBUTOR_GOLD: { name: 'Gold Contributor', description: '50 approved uploads', threshold: 50 },
  PERFECTIONIST: { name: 'Perfectionist', description: 'Scored 100% on a quiz', threshold: 1 },
} as const;

// ============================================================
// AI
// ============================================================

export const AI_MAX_CONTEXT_TOKENS = 8000;
export const AI_MAX_RESPONSE_TOKENS = 4000;
export const AI_DEFAULT_TEMPERATURE = 0.3; // Low for factual academic content
export const AI_MAX_CONVERSATION_MESSAGES = 50;
export const AI_MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// ============================================================
// Search
// ============================================================

export const SEARCH_MIN_QUERY_LENGTH = 2;
export const SEARCH_MAX_SUGGESTIONS = 10;
export const SEARCH_DEBOUNCE_MS = 300;
