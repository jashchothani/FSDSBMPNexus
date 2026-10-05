import mongoose from 'mongoose';
import { AppError } from '../middleware/error.middleware.js';

export function assertObjectId(id: unknown, label = 'id'): string {
  const strId = String(id ?? '');
  if (!mongoose.Types.ObjectId.isValid(strId)) {
    throw new AppError(400, 'VALIDATION_ERROR', `Invalid ${label}`);
  }
  return strId;
}
