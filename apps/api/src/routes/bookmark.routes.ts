import { Router } from 'express';
import { Bookmark } from '@repo/database';
import { createBookmarkSchema } from '@repo/types';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { AppError } from '../middleware/error.middleware.js';

const router = Router();

/**
 * GET /api/bookmarks
 * List user's bookmarks with optional folder/type filtering.
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const filter: Record<string, unknown> = { userId: req.user!.userId };
    if (req.query.resourceType) filter.resourceType = req.query.resourceType;
    if (req.query.folder) filter.folder = req.query.folder;

    const bookmarks = await Bookmark.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Get unique folders for the user
    const folders = await Bookmark.distinct('folder', { userId: req.user!.userId });

    res.json({ success: true, data: { bookmarks, folders } });
  } catch (error) { next(error); }
});

/**
 * POST /api/bookmarks
 * Create a bookmark.
 */
router.post('/', authenticate, validateBody(createBookmarkSchema), async (req, res, next) => {
  try {
    const bookmark = await Bookmark.create({
      ...req.body,
      userId: req.user!.userId,
    });
    res.status(201).json({ success: true, data: { bookmark }, message: 'Bookmarked' });
  } catch (error) {
    // Handle duplicate bookmark gracefully
    if ((error as Record<string, unknown>).code === 11000) {
      res.status(200).json({ success: true, data: null, message: 'Already bookmarked' });
      return;
    }
    next(error);
  }
});

/**
 * DELETE /api/bookmarks/:id
 * Remove a bookmark.
 */
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({
      _id: req.params.id,
      userId: req.user!.userId,
    });
    if (!bookmark) throw new AppError(404, 'NOT_FOUND', 'Bookmark not found');
    res.json({ success: true, data: null, message: 'Bookmark removed' });
  } catch (error) { next(error); }
});

/**
 * DELETE /api/bookmarks/resource/:resourceId
 * Remove a bookmark by resource ID.
 */
router.delete('/resource/:resourceId', authenticate, async (req, res, next) => {
  try {
    await Bookmark.findOneAndDelete({
      resourceId: req.params.resourceId,
      userId: req.user!.userId,
    });
    res.json({ success: true, data: null, message: 'Bookmark removed' });
  } catch (error) { next(error); }
});

export { router as bookmarkRoutes };
