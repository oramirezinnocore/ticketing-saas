import mongoose, { Types } from 'mongoose';
import crypto from 'crypto';
import { Payment } from './payment.model';
import { Order } from '../orders/order.model';
import { OrderStatus } from '../orders/order.interface';
import { TicketService } from '../tickets/ticket.service';
import {
  IPayment,
  IPaymentDocument,
  PaymentStatus,
  CreatePaymentPreferenceDTO,
  MercadoPagoWebhookPayload,
} from './payment.interface';
import { BadRequestError, NotFoundError, ConflictError } from '../../utils/AppError';
import { env } from '../../config';
import { logger } from '../../utils/logger';

interface MercadoPagoPreference {
  items: Array<{
    title: string;
    quantity: number;
    unit_price: number;
  }>;
  payer: {
    email: string;
  };
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: string;
  notification_url: string;
  external_reference: string;
}

interface MercadoPagoPaymentDetail {
  id: string;
  status: string;
  external_reference: string;
  transaction_amount: number;
  payment_method_id: string;
}

export class PaymentService {
  constructor(private readonly ticketService: TicketService = new TicketService()) {}

  private toPublicPayment(doc: IPaymentDocument): IPayment {
    return {
      id: doc._id.toString(),
      orderId: doc.orderId.toString(),
      amount: doc.amount,
      status: doc.status,
      paymentMethod: doc.paymentMethod,
      externalId: doc.externalId,
      webhookProcessed: doc.webhookProcessed,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  private getMercadoPagoAccessToken(): string {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN is not configured');
    }
    return token;
  }

  private getWebhookSecret(): string {
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error('MERCADOPAGO_WEBHOOK_SECRET is not configured');
    }
    return secret;
  }

