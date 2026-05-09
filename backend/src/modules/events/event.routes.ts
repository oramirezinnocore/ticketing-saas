import { Router } from 'express';
import { body, param } from 'express-validator';
import { EventController } from './event.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { authenticate } from '../../middlewares/auth';
import { authorize } from '../../middlewares/authorize';

const router = Router();
const eventController = new EventController();

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const ticketTypesValidator = body('ticketTypes').custom((value: unknown) => {
  if (!Array.isArray(value) || value.length < 1) {
    throw new Error('At least one ticket type is required');
  }
  for (const entry of value) {
    if (!isPlainRecord(entry)) {
      throw new Error('Invalid ticket type entry');
    }
    const name = entry.name;
    const price = entry.price;
    const quantity = entry.quantity;
    if (typeof name !== 'string' || !name.trim()) {
      throw new Error('Each ticket type must have a name');
    }
    if (typeof price !== 'number' || Number.isNaN(price) || price < 0) {
      throw new Error('Each ticket type must have a valid price >= 0');
    }
    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1) {
      throw new Error('Each ticket type must have an integer quantity of at least 1');
    }
  }
  return true;
});

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event (Organizer only)
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - date
 *               - ticketTypes
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 300
 *                 example: Tech Conference 2024
 *               description:
 *                 type: string
 *                 example: Annual technology conference featuring industry leaders
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-12-15T10:00:00Z
 *               ticketTypes:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - price
 *                     - quantity
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: General Admission
 *                     price:
 *                       type: number
 *                       minimum: 0
 *                       example: 50.00
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       example: 100
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post(
  '/',
  authenticate,
  authorize('organizer', 'admin'),
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 300 })
      .withMessage('Title must not exceed 300 characters'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('date')
      .notEmpty()
      .withMessage('Date is required')
      .custom((value) => {
        const d = value instanceof Date ? value : new Date(value as string);
        if (Number.isNaN(d.getTime())) {
          throw new Error('Invalid event date');
        }
        return true;
      }),
    ticketTypesValidator,
    validateRequest,
  ],
  eventController.createEvent
);

/**
 * @swagger
 * /events:
 *   get:
 *     summary: List all events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of all events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 */
router.get('/', eventController.listEvents);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid event id'), validateRequest],
  eventController.getEventById
);

export default router;
