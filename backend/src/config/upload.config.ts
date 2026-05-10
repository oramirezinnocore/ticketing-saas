import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Request } from 'express';
import { BadRequestError } from '../utils/AppError';

// Allowed MIME types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Upload directory
const UPLOAD_DIR = path.join(__dirname, '../../uploads/events');

/**
 * Sanitize filename to prevent path traversal attacks
 */
const sanitizeFilename = (filename: string): string => {
  // Remove any path components
  const basename = path.basename(filename);
  // Remove any non-alphanumeric characters except dots and hyphens
  return basename.replace(/[^a-zA-Z0-9.-]/g, '_');
};

/**
 * Generate unique filename with original extension
 */
const generateUniqueFilename = (originalname: string): string => {
  const sanitized = sanitizeFilename(originalname);
  const ext = path.extname(sanitized).toLowerCase();
  const uniqueId = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  return `${timestamp}-${uniqueId}${ext}`;
};

/**
 * Configure multer storage
 */
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    try {
      const filename = generateUniqueFilename(file.originalname);
      cb(null, filename);
    } catch (error) {
      cb(error as Error, '');
    }
  },
});

/**
 * File filter to validate file type
 */
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(
      new BadRequestError(
        `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
      )
    );
    return;
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    cb(
      new BadRequestError(
        `Invalid file extension. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`
      )
    );
    return;
  }

  cb(null, true);
};

/**
 * Multer upload configuration
 */
export const uploadConfig = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1, // Only one file per upload
  },
});

/**
 * Build public URL for uploaded file
 */
export const buildFileUrl = (filename: string, baseUrl: string): string => {
  return `${baseUrl}/uploads/events/${filename}`;
};
