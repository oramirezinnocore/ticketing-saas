import { Router } from 'express';
import { body, param } from 'express-validator';
import { PaymentController } from './payment.controller';
import { authenticate } from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';

const router = Router();
const paymentController = new PaymentController();

/**
 * @swagger
 * /payments/preference:
 *   post:
 *     summary: Create MercadoPago payment preference
 *     description: Creates a payment preference for an order and returns the init_point URL for checkout
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - description
 *               - buyerEmail
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: Order ID to create payment for
 *                 example: "6a00df362608c2a32d66923b"
 *               description:
 *                 type: string
 *                 description: Payment description (event title, ticket details)
 *                 example: "2x General Admission tickets for Tech Conference 2026"
 *               buyerEmail:
 *                 type: string
 *                 format: email
 *                 description: Buyer's email address
 *                 example: "buyer@example.com"
 *     responses:
 *       201:
 *         description: Payment preference created successfully
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
 *                     preferenceId:
 *                       type: string
 *                       description: MercadoPago preference ID
 *                       example: "1234567890-abc123def456"
 *                     initPoint:
 *                       type: string
 *                       format: uri
 *                       description: MercadoPago checkout URL
 *                       example: "https://www.mercadopago.com.mx/checkout/v1/redirect?pref_id=1234567890-abc123def456"
 *                     payment:
 *                       $ref: '#/components/schemas/Payment'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Order not found
 */
router.post(
  '/preference',
  authenticate,
  [
    body('orderId').notEmpty().withMessage('Order ID is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('buyerEmail').isEmail().withMessage('Valid email is required'),
    validateRequest,
  ],
  paymentController.createPreference
);

/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: MercadoPago webhook handler
 *     description: |
 *       Receives and processes payment status updates from MercadoPago.
 *       Validates webhook signature and updates order/payment status accordingly.
 *
 *       **Important:** This endpoint must be configured in your MercadoPago account.
 *
 *       Webhook events handled:
 *       - payment.created
 *       - payment.updated
 *
 *       **Idempotency:** Webhooks are idempotent - processing the same webhook multiple times has no additional effect.
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 example: "payment.updated"
 *               api_version:
 *                 type: string
 *                 example: "v1"
 *               data:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: MercadoPago payment ID
 *                     example: "1234567890"
 *               date_created:
 *                 type: string
 *                 format: date-time
 *               id:
 *                 type: number
 *                 description: Webhook notification ID
 *               live_mode:
 *                 type: boolean
 *               type:
 *                 type: string
 *                 example: "payment"
 *               user_id:
 *                 type: string
 *     parameters:
 *       - in: header
 *         name: x-signature
 *         required: true
 *         schema:
 *           type: string
 *         description: MercadoPago webhook signature for verification
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "OK"
 *       400:
 *         description: Invalid signature or malformed payload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/webhook', paymentController.handleWebhook);

/**
 * @swagger
 * /payments/order/{orderId}:
 *   get:
 *     summary: Get payment by order ID
 *     description: Retrieves payment information for a specific order
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID (MongoDB ObjectId)
 *         example: "6a00df362608c2a32d66923b"
 *     responses:
 *       200:
 *         description: Payment found (or null if no payment exists yet)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/Payment'
 *                     - type: 'null'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/order/:orderId',
  authenticate,
  [param('orderId').isMongoId().withMessage('Invalid order ID'), validateRequest],
  paymentController.getPaymentByOrderId
);

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     description: Retrieves payment information by payment ID
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID (MongoDB ObjectId)
 *         example: "6a00e1234567890abcdef123"
 *     responses:
 *       200:
 *         description: Payment details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/:id',
  authenticate,
  [param('id').isMongoId().withMessage('Invalid payment ID'), validateRequest],
  paymentController.getPaymentById
);

export default router;
