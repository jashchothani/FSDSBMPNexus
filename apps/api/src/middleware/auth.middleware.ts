import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getEnv } from '@repo/config';
import { User } from '@repo/database';
import type { JWTPayload, UserRole } from '@repo/types';
import { AppError } from './error.middleware.js';

/**
 * Extend Express Request with authenticated user data.
 */
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Verify JWT access token and attach user payload to request.
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(401, 'UNAUTHORIZED', 'No authentication token provided');
    }

    const token = authHeader.split(' ')[1]!;
    const env = getEnv();

    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;

    // Verify user still exists and is active
    const user = await User.findById(decoded.userId).select('role isActive').lean();
    if (!user || !user.isActive) {
      throw new AppError(401, 'UNAUTHORIZED', 'User account not found or deactivated');
    }

    // Use the current role from database, not from the token
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: user.role as UserRole,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError(401, 'TOKEN_EXPIRED', 'Access token has expired'));
      return;
    }
    next(new AppError(401, 'INVALID_TOKEN', 'Invalid authentication token'));
  }
}

/**
 * Optional authentication — does not fail if no token is provided.
 * Attaches user to request if valid token is present.
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1]!;
    const env = getEnv();

    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    const user = await User.findById(decoded.userId).select('role isActive').lean();

    if (user && user.isActive) {
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: user.role as UserRole,
      };
    }
  } catch {
    // Silently ignore invalid tokens for optional auth
  }
  next();
}
