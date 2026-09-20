import { Router } from 'express';
import slugify from 'slugify';
import { University, College, Department, Course, Branch, Subject, Unit, Topic } from '@repo/database';
import { createUniversitySchema, createCollegeSchema, createCourseSchema, createBranchSchema, createSubjectSchema, createUnitSchema, createTopicSchema, createDepartmentSchema } from '@repo/types';
import { authenticate } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/rbac.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { Permission } from '@repo/config';
import { AppError } from '../middleware/error.middleware.js';

const router = Router();

// ============================================================
// Universities
// ============================================================

/** GET /api/universities */
router.get('/universities', async (_req, res, next) => {
  try {
    const universities = await University.find({ isActive: true })
      .sort({ name: 1 })
      .lean();
    res.json({ success: true, data: { universities } });
  } catch (error) { next(error); }
});

/** GET /api/universities/:id */
router.get('/universities/:id', async (req, res, next) => {
  try {
    const university = await University.findById(req.params.id).lean();
    if (!university) throw new AppError(404, 'NOT_FOUND', 'University not found');
    res.json({ success: true, data: { university } });
  } catch (error) { next(error); }
});

/** POST /api/universities — Admin only */
router.post(
  '/universities',
  authenticate,
  requirePermission(Permission.MANAGE_UNIVERSITIES),
  validateBody(createUniversitySchema),
  async (req, res, next) => {
    try {
      const slug = slugify(req.body.name, { lower: true, strict: true });
      const university = await University.create({ ...req.body, slug });
      res.status(201).json({ success: true, data: { university }, message: 'University created' });
    } catch (error) { next(error); }
  }
);

// ============================================================
// Colleges
// ============================================================

/** GET /api/colleges?universityId=... */
router.get('/colleges', async (req, res, next) => {
  try {
    const filter: Record<string, unknown> = { isActive: true };
    if (req.query.universityId) filter.universityId = req.query.universityId;
    const colleges = await College.find(filter).sort({ name: 1 }).lean();
    res.json({ success: true, data: { colleges } });
  } catch (error) { next(error); }
});

/** POST /api/colleges — Admin only */
router.post(
  '/colleges',
  authenticate,
  requirePermission(Permission.MANAGE_UNIVERSITIES),
  validateBody(createCollegeSchema),
  async (req, res, next) => {
    try {
      const slug = slugify(req.body.name, { lower: true, strict: true });
      const college = await College.create({ ...req.body, slug });
      res.status(201).json({ success: true, data: { college }, message: 'College created' });
    } catch (error) { next(error); }
  }
);

// ============================================================
// Departments
// ============================================================

/** GET /api/departments?collegeId=... */
router.get('/departments', async (req, res, next) => {
  try {
    const filter: Record<string, unknown> = { isActive: true };
    if (req.query.collegeId) filter.collegeId = req.query.collegeId;
    const departments = await Department.find(filter).sort({ name: 1 }).lean();
    res.json({ success: true, data: { departments } });
  } catch (error) { next(error); }
});

/** POST /api/departments — Admin only */
router.post(
  '/departments',
  authenticate,
  requirePermission(Permission.MANAGE_UNIVERSITIES),
  validateBody(createDepartmentSchema),
  async (req, res, next) => {
    try {
      const slug = slugify(req.body.name, { lower: true, strict: true });
      const department = await Department.create({ ...req.body, slug });
      res.status(201).json({ success: true, data: { department }, message: 'Department created' });
    } catch (error) { next(error); }
  }
);

// ============================================================
// Courses
// ============================================================

/** GET /api/courses?departmentId=... */
router.get('/courses', async (req, res, next) => {
  try {
    const filter: Record<string, unknown> = { isActive: true };
    if (req.query.departmentId) filter.departmentId = req.query.departmentId;
    const courses = await Course.find(filter).sort({ name: 1 }).lean();
    res.json({ success: true, data: { courses } });
  } catch (error) { next(error); }
});

/** POST /api/courses — Admin only */
router.post(
  '/courses',
  authenticate,
  requirePermission(Permission.MANAGE_COURSES),
  validateBody(createCourseSchema),
  async (req, res, next) => {
    try {
      const slug = slugify(req.body.name, { lower: true, strict: true });
      const course = await Course.create({ ...req.body, slug });
      res.status(201).json({ success: true, data: { course }, message: 'Course created' });
    } catch (error) { next(error); }
  }
);

