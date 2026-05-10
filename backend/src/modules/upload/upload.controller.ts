import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { BadRequestError } from '../../utils/AppError';

export class UploadController {
  /**
   * Upload event cover image
   * POST /api/upload/event-image
   */
  uploadEventImage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      throw new BadRequestError('No file uploaded');
    }

    // Return RELATIVE path (not absolute URL)
    // Frontend will handle prepending the base URL
    const relativePath = `/uploads/events/${req.file.filename}`;

    sendSuccess(
      res,
      {
        url: relativePath,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
      201
    );
  });
}
