import { UserRole } from '@repo/types';

// ============================================================
// RBAC Permission System
// ============================================================

export const Permission = {
  // Content - Read
  VIEW_PAPERS: 'VIEW_PAPERS',
  VIEW_QUESTIONS: 'VIEW_QUESTIONS',
  VIEW_MATERIALS: 'VIEW_MATERIALS',
  VIEW_QUESTION_BANK: 'VIEW_QUESTION_BANK',

  // Content - Write
  UPLOAD_PAPER: 'UPLOAD_PAPER',
  UPLOAD_MATERIAL: 'UPLOAD_MATERIAL',
  CREATE_QUESTION: 'CREATE_QUESTION',

  // AI
  USE_AI_CHAT: 'USE_AI_CHAT',
  USE_AI_IMAGE: 'USE_AI_IMAGE',
  USE_AI_DOCUMENT: 'USE_AI_DOCUMENT',
  GENERATE_QUIZ: 'GENERATE_QUIZ',
  CREATE_STUDY_PLAN: 'CREATE_STUDY_PLAN',

  // Personal
  MANAGE_BOOKMARKS: 'MANAGE_BOOKMARKS',
  VIEW_ANALYTICS: 'VIEW_ANALYTICS',
  MANAGE_PROFILE: 'MANAGE_PROFILE',

  // Moderation
  MODERATE_CONTENT: 'MODERATE_CONTENT',
  APPROVE_CONTENT: 'APPROVE_CONTENT',
  REJECT_CONTENT: 'REJECT_CONTENT',
  FLAG_CONTENT: 'FLAG_CONTENT',
  MANAGE_REPORTS: 'MANAGE_REPORTS',

  // Admin - Users
  VIEW_ALL_USERS: 'VIEW_ALL_USERS',
  MANAGE_USERS: 'MANAGE_USERS',
  ASSIGN_ROLES: 'ASSIGN_ROLES',

  // Admin - Content
  MANAGE_UNIVERSITIES: 'MANAGE_UNIVERSITIES',
  MANAGE_COURSES: 'MANAGE_COURSES',
  MANAGE_SUBJECTS: 'MANAGE_SUBJECTS',
  DELETE_ANY_CONTENT: 'DELETE_ANY_CONTENT',

  // Admin - System
  VIEW_ADMIN_DASHBOARD: 'VIEW_ADMIN_DASHBOARD',
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
  MANAGE_SETTINGS: 'MANAGE_SETTINGS',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

/**
 * Role → Permission mapping.
 * Each role inherits all permissions listed here.
 * Roles are additive — higher roles include lower role permissions.
 */
const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  [UserRole.STUDENT]: [
    Permission.VIEW_PAPERS,
    Permission.VIEW_QUESTIONS,
    Permission.VIEW_MATERIALS,
    Permission.VIEW_QUESTION_BANK,
    Permission.USE_AI_CHAT,
    Permission.USE_AI_IMAGE,
    Permission.USE_AI_DOCUMENT,
    Permission.GENERATE_QUIZ,
    Permission.CREATE_STUDY_PLAN,
    Permission.MANAGE_BOOKMARKS,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_PROFILE,
    Permission.FLAG_CONTENT,
  ],

  [UserRole.CONTRIBUTOR]: [
    // All student permissions + upload
    Permission.VIEW_PAPERS,
    Permission.VIEW_QUESTIONS,
    Permission.VIEW_MATERIALS,
    Permission.VIEW_QUESTION_BANK,
    Permission.USE_AI_CHAT,
    Permission.USE_AI_IMAGE,
    Permission.USE_AI_DOCUMENT,
    Permission.GENERATE_QUIZ,
    Permission.CREATE_STUDY_PLAN,
    Permission.MANAGE_BOOKMARKS,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_PROFILE,
    Permission.FLAG_CONTENT,
    Permission.UPLOAD_PAPER,
    Permission.UPLOAD_MATERIAL,
    Permission.CREATE_QUESTION,
  ],

  [UserRole.FACULTY]: [
    // All contributor permissions
    Permission.VIEW_PAPERS,
    Permission.VIEW_QUESTIONS,
    Permission.VIEW_MATERIALS,
    Permission.VIEW_QUESTION_BANK,
    Permission.USE_AI_CHAT,
    Permission.USE_AI_IMAGE,
    Permission.USE_AI_DOCUMENT,
    Permission.GENERATE_QUIZ,
    Permission.CREATE_STUDY_PLAN,
    Permission.MANAGE_BOOKMARKS,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_PROFILE,
    Permission.FLAG_CONTENT,
    Permission.UPLOAD_PAPER,
    Permission.UPLOAD_MATERIAL,
    Permission.CREATE_QUESTION,
  ],

  [UserRole.MODERATOR]: [
    // All faculty permissions + moderation
    Permission.VIEW_PAPERS,
    Permission.VIEW_QUESTIONS,
    Permission.VIEW_MATERIALS,
    Permission.VIEW_QUESTION_BANK,
    Permission.USE_AI_CHAT,
    Permission.USE_AI_IMAGE,
    Permission.USE_AI_DOCUMENT,
    Permission.GENERATE_QUIZ,
    Permission.CREATE_STUDY_PLAN,
    Permission.MANAGE_BOOKMARKS,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_PROFILE,
    Permission.FLAG_CONTENT,
    Permission.UPLOAD_PAPER,
    Permission.UPLOAD_MATERIAL,
    Permission.CREATE_QUESTION,
    Permission.MODERATE_CONTENT,
    Permission.APPROVE_CONTENT,
    Permission.REJECT_CONTENT,
    Permission.MANAGE_REPORTS,
    Permission.VIEW_ALL_USERS,
  ],

  [UserRole.ADMIN]: [
    // All permissions
    ...Object.values(Permission),
  ],
};

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions?.includes(permission) ?? false;
}

/**
 * Get all permissions for a role.
 */
export function getRolePermissions(role: UserRole): readonly Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Check if a role has ALL of the specified permissions.
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Check if a role has ANY of the specified permissions.
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}
