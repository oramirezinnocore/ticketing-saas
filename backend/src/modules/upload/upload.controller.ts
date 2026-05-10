import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { BadRequestError } from '../../utils/AppError';
import { buildFileUrl } from '../../config/upload.config';

export class UploadController {
  /**
   * Upload event cover image
   * POST /api/upload/event-image
   */
  uploadEventImage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      throw new BadRequestError('No file uploaded');
    }

    // Build public URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = buildFileUrl(req.file.filename, baseUrl);

    sendSuccess(
      res,
      {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
      201
    );
  });
}
