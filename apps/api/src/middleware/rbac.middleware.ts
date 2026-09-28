import type { Request, Response, NextFunction } from 'express';
import { hasPermission, hasAnyPermission, type Permission } from '@repo/config';
import { AppError } from './error.middleware.js';

/**
 * RBAC middleware — checks if the authenticated user has the required permission.
 * Must be used AFTER authenticate middleware.
 */
export function requirePermission(...permissions: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
      return;
    }

    const hasAccess = permissions.length === 1
      ? hasPermission(req.user.role, permissions[0]!)
      : hasAnyPermission(req.user.role, permissions);

    if (!hasAccess) {
      next(
        new AppError(
          403,
          'FORBIDDEN',
          'You do not have permission to perform this action'
        )
      );
      return;
    }

    next();
  };
}

/**
 * Role-based middleware — checks if the user has one of the specified roles.
 */
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(
        new AppError(
          403,
          'FORBIDDEN',
          'Insufficient role for this action'
        )
      );
      return;
    }

    next();
  };
}
