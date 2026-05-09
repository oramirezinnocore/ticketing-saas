import { Request, Response, NextFunction } from 'express';
import { PaymentService } from './payment.service';
import { MercadoPagoWebhookPayload } from './payment.interface';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { BadRequestError } from '../../utils/AppError';

export class PaymentController {
  constructor(private readonly paymentService: PaymentService = new PaymentService()) {}

  createPreference = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const { orderId, description, buyerEmail } = req.body as {
        orderId: string;
        description: string;
        buyerEmail: string;
      };

      if (!orderId || !description || !buyerEmail) {
        throw new BadRequestError('orderId, description, and buyerEmail are required');
      }

      const result = await this.paymentService.createPaymentPreference({
        orderId,
        amount: 0,
        description,
        buyerEmail,
      });

      sendSuccess(
        res,
        {
          preferenceId: result.preferenceId,
          initPoint: result.initPoint,
          payment: result.payment,
        },
        201
      );
    }
  );

  handleWebhook = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const signature = req.headers['x-signature'] as string | undefined;

      if (!signature) {
        throw new BadRequestError('Missing webhook signature');
      }

      const rawBody = JSON.stringify(req.body);

      if (!this.paymentService.verifyWebhookSignature(rawBody, signature)) {
        throw new BadRequestError('Invalid webhook signature');
      }

      const payload = req.body as MercadoPagoWebhookPayload;

      await this.paymentService.processWebhook(payload);

      res.status(200).send('OK');
    }
  );

  getPaymentByOrderId = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const { orderId } = req.params;

      const payment = await this.paymentService.getPaymentByOrderId(orderId);

      if (!payment) {
        sendSuccess(res, null, 200);
        return;
      }

      sendSuccess(res, payment, 200);
    }
  );

  getPaymentById = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const { id } = req.params;

      const payment = await this.paymentService.getPaymentById(id);

      sendSuccess(res, payment, 200);
    }
  );
}
