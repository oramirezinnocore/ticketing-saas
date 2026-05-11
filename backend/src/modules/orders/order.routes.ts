import { Router } from 'express';
import { body, param } from 'express-validator';
import { OrderController } from './order.controller';
import { authenticate } from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';

const router = Router();
const orderController = new OrderController();

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     description: |
 *       Creates a new order for tickets. This reserves inventory and creates a pending order.
 *       The order expires after 15 minutes if payment is not completed.
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - tickets
 *             properties:
 *               eventId:
 *                 type: string
 *                 description: Event ID (MongoDB ObjectId)
 *                 example: "6a00df362608c2a32d66923b"
 *               tickets:
 *                 type: array
 *                 description: Ticket types and quantities to purchase
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - ticketType
 *                     - quantity
 *                   properties:
 *                     ticketType:
 *                       type: string
 *                       description: Name of ticket type (must match event's ticket types)
 *                       example: "General Admission"
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       description: Number of tickets to purchase
 *                       example: 2
 *     responses:
 *       201:
 *         description: Order created successfully
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
 *                     id:
 *                       type: string
 *                       example: "6a00df362608c2a32d66923c"
 *                     userId:
 *                       type: string
 *                       example: "6a00df362608c2a32d66923a"
 *                     eventId:
 *                       type: string
 *                       example: "6a00df362608c2a32d66923b"
 *                     tickets:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           ticketType:
 *                             type: string
 *                           quantity:
 *                             type: integer
 *                     total:
 *                       type: number
 *                       description: Total price in currency
 *                       example: 1500.00
 *                     status:
 *                       type: string
 *                       enum: [pending, paid, cancelled, refunded]
 *                       example: "pending"
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       description: Order expiration (15 minutes from creation)
 *                       example: "2026-05-11T14:45:00.000Z"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Event not found
 *       409:
 *         description: Not enough tickets available
 */
router.post(
  '/',
  authenticate,
  [
    body('eventId').notEmpty().withMessage('Event ID is required'),
    body('tickets').isArray({ min: 1 }).withMessage('At least one ticket is required'),
    body('tickets.*.ticketType').notEmpty().withMessage('Ticket type is required'),
    body('tickets.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be a positive integer'),
    validateRequest,
  ],
  orderController.createOrder
);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     description: Retrieves a specific order by its ID. User must own the order.
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID (MongoDB ObjectId)
 *         example: "6a00df362608c2a32d66923c"
 *     responses:
 *       200:
 *         description: Order details
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
 *                     id:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     eventId:
 *                       type: string
 *                     tickets:
 *                       type: array
 *                       items:
 *                         type: object
 *                     total:
 *                       type: number
 *                     status:
 *                       type: string
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/:id',
  authenticate,
  [param('id').isMongoId().withMessage('Invalid order ID'), validateRequest],
  orderController.getOrderById
);

/**
 * @swagger
 * /orders/user/me:
 *   get:
 *     summary: Get current user's orders
 *     description: Retrieves all orders for the authenticated user
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's orders
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       eventId:
 *                         type: string
 *                       tickets:
 *                         type: array
 *                         items:
 *                           type: object
 *                       total:
 *                         type: number
 *                       status:
 *                         type: string
 *                       expiresAt:
 *                         type: string
 *                         format: date-time
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/user/me', authenticate, orderController.getUserOrders);

export default router;
