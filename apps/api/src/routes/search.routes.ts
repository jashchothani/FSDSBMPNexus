import { Router } from 'express';
import { Paper, Question, Material, Subject, Topic } from '@repo/database';
import { searchQuerySchema } from '@repo/types';
import { validateQuery } from '../middleware/validation.middleware.js';
import type { SearchResult, SearchSuggestion } from '@repo/types';

const router = Router();

/**
 * GET /api/search?q=...
 * Global search across papers, questions, materials, subjects, topics.
 */
router.get('/', validateQuery(searchQuerySchema), async (req, res, next) => {
  try {
    const { q, subjectId, semester, year, page, limit } = req.query as Record<string, string | number | undefined>;

    const query = String(q);
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const skip = (pageNum - 1) * limitNum;
    const regex = new RegExp(query, 'i');

    const results: SearchResult[] = [];

    // Search subjects
    const subjectFilter: Record<string, unknown> = { isActive: true, $or: [{ name: regex }, { code: regex }] };
    if (semester) subjectFilter.semester = Number(semester);
    const subjects = await Subject.find(subjectFilter).limit(5).lean();
    for (const s of subjects) {
      results.push({
        type: 'SUBJECT',
        id: s._id.toString(),
        title: s.name,
        description: `Code: ${s.code} | Semester ${s.semester}`,
        metadata: { code: s.code, semester: s.semester, slug: s.slug },
      });
    }

    // Search topics
    const topics = await Topic.find({
      isActive: true,
      $or: [{ name: regex }],
    }).populate('subjectId', 'name').limit(5).lean();
    for (const t of topics) {
      results.push({
        type: 'TOPIC',
        id: t._id.toString(),
        title: t.name,
        description: `Subject: ${(t.subjectId as unknown as Record<string, string>)?.name || ''}`,
        metadata: { slug: t.slug },
      });
    }

    // Search papers
    const paperFilter: Record<string, unknown> = {
      status: 'APPROVED',
      $or: [{ title: regex }, { tags: regex }],
    };
    if (subjectId) paperFilter.subjectId = subjectId;
    if (year) paperFilter.year = Number(year);
    const papers = await Paper.find(paperFilter)
      .populate('subjectId', 'name code')
      .populate('universityId', 'name abbreviation')
      .limit(10)
      .lean();
    for (const p of papers) {
      const subj = p.subjectId as unknown as Record<string, string>;
      results.push({
        type: 'PAPER',
        id: p._id.toString(),
        title: p.title || `${subj?.name || ''} ${p.examType} ${p.year}`,
        description: `${p.examType} | ${p.year} | Semester ${p.semester}`,
        metadata: { year: p.year, examType: p.examType, semester: p.semester },
      });
    }

    // Search questions
    const questionFilter: Record<string, unknown> = {};
    if (subjectId) questionFilter.subjectId = subjectId;
    const questions = await Question.find({
      ...questionFilter,
      text: regex,
    })
      .populate('subjectId', 'name code')
      .populate('topicIds', 'name')
      .limit(10)
      .lean();
    for (const q of questions) {
      const subj = q.subjectId as unknown as Record<string, string>;
      results.push({
        type: 'QUESTION',
        id: q._id.toString(),
        title: q.text.substring(0, 120) + (q.text.length > 120 ? '...' : ''),
        description: `${subj?.name || ''} | ${q.marks || '?'} marks | ${q.difficulty}`,
        highlight: q.text.substring(0, 200),
        metadata: { marks: q.marks, difficulty: q.difficulty, frequency: q.frequency },
      });
    }

    // Search materials
    const materials = await Material.find({
      status: 'APPROVED',
      $or: [{ title: regex }, { description: regex }],
    })
      .populate('subjectId', 'name code')
      .limit(5)
      .lean();
    for (const m of materials) {
      results.push({
        type: 'MATERIAL',
        id: m._id.toString(),
        title: m.title,
        description: `${m.type} | ${m.fileType}`,
        metadata: { type: m.type, fileType: m.fileType },
      });
    }

    // Paginate results
    const total = results.length;
    const paginatedResults = results.slice(skip, skip + limitNum);

    res.json({
      success: true,
      data: {
        results: paginatedResults,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasNextPage: pageNum < Math.ceil(total / limitNum),
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) { next(error); }
});

/**
 * GET /api/search/suggestions?q=...
 * Autocomplete suggestions for the search bar.
 */
router.get('/suggestions', async (req, res, next) => {
  try {
    const q = String(req.query.q || '');
    if (q.length < 2) {
      res.json({ success: true, data: { suggestions: [] } });
      return;
    }

    const regex = new RegExp(q, 'i');
    const suggestions: SearchSuggestion[] = [];

    // Subject name suggestions
    const subjects = await Subject.find({ isActive: true, name: regex }).select('name').limit(5).lean();
    for (const s of subjects) {
      suggestions.push({ text: s.name, type: 'SUBJECT', count: 0 });
    }

    // Topic suggestions
    const topics = await Topic.find({ isActive: true, name: regex }).select('name').limit(5).lean();
    for (const t of topics) {
      suggestions.push({ text: t.name, type: 'TOPIC', count: 0 });
    }

    res.json({ success: true, data: { suggestions: suggestions.slice(0, 10) } });
  } catch (error) { next(error); }
});

export { router as searchRoutes };
