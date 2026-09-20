import mongoose, { Schema, type Document } from 'mongoose';
import type { IUniversity, ICollege, IDepartment, ICourse, IBranch, ISubject, IUnit, ITopic } from '@repo/types';

export interface UniversityDocument extends Omit<IUniversity, '_id'>, Document {}

const universitySchema = new Schema<UniversityDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    abbreviation: { type: String, required: true, trim: true, maxlength: 20 },
    location: {
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
    },
    logo: { type: String },
    website: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

universitySchema.index({ slug: 1 }, { unique: true });
universitySchema.index({ 'location.country': 1, 'location.state': 1 });

export const University = mongoose.model<UniversityDocument>('University', universitySchema);

export interface CollegeDocument extends Omit<ICollege, '_id'>, Document {}

const collegeSchema = new Schema<CollegeDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, lowercase: true, trim: true },
    universityId: { type: Schema.Types.ObjectId as any, ref: 'University', required: true, index: true },
    location: {
      city: { type: String, trim: true },
      state: { type: String, trim: true },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

collegeSchema.index({ universityId: 1, slug: 1 }, { unique: true });

export const College = mongoose.model<CollegeDocument>('College', collegeSchema);

export interface DepartmentDocument extends Omit<IDepartment, '_id'>, Document {}

const departmentSchema = new Schema<DepartmentDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, lowercase: true, trim: true },
    collegeId: { type: Schema.Types.ObjectId as any, ref: 'College', required: true, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

departmentSchema.index({ collegeId: 1, slug: 1 }, { unique: true });

export const Department = mongoose.model<DepartmentDocument>('Department', departmentSchema);

export interface CourseDocument extends Omit<ICourse, '_id'>, Document {}

const courseSchema = new Schema<CourseDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, lowercase: true, trim: true },
    abbreviation: { type: String, required: true, trim: true, maxlength: 20 },
    departmentId: { type: Schema.Types.ObjectId as any, ref: 'Department', required: true, index: true },
    durationYears: { type: Number, required: true, min: 1, max: 10 },
    totalSemesters: { type: Number, required: true, min: 1, max: 20 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

courseSchema.index({ departmentId: 1, slug: 1 }, { unique: true });

export const Course = mongoose.model<CourseDocument>('Course', courseSchema);

export interface BranchDocument extends Omit<IBranch, '_id'>, Document {}

const branchSchema = new Schema<BranchDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, lowercase: true, trim: true },
    abbreviation: { type: String, required: true, trim: true, maxlength: 20 },
    courseId: { type: Schema.Types.ObjectId as any, ref: 'Course', required: true, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

branchSchema.index({ courseId: 1, slug: 1 }, { unique: true });

export const Branch = mongoose.model<BranchDocument>('Branch', branchSchema);

export interface SubjectDocument extends Omit<ISubject, '_id'>, Document {}

const subjectSchema = new Schema<SubjectDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, lowercase: true, trim: true },
    code: { type: String, required: true, trim: true, maxlength: 20 },
    branchId: { type: Schema.Types.ObjectId as any, ref: 'Branch', required: true, index: true },
    semester: { type: Number, required: true, min: 1, max: 20 },
    credits: { type: Number, min: 0, max: 20 },
    description: { type: String, maxlength: 2000 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

subjectSchema.index({ branchId: 1, semester: 1 });
subjectSchema.index({ slug: 1 });
subjectSchema.index({ code: 1 });
subjectSchema.index({ name: 'text', code: 'text' });

export const Subject = mongoose.model<SubjectDocument>('Subject', subjectSchema);

export interface UnitDocument extends Omit<IUnit, '_id'>, Document {}

const unitSchema = new Schema<UnitDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    number: { type: Number, required: true, min: 1 },
    subjectId: { type: Schema.Types.ObjectId as any, ref: 'Subject', required: true, index: true },
    description: { type: String, maxlength: 2000 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

unitSchema.index({ subjectId: 1, number: 1 }, { unique: true });

export const Unit = mongoose.model<UnitDocument>('Unit', unitSchema);

export interface TopicDocument extends Omit<ITopic, '_id'>, Document {}

const topicSchema = new Schema<TopicDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, lowercase: true, trim: true },
    unitId: { type: Schema.Types.ObjectId as any, ref: 'Unit', required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId as any, ref: 'Subject', required: true, index: true },
    description: { type: String, maxlength: 2000 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

topicSchema.index({ unitId: 1 });
topicSchema.index({ subjectId: 1 });
topicSchema.index({ slug: 1 });
topicSchema.index({ name: 'text' });

export const Topic = mongoose.model<TopicDocument>('Topic', topicSchema);
