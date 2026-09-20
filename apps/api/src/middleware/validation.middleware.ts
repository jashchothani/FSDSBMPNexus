import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { AppError } from './error.middleware.js';

/**
 * Validate request body against a Zod schema.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      next(
        new AppError(400, 'VALIDATION_ERROR', 'Request validation failed', errors)
      );
      return;
    }
    req.body = result.data;
    next();
  };
}

/**
 * Validate request query parameters against a Zod schema.
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors = result.error.errors.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      next(
        new AppError(400, 'VALIDATION_ERROR', 'Query validation failed', errors)
      );
      return;
    }
    req.query = result.data;
    next();
  };
}

/**
 * Validate request params against a Zod schema.
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      const errors = result.error.errors.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      next(
        new AppError(400, 'VALIDATION_ERROR', 'Parameter validation failed', errors)
      );
      return;
    }
    req.params = result.data;
    next();
  };
}
