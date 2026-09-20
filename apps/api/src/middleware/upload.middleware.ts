import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { MAX_FILE_SIZE_BYTES, ALLOWED_PAPER_MIMES, ALLOWED_MATERIAL_MIMES, ALLOWED_IMAGE_MIMES } from '@repo/config';
import { AppError } from './error.middleware.js';

/**
 * File filter factory. Validates MIME type against an allow list.
 */
function createFileFilter(allowedMimes: readonly string[]) {
  return (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(400, 'INVALID_FILE_TYPE', `File type ${file.mimetype} is not allowed. Allowed: ${allowedMimes.join(', ')}`));
    }
  };
}

/**
 * Generate safe filename with UUID to prevent path traversal and collisions.
 */
function safeFilename(originalname: string): string {
  const ext = path.extname(originalname).toLowerCase();
  return `${uuidv4()}${ext}`;
}

const storage = multer.memoryStorage();

/**
 * Multer upload middleware for question papers (PDF only).
 */
export const uploadPaper = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: createFileFilter(ALLOWED_PAPER_MIMES),
}).single('file');

/**
 * Multer upload middleware for study materials (PDF, DOC, PPT, images).
 */
export const uploadMaterial = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: createFileFilter([...ALLOWED_MATERIAL_MIMES]),
}).single('file');

/**
 * Multer upload middleware for AI image analysis (images only).
 */
export const uploadImage = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB for images
  fileFilter: createFileFilter([...ALLOWED_IMAGE_MIMES]),
}).single('image');

export { safeFilename };
