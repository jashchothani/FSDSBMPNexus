import { Router } from 'express';
import { User, Paper, Question, Material, Contribution, AuditLog } from '@repo/database';
import { authenticate } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/rbac.middleware.js';
import { Permission } from '@repo/config';

const router = Router();

/**
 * GET /api/admin/stats
 * Dashboard statistics.
 */
router.get(
  '/stats',
  authenticate,
  requirePermission(Permission.VIEW_ADMIN_DASHBOARD),
  async (_req, res, next) => {
    try {
      const [
        totalUsers,
        activeUsers,
        totalPapers,
        approvedPapers,
        pendingPapers,
        totalQuestions,
        totalMaterials,
        pendingContributions,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        Paper.countDocuments(),
        Paper.countDocuments({ status: 'APPROVED' }),
        Paper.countDocuments({ status: 'PENDING' }),
        Question.countDocuments(),
        Material.countDocuments(),
        Contribution.countDocuments({ status: 'PENDING' }),
      ]);

      // Recent user growth (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newUsersThisMonth = await User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
      });

      res.json({
        success: true,
        data: {
          users: { total: totalUsers, active: activeUsers, newThisMonth: newUsersThisMonth },
          papers: { total: totalPapers, approved: approvedPapers, pending: pendingPapers },
          questions: { total: totalQuestions },
          materials: { total: totalMaterials },
          contributions: { pending: pendingContributions },
        },
      });
    } catch (error) { next(error); }
  }
);

/**
 * GET /api/admin/users
 * List all users with filtering.
 */
router.get(
  '/users',
  authenticate,
  requirePermission(Permission.VIEW_ALL_USERS),
  async (req, res, next) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const filter: Record<string, unknown> = {};
      if (req.query.role) filter.role = req.query.role;
      if (req.query.search) {
        const regex = new RegExp(String(req.query.search), 'i');
        filter.$or = [{ email: regex }, { firstName: regex }, { lastName: regex }];
      }

      const [users, total] = await Promise.all([
        User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        User.countDocuments(filter),
      ]);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) { next(error); }
  }
);

/**
 * PATCH /api/admin/users/:id/role
 * Update user role.
 */
router.patch(
  '/users/:id/role',
  authenticate,
  requirePermission(Permission.ASSIGN_ROLES),
  async (req, res, next) => {
    try {
      const { role } = req.body;
      const validRoles = ['STUDENT', 'CONTRIBUTOR', 'FACULTY', 'MODERATOR', 'ADMIN'];
      if (!validRoles.includes(role)) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_ROLE', message: `Role must be one of: ${validRoles.join(', ')}` },
        });
        return;
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
      ).lean();

      if (!user) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User not found' },
        });
        return;
      }

      // Audit log
      await AuditLog.create({
        userId: req.user!.userId,
        action: 'ROLE_CHANGE',
        resource: 'User',
        resourceId: req.params.id,
        details: { newRole: role },
      });

      res.json({ success: true, data: { user }, message: `User role updated to ${role}` });
    } catch (error) { next(error); }
  }
);

/**
 * GET /api/admin/moderation
 * Get pending content for moderation.
 */
router.get(
  '/moderation',
  authenticate,
  requirePermission(Permission.MODERATE_CONTENT),
  async (req, res, next) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const [papers, materials, totalPapers, totalMaterials] = await Promise.all([
        Paper.find({ status: 'PENDING' })
          .populate('subjectId', 'name code')
          .populate('uploadedBy', 'firstName lastName email')
          .sort({ createdAt: 1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Material.find({ status: 'PENDING' })
          .populate('subjectId', 'name code')
          .populate('uploadedBy', 'firstName lastName email')
          .sort({ createdAt: 1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Paper.countDocuments({ status: 'PENDING' }),
        Material.countDocuments({ status: 'PENDING' }),
      ]);

      res.json({
        success: true,
        data: {
          papers,
          materials,
          total: totalPapers + totalMaterials,
        },
      });
    } catch (error) { next(error); }
  }
);

export { router as adminRoutes };
