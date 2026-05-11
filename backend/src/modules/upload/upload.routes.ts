import { Router } from 'express';
import { UploadController } from './upload.controller';
import { authenticate } from '../../middlewares/auth';
import { authorize } from '../../middlewares/authorize';
import { uploadConfig } from '../../config/upload.config';

const router = Router();
const uploadController = new UploadController();

/**
 * @swagger
 * tags:
 *   - name: Upload
 *     description: File upload operations for event images
 *
 * @swagger
 * components:
 *   schemas:
 *     UploadResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               description: Relative path to uploaded file
 *               example: "/uploads/events/1715270400000-abc123.jpg"
 *             filename:
 *               type: string
 *               example: "1715270400000-abc123.jpg"
 *             originalName:
 *               type: string
 *               example: "concert-poster.jpg"
 *             mimetype:
 *               type: string
 *               example: "image/jpeg"
 *             size:
 *               type: number
 *               example: 2048576
 */

/**
 * @swagger
 * /upload/event-image:
 *   post:
 *     summary: Upload event cover image
 *     description: Upload a cover image for an event. Returns relative path that can be used with any base URL. Only organizers and admins can upload.
 *     tags: [Upload]
 *     security:
 *       - BearerAuth: []
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
 *                 description: Image file (JPG, PNG, or WEBP, max 5MB, recommended 1920x1080px)
 *     responses:
 *       201:
 *         description: Image uploaded successfully. Returns relative path.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post(
  '/event-image',
  authenticate,
  authorize('organizer', 'admin'),
  uploadConfig.single('image'),
  uploadController.uploadEventImage
);

export default router;
