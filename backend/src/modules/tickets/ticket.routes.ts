import { Router } from 'express';
import { body, param } from 'express-validator';
import { TicketController } from './ticket.controller';
import { authenticate } from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';

const router = Router();
const ticketController = new TicketController();

/**
 * @swagger
 * /tickets/my-tickets:
 *   get:
 *     summary: Get user's tickets (wallet)
 *     description: |
 *       Retrieves all tickets owned by the authenticated user with QR codes.
 *       Each ticket includes a signed JWT token embedded in the QR code for secure validation.
 *     tags: [Tickets]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's tickets with QR codes
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
 *                         example: "6a00df362608c2a32d66923b"
 *                       code:
 *                         type: string
 *                         description: Unique ticket code
 *                         example: "abc123def456ghi789"
 *                       orderId:
 *                         type: string
 *                         example: "6a00df362608c2a32d66923a"
 *                       eventId:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           date:
 *                             type: string
 *                             format: date-time
 *                           location:
 *                             type: string
 *                           coverImageUrl:
 *                             type: string
 *                       status:
 *                         type: string
 *                         enum: [valid, used]
 *                         example: "valid"
 *                       qrCode:
 *                         type: string
 *                         description: Base64-encoded QR code image (data URL)
 *                         example: "data:image/png;base64,iVBORw0KGgo..."
 *                       signedToken:
 *                         type: string
 *                         description: JWT token embedded in QR code
 *                         example: "eyJhbGciOiJIUzI1NiIs..."
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/my-tickets', authenticate, ticketController.getUserTickets);

/**
 * @swagger
 * /tickets/{id}:
 *   get:
 *     summary: Get ticket details by ID
 *     description: Retrieves a single ticket with QR code. User must own the ticket.
 *     tags: [Tickets]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID (MongoDB ObjectId)
 *         example: "6a00df362608c2a32d66923b"
 *     responses:
 *       200:
 *         description: Ticket details with QR code
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
 *                     code:
 *                       type: string
 *                     orderId:
 *                       type: string
 *                     eventId:
 *                       type: object
 *                     status:
 *                       type: string
 *                       enum: [valid, used]
 *                     qrCode:
 *                       type: string
 *                       description: Base64-encoded QR code image
 *                     signedToken:
 *                       type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/:id',
  authenticate,
  [param('id').isMongoId().withMessage('Invalid ticket ID'), validateRequest],
  ticketController.getTicketById
);

/**
 * @swagger
 * /tickets/validate:
 *   post:
 *     summary: Validate and mark ticket as used
 *     description: |
 *       Validates a ticket QR token and marks it as USED.
 *       This is an atomic operation - once marked as used, the ticket cannot be used again.
 *
 *       **Important:** This endpoint should be called by gate scanners/validators.
 *       The token is the signed JWT extracted from the QR code.
 *     tags: [Tickets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Signed JWT token from QR code
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Ticket validated and marked as used
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
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     ticket:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         code:
 *                           type: string
 *                         status:
 *                           type: string
 *                           example: "used"
 *                         eventId:
 *                           type: object
 *                     message:
 *                       type: string
 *                       example: "Ticket validated and marked as used"
 *       400:
 *         description: Invalid or missing token
 *       401:
 *         description: Token expired or invalid signature
 *       404:
 *         description: Ticket not found
 *       409:
 *         description: Ticket already used
 */
router.post(
  '/validate',
  [body('token').notEmpty().withMessage('Token is required'), validateRequest],
  ticketController.validateTicket
);

/**
 * @swagger
 * /tickets/check-status:
 *   post:
 *     summary: Check ticket status without marking as used
 *     description: |
 *       Verifies ticket token and returns current status without modifying it.
 *       Useful for pre-validation checks.
 *     tags: [Tickets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Signed JWT token from QR code
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Ticket status retrieved
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
 *                     code:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [valid, used]
 *                     eventId:
 *                       type: object
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid or expired token
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post(
  '/check-status',
  [body('token').notEmpty().withMessage('Token is required'), validateRequest],
  ticketController.checkTicketStatus
);

export default router;
