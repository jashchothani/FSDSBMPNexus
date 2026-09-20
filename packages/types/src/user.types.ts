import { z } from 'zod';

// ============================================================
// Role & Permission Types
// ============================================================

export const UserRole = {
  STUDENT: 'STUDENT',
  CONTRIBUTOR: 'CONTRIBUTOR',
  FACULTY: 'FACULTY',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserRoleValues = Object.values(UserRole) as [UserRole, ...UserRole[]];

export const AuthProvider = {
  LOCAL: 'LOCAL',
  GOOGLE: 'GOOGLE',
} as const;

export type AuthProvider = (typeof AuthProvider)[keyof typeof AuthProvider];

// ============================================================
// Schemas
// ============================================================

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one digit'
    ),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ============================================================
// User Interfaces
// ============================================================

export interface UserGamification {
  xp: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  badges: string[];
  papersViewed: number;
  questionsSolved: number;
  quizzesCompleted: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    newPaper: boolean;
    contributorApproval: boolean;
    studyReminders: boolean;
    quizResults: boolean;
    examCountdown: boolean;
    announcements: boolean;
  };
  defaultUniversityId?: string;
  defaultCourseId?: string;
  defaultSemester?: number;
}

export interface IUser {
  _id: string;
  email: string;
  passwordHash?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  authProvider: AuthProvider;
  googleId?: string;
  avatar?: string;
  bio?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshTokens: string[];
  preferences: UserPreferences;
  gamification: UserGamification;
  universityId?: string;
  courseId?: string;
  currentSemester?: number;
  contributorReputation: number;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type IUserPublic = Omit<
  IUser,
  | 'passwordHash'
  | 'refreshTokens'
  | 'emailVerificationToken'
  | 'emailVerificationExpires'
  | 'passwordResetToken'
  | 'passwordResetExpires'
>;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}
