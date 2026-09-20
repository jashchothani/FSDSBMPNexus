import { z } from 'zod';

// ============================================================
// Academic Hierarchy Types
// ============================================================

export interface IUniversity {
  _id: string;
  name: string;
  slug: string;
  abbreviation: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  logo?: string;
  website?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICollege {
  _id: string;
  name: string;
  slug: string;
  universityId: string;
  location?: {
    city: string;
    state: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDepartment {
  _id: string;
  name: string;
  slug: string;
  collegeId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourse {
  _id: string;
  name: string;
  slug: string;
  abbreviation: string;
  departmentId: string;
  durationYears: number;
  totalSemesters: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBranch {
  _id: string;
  name: string;
  slug: string;
  abbreviation: string;
  courseId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubject {
  _id: string;
  name: string;
  slug: string;
  code: string;
  branchId: string;
  semester: number;
  credits?: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUnit {
  _id: string;
  name: string;
  number: number;
  subjectId: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITopic {
  _id: string;
  name: string;
  slug: string;
  unitId: string;
  subjectId: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// Validation Schemas
// ============================================================

export const createUniversitySchema = z.object({
  name: z.string().min(2).max(200),
  abbreviation: z.string().min(1).max(20),
  location: z.object({
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    country: z.string().min(1).max(100),
  }),
  website: z.string().url().optional(),
});

export const createCollegeSchema = z.object({
  name: z.string().min(2).max(200),
  universityId: z.string().min(1),
  location: z
    .object({
      city: z.string().max(100).optional(),
      state: z.string().max(100).optional(),
    })
    .optional(),
});

export const createDepartmentSchema = z.object({
  name: z.string().min(2).max(200),
  collegeId: z.string().min(1),
});

export const createCourseSchema = z.object({
  name: z.string().min(2).max(200),
  abbreviation: z.string().min(1).max(20),
  departmentId: z.string().min(1),
  durationYears: z.number().int().min(1).max(10),
  totalSemesters: z.number().int().min(1).max(20),
});

export const createBranchSchema = z.object({
  name: z.string().min(2).max(200),
  abbreviation: z.string().min(1).max(20),
  courseId: z.string().min(1),
});

export const createSubjectSchema = z.object({
  name: z.string().min(2).max(200),
  code: z.string().min(1).max(20),
  branchId: z.string().min(1),
  semester: z.number().int().min(1).max(20),
  credits: z.number().int().min(0).max(20).optional(),
  description: z.string().max(2000).optional(),
});

export const createUnitSchema = z.object({
  name: z.string().min(1).max(200),
  number: z.number().int().min(1),
  subjectId: z.string().min(1),
  description: z.string().max(2000).optional(),
});

export const createTopicSchema = z.object({
  name: z.string().min(1).max(200),
  unitId: z.string().min(1),
  subjectId: z.string().min(1),
  description: z.string().max(2000).optional(),
});

export type CreateUniversityInput = z.infer<typeof createUniversitySchema>;
export type CreateCollegeInput = z.infer<typeof createCollegeSchema>;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type CreateUnitInput = z.infer<typeof createUnitSchema>;
export type CreateTopicInput = z.infer<typeof createTopicSchema>;
