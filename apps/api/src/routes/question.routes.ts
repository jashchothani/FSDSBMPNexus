import { Router } from 'express';
import { Question } from '@repo/database';
import { questionFilterSchema } from '@repo/types';
import { validateQuery } from '../middleware/validation.middleware.js';
import { AppError } from '../middleware/error.middleware.js';
import type { PaginatedResponse, IQuestion } from '@repo/types';

const router = Router();

/**
 * GET /api/questions
 * List questions with filtering and pagination.
 */
router.get('/', validateQuery(questionFilterSchema), async (req, res, next) => {
  try {
    const {
      subjectId, unitId, topicId, difficulty, questionType,
      marks, year, minFrequency, search,
      page, limit, sortBy, sortOrder,
    } = req.query as Record<string, string | number | undefined>;

    const filter: Record<string, unknown> = {};

    if (subjectId) filter.subjectId = subjectId;
    if (unitId) filter.unitId = unitId;
    if (topicId) filter.topicIds = topicId;
    if (difficulty) filter.difficulty = difficulty;
    if (questionType) filter.questionType = questionType;
    if (marks) filter.marks = Number(marks);
    if (year) filter.year = Number(year);
    if (minFrequency) filter.frequency = { $gte: Number(minFrequency) };

    if (search && typeof search === 'string') {
      filter.$text = { $search: search };
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const sortObj: Record<string, 1 | -1> = {};
    sortObj[String(sortBy) || 'createdAt'] = sortOrder === 'asc' ? 1 : -1;

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .populate('topicIds', 'name slug')
        .populate('subjectId', 'name slug code')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Question.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    const response: PaginatedResponse<IQuestion> = {
      items: questions as unknown as IQuestion[],
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
 * GET /api/questions/frequent?subjectId=...
 * Get frequently asked questions for a subject.
 */
router.get('/frequent', async (req, res, next) => {
  try {
    const { subjectId } = req.query;
    if (!subjectId) throw new AppError(400, 'MISSING_PARAM', 'subjectId is required');

    const questions = await Question.find({
      subjectId,
      frequency: { $gte: 2 },
    })
      .populate('topicIds', 'name slug')
      .sort({ frequency: -1 })
      .limit(20)
      .lean();

    res.json({ success: true, data: { questions } });
  } catch (error) { next(error); }
});

/**
 * GET /api/questions/:id
 */
router.get('/:id', async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('topicIds', 'name slug')
      .populate('subjectId', 'name slug code')
      .populate('paperId', 'year examType')
      .lean();

    if (!question) throw new AppError(404, 'NOT_FOUND', 'Question not found');

    // Get similar questions
    const similarQuestions = question.similarQuestionIds?.length
      ? await Question.find({ _id: { $in: question.similarQuestionIds } })
          .select('text year examType frequency')
          .lean()
      : [];

    res.json({ success: true, data: { question, similarQuestions } });
  } catch (error) { next(error); }
});

export { router as questionRoutes };
