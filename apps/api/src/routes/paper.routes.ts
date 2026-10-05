import { Router } from 'express';
import { Paper, Question, Subject } from '@repo/database';
import { paperFilterSchema } from '@repo/types';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/rbac.middleware.js';
import { validateQuery } from '../middleware/validation.middleware.js';
import { Permission } from '@repo/config';
import { AppError } from '../middleware/error.middleware.js';
import type { PaginatedResponse, IPaper } from '@repo/types';

const router = Router();

/**
 * GET /api/papers
 * List papers with filtering and pagination.
 */
router.get('/', validateQuery(paperFilterSchema), async (req, res, next) => {
  try {
    const {
      subjectId, universityId, courseId, branchId, semester,
      year, examType, status, search,
      page, limit, sortBy, sortOrder,
    } = req.query as Record<string, string | number | undefined>;

    // Build filter
    const filter: Record<string, unknown> = {};

    // Only show approved papers to non-admin users
    filter.status = status || 'APPROVED';

    if (subjectId) filter.subjectId = subjectId;
    if (universityId) filter.universityId = universityId;
    if (courseId) filter.courseId = courseId;
    if (branchId) filter.branchId = branchId;
    if (semester) filter.semester = Number(semester);
    if (year) filter.year = Number(year);
    if (examType) filter.examType = examType;

    // Text search
    if (search && typeof search === 'string') {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const sortObj: Record<string, 1 | -1> = {};
    sortObj[String(sortBy) || 'createdAt'] = sortOrder === 'asc' ? 1 : -1;

    const [papers, total] = await Promise.all([
      Paper.find(filter)
        .populate('subjectId', 'name slug code')
        .populate('universityId', 'name abbreviation')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Paper.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    const response: PaginatedResponse<IPaper> = {
      items: papers as unknown as IPaper[],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    };

    res.json({ success: true, data: response });
  } catch (error) { next(error); }
});

/**
 * GET /api/papers/:id
 * Get a single paper with details.
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const paper = await Paper.findById(req.params.id)
      .populate('subjectId', 'name slug code semester')
      .populate('universityId', 'name abbreviation')
      .populate('uploadedBy', 'firstName lastName')
      .lean();

    if (!paper) throw new AppError(404, 'NOT_FOUND', 'Paper not found');

    // Increment view count
    await Paper.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    // Get questions extracted from this paper
    const questions = await Question.find({ paperId: req.params.id })
      .populate('topicIds', 'name')
      .sort({ questionNumber: 1 })
      .lean();

    res.json({
      success: true,
      data: { paper, questions },
    });
  } catch (error) { next(error); }
});

/**
 * GET /api/papers/subject/:subjectId/years
 * Get available years for a subject.
 */
router.get('/subject/:subjectId/years', async (req, res, next) => {
  try {
    const years = await Paper.distinct('year', {
      subjectId: req.params.subjectId,
      status: 'APPROVED',
    });
    years.sort((a: number, b: number) => b - a);
    res.json({ success: true, data: { years } });
  } catch (error) { next(error); }
});

/**
 * PATCH /api/papers/:id/status — Moderator/Admin
 * Approve or reject a paper.
 */
router.patch(
  '/:id/status',
  authenticate,
  requirePermission(Permission.APPROVE_CONTENT),
  async (req, res, next) => {
    try {
      const { status, rejectionReason } = req.body;
      if (!['APPROVED', 'REJECTED'].includes(status)) {
        throw new AppError(400, 'INVALID_STATUS', 'Status must be APPROVED or REJECTED');
      }

      const update: Record<string, unknown> = {
        status,
        approvedBy: req.user!.userId,
        approvedAt: new Date(),
      };

      if (status === 'APPROVED') {
        update.isVerified = true;
      }
      if (status === 'REJECTED' && rejectionReason) {
        update.rejectionReason = rejectionReason;
      }

      const paper = await Paper.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
      if (!paper) throw new AppError(404, 'NOT_FOUND', 'Paper not found');

      res.json({ success: true, data: { paper }, message: `Paper ${status.toLowerCase()}` });
    } catch (error) { next(error); }
  }
);

/**
 * POST /api/papers
 * Upload/Create a new paper (PT1, PT2, EndSem, etc.)
 * Permissions: CR, TEACHER, FACULTY, ADMIN
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const userRole = (req as any).user?.role;
    const allowedRoles = ['CR', 'TEACHER', 'FACULTY', 'ADMIN'];
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      throw new AppError(403, 'FORBIDDEN', 'Only CR and Teacher accounts can upload papers');
    }

    const {
      title,
      subjectName,
      semester,
      year,
      examType,
      fileUrl,
      solutionUrl,
      scheme = 'K-Scheme (Latest)',
    } = req.body;

    if (!title || !semester || !year || !examType) {
      throw new AppError(400, 'BAD_REQUEST', 'Title, semester, year, and examType are required');
    }

    const paper = await Paper.create({
      title,
      subjectName: subjectName || title,
      semester: Number(semester),
      year: Number(year),
      examType,
      scheme,
      fileUrl: fileUrl || 'https://sbmp.ac.in/computer-engineering/#Curriculum',
      solutionUrl: solutionUrl || '',
      uploadedBy: (req as any).user.userId,
      uploadedByRole: userRole,
      status: 'APPROVED', // auto-approve for CR/Teacher uploads
      isVerified: true,
    });

    res.status(201).json({
      success: true,
      data: paper,
      message: 'Paper uploaded successfully',
    });
  } catch (error) { next(error); }
});

export { router as paperRoutes };