// ============================================================
// Branches
// ============================================================

/** GET /api/branches?courseId=... */
router.get('/branches', async (req, res, next) => {
  try {
    const filter: Record<string, unknown> = { isActive: true };
    if (req.query.courseId) filter.courseId = req.query.courseId;
    const branches = await Branch.find(filter).sort({ name: 1 }).lean();
    res.json({ success: true, data: { branches } });
  } catch (error) { next(error); }
});

/** POST /api/branches — Admin only */
router.post(
  '/branches',
  authenticate,
  requirePermission(Permission.MANAGE_COURSES),
  validateBody(createBranchSchema),
  async (req, res, next) => {
    try {
      const slug = slugify(req.body.name, { lower: true, strict: true });
      const branch = await Branch.create({ ...req.body, slug });
      res.status(201).json({ success: true, data: { branch }, message: 'Branch created' });
    } catch (error) { next(error); }
  }
);

// ============================================================
// Subjects
// ============================================================

/** GET /api/subjects?branchId=...&semester=... */
router.get('/subjects', async (req, res, next) => {
  try {
    const filter: Record<string, unknown> = { isActive: true };
    if (req.query.branchId) filter.branchId = req.query.branchId;
    if (req.query.semester) filter.semester = Number(req.query.semester);
    const subjects = await Subject.find(filter).sort({ semester: 1, name: 1 }).lean();
    res.json({ success: true, data: { subjects } });
  } catch (error) { next(error); }
});

/** GET /api/subjects/:id */
router.get('/subjects/:id', async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id).lean();
    if (!subject) throw new AppError(404, 'NOT_FOUND', 'Subject not found');
    res.json({ success: true, data: { subject } });
  } catch (error) { next(error); }
});

/** POST /api/subjects — Admin only */
router.post(
  '/subjects',
  authenticate,
  requirePermission(Permission.MANAGE_SUBJECTS),
  validateBody(createSubjectSchema),
  async (req, res, next) => {
    try {
      const slug = slugify(req.body.name, { lower: true, strict: true });
      const subject = await Subject.create({ ...req.body, slug });
      res.status(201).json({ success: true, data: { subject }, message: 'Subject created' });
    } catch (error) { next(error); }
  }
);

// ============================================================
// Units
// ============================================================

/** GET /api/units?subjectId=... */
router.get('/units', async (req, res, next) => {
  try {
    const filter: Record<string, unknown> = { isActive: true };
    if (req.query.subjectId) filter.subjectId = req.query.subjectId;
    const units = await Unit.find(filter).sort({ number: 1 }).lean();
    res.json({ success: true, data: { units } });
  } catch (error) { next(error); }
});

/** POST /api/units — Admin only */
router.post(
  '/units',
  authenticate,
  requirePermission(Permission.MANAGE_SUBJECTS),
  validateBody(createUnitSchema),
  async (req, res, next) => {
    try {
      const unit = await Unit.create(req.body);
      res.status(201).json({ success: true, data: { unit }, message: 'Unit created' });
    } catch (error) { next(error); }
  }
);

// ============================================================
// Topics
// ============================================================

/** GET /api/topics?subjectId=...&unitId=... */
router.get('/topics', async (req, res, next) => {
  try {
    const filter: Record<string, unknown> = { isActive: true };
    if (req.query.subjectId) filter.subjectId = req.query.subjectId;
    if (req.query.unitId) filter.unitId = req.query.unitId;
    const topics = await Topic.find(filter).sort({ name: 1 }).lean();
    res.json({ success: true, data: { topics } });
  } catch (error) { next(error); }
});

/** POST /api/topics — Admin only */
router.post(
  '/topics',
  authenticate,
  requirePermission(Permission.MANAGE_SUBJECTS),
  validateBody(createTopicSchema),
  async (req, res, next) => {
    try {
      const slug = slugify(req.body.name, { lower: true, strict: true });
      const topic = await Topic.create({ ...req.body, slug });
      res.status(201).json({ success: true, data: { topic }, message: 'Topic created' });
    } catch (error) { next(error); }
  }
);

export { router as academicRoutes };
