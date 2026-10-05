import { Router, Request, Response } from 'express';
import { Curriculum, Paper } from '@repo/database';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

export const curriculumRoutes = Router();

/**
 * GET /api/curriculum
 * Fetch SBMP Computer Engineering Department Curriculum tree.
 * Filter by scheme (K-Scheme Latest / I-Scheme) & semester (1-6).
 */
curriculumRoutes.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { department = 'Computer Engineering', scheme, semester } = req.query;
    const filter: any = { department };

    if (scheme) filter.scheme = scheme;
    if (semester) filter.semester = Number(semester);

    const curriculums = await Curriculum.find(filter).sort({ semester: 1, subjectCode: 1 });
    
    res.json({
      success: true,
      data: curriculums,
      department,
      schemesAvailable: ['K-Scheme (Latest)', 'I-Scheme', 'Revised'],
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch curriculum data' });
  }
});

/**
 * POST /api/curriculum
 * Create or Update SBMP Curriculum.
 * Restricted Permission: TEACHER and ADMIN only.
 */
curriculumRoutes.post('/', authenticate, requireRole('TEACHER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { department, scheme, semester, subjectCode, subjectName, credits, theoryMarks, practicalMarks, units, isLatestScheme } = req.body;

    const updated = await Curriculum.findOneAndUpdate(
      { department, scheme, semester, subjectCode },
      {
        department: department || 'Computer Engineering',
        scheme: scheme || 'K-Scheme (Latest)',
        semester,
        subjectCode,
        subjectName,
        credits: credits || 4,
        theoryMarks: theoryMarks || 70,
        practicalMarks: practicalMarks || 50,
        units: units || [],
        isLatestScheme: isLatestScheme !== undefined ? isLatestScheme : true,
        createdByRole: req.user?.role as any || 'TEACHER',
        createdBy: req.user?.userId,
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      data: updated,
      message: 'Curriculum entry updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to save curriculum entry' });
  }
});
