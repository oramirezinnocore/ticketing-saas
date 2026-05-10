import { Router } from 'express';
import { UploadController } from './upload.controller';
import { authenticate } from '../../middlewares/auth';
import { authorize } from '../../middlewares/authorize';
import { uploadConfig } from '../../config/upload.config';

const router = Router();
const uploadController = new UploadController();

/**
 * @swagger
 * /api/upload/event-image:
 *   post:
 *     summary: Upload event cover image
 *     description: Upload a cover image for an event. Only organizers and admins can upload.
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPG, PNG, or WEBP, max 5MB)
 *     responses:
 *       201:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       example: "http://localhost:5001/uploads/events/1234567890-abc123.jpg"
 *                     filename:
 *                       type: string
 *                       example: "1234567890-abc123.jpg"
 *                     originalName:
 *                       type: string
 *                       example: "my-event-cover.jpg"
 *                     mimetype:
 *                       type: string
 *                       example: "image/jpeg"
 *                     size:
 *                       type: number
 *                       example: 1048576
 *       400:
 *         description: Bad request (invalid file type, size, etc.)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (user is not organizer or admin)
 */
router.post(
  '/event-image',
  authenticate,
  authorize('organizer', 'admin'),
  uploadConfig.single('image'),
  uploadController.uploadEventImage
);

export default router;