  private async callMercadoPagoAPI<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: unknown
  ): Promise<T> {
    const baseUrl = 'https://api.mercadopago.com';
    const url = `${baseUrl}${endpoint}`;
    const token = this.getMercadoPagoAccessToken();

    const options: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MercadoPago API error: ${response.status} - ${errorText}`);
    }

    return (await response.json()) as T;
  }

  async createPaymentPreference(data: CreatePaymentPreferenceDTO): Promise<{
    preferenceId: string;
    initPoint: string;
    payment: IPayment;
  }> {
    const { orderId, amount, description, buyerEmail } = data;

    if (!Types.ObjectId.isValid(orderId)) {
      throw new BadRequestError('Invalid order id format');
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestError('Order is not in pending status');
    }

    const existingPayment = await Payment.findOne({
      orderId: new Types.ObjectId(orderId),
      status: { $in: [PaymentStatus.PENDING, PaymentStatus.APPROVED] },
    });

    if (existingPayment) {
      throw new ConflictError('Payment already exists for this order');
    }

    const baseUrl = process.env.BACKEND_URL || `http://localhost:${env.PORT}`;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const preference: MercadoPagoPreference = {
      items: [
        {
          title: description,
          quantity: 1,
          unit_price: amount,
        },
      ],
      payer: {
        email: buyerEmail,
      },
      back_urls: {
        success: `${frontendUrl}/payment/success`,
        failure: `${frontendUrl}/payment/failure`,
        pending: `${frontendUrl}/payment/pending`,
      },
      auto_return: 'approved',
      notification_url: `${baseUrl}/api/v1/payments/webhook`,
      external_reference: orderId,
    };

    const mpResponse = await this.callMercadoPagoAPI<{
      id: string;
      init_point: string;
    }>('/checkout/preferences', 'POST', preference);

    const payment = await Payment.create({
      orderId: new Types.ObjectId(orderId),
      amount,
      status: PaymentStatus.PENDING,
      paymentMethod: 'mercadopago',
      webhookProcessed: false,
    });

    logger.info(
      {
        orderId,
        paymentId: payment._id.toString(),
        preferenceId: mpResponse.id,
        amount,
      },
      'Payment preference created'
    );

    return {
      preferenceId: mpResponse.id,
      initPoint: mpResponse.init_point,
      payment: this.toPublicPayment(payment),
    };
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const secret = this.getWebhookSecret();
      const hmac = crypto.createHmac('sha256', secret);
      const expectedSignature = hmac.update(payload).digest('hex');
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    } catch {
      return false;
    }
  }

  private mapMercadoPagoStatus(mpStatus: string): PaymentStatus {
    switch (mpStatus) {
      case 'approved':
        return PaymentStatus.APPROVED;
      case 'rejected':
      case 'cancelled':
        return PaymentStatus.REJECTED;
      case 'refunded':
        return PaymentStatus.REFUNDED;
      default:
        return PaymentStatus.PENDING;
    }
  }

  async processWebhook(webhookPayload: MercadoPagoWebhookPayload): Promise<void> {
    logger.info({ webhookPayload }, 'Webhook received');

    if (webhookPayload.type !== 'payment') {
      logger.debug({ type: webhookPayload.type }, 'Ignoring non-payment webhook');
      return;
    }

    const paymentId = webhookPayload.data.id;
    if (!paymentId) {
      throw new BadRequestError('Missing payment id in webhook');
    }

    logger.info({ externalPaymentId: paymentId }, 'Processing payment webhook');

    const paymentDetail = await this.callMercadoPagoAPI<MercadoPagoPaymentDetail>(
      `/v1/payments/${paymentId}`
    );

    const orderId = paymentDetail.external_reference;
    if (!orderId || !Types.ObjectId.isValid(orderId)) {
      throw new BadRequestError('Invalid or missing external reference (order id)');
    }

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const existingPayment = await Payment.findOne({
          externalId: paymentId,
          webhookProcessed: true,
        }).session(session);

        if (existingPayment) {
          logger.info({ externalPaymentId: paymentId }, 'Webhook already processed (idempotent)');
          return;
        }

        const order = await Order.findById(orderId).session(session);
        if (!order) {
          throw new NotFoundError('Order not found');
        }

        const newStatus = this.mapMercadoPagoStatus(paymentDetail.status);

        const payment = await Payment.findOneAndUpdate(
          {
            orderId: new Types.ObjectId(orderId),
            webhookProcessed: false,
          },
          {
            $set: {
              externalId: paymentId,
              status: newStatus,
              paymentMethod: paymentDetail.payment_method_id,
              amount: paymentDetail.transaction_amount,
              webhookProcessed: true,
            },
          },
          {
            new: true,
            session,
          }
        );

        if (!payment) {
          throw new NotFoundError('Payment record not found - payment must be created first');
        }

        if (newStatus === PaymentStatus.APPROVED) {
          const amountDiff = Math.abs(paymentDetail.transaction_amount - order.total);
          if (amountDiff > 0.01) {
            payment.status = PaymentStatus.REJECTED;
            await payment.save({ session });
            logger.error(
              {
                orderId,
                expectedAmount: order.total,
                receivedAmount: paymentDetail.transaction_amount,
                difference: amountDiff,
              },
              'Payment amount mismatch detected - potential fraud'
            );
            throw new ConflictError(
              `Payment amount mismatch: expected ${order.total}, got ${paymentDetail.transaction_amount}`
            );
          }

          if (order.status === OrderStatus.PENDING) {
            order.status = OrderStatus.PAID;
            await order.save({ session });

            logger.info(
              {
                orderId,
                paymentId: payment._id.toString(),
                amount: paymentDetail.transaction_amount,
              },
              'Order marked as PAID - issuing tickets'
            );

            await this.ticketService.issueTicketsForPaidOrder(orderId);

            logger.info({ orderId }, 'Tickets issued successfully');
          }
        } else if (newStatus === PaymentStatus.REJECTED && order.status === OrderStatus.PENDING) {
          order.status = OrderStatus.CANCELLED;
          await order.save({ session });
        }
      });
    } finally {
      await session.endSession();
    }
  }

  async getPaymentByOrderId(orderId: string): Promise<IPayment | null> {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new BadRequestError('Invalid order id format');
    }

    const payment = await Payment.findOne({ orderId: new Types.ObjectId(orderId) }).sort({
      createdAt: -1,
    });

    if (!payment) {
      return null;
    }

    return this.toPublicPayment(payment);
  }

  async getPaymentById(paymentId: string): Promise<IPayment> {
    if (!Types.ObjectId.isValid(paymentId)) {
      throw new BadRequestError('Invalid payment id format');
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    return this.toPublicPayment(payment);
  }
}
