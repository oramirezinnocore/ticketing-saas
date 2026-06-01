import { Request, Response, NextFunction } from 'express';
import { OrderService } from './order.service';
import { CreateOrderDTO } from './order.interface';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { BadRequestError } from '../../utils/AppError';

export class OrderController {
  constructor(private readonly orderService: OrderService = new OrderService()) {}

  /**
   * Create a new order
   */
  createOrder = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const userId = req.user?.userId;

      if (!userId) {
        throw new BadRequestError('User ID not found in request');
      }

      const { eventId, tickets } = req.body as {
        eventId: string;
        tickets: { ticketType: string; quantity: number }[];
      };

      if (!eventId) {
        throw new BadRequestError('Event ID is required');
      }

      if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
        throw new BadRequestError('At least one ticket is required');
      }

      const orderData: CreateOrderDTO = {
        userId,
        eventId,
        tickets,
      };

      const order = await this.orderService.createOrder(orderData);

      sendSuccess(res, order, 201);
    }
  );

  /**
   * Get order by ID
   */
  getOrderById = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        throw new BadRequestError('User ID not found in request');
      }

      const order = await this.orderService.getOrderById(id, userId);
      sendSuccess(res, order, 200);
    }
  );

  /**
   * Get user's orders
   */
  getUserOrders = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const userId = req.user?.userId;

      if (!userId) {
        throw new BadRequestError('User ID not found in request');
      }

      const orders = await this.orderService.getUserOrders(userId);
      sendSuccess(res, orders, 200);
    }
  );

  /**
   * Create order with payment preference (combined endpoint)
   */
  createOrderWithPayment = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const userId = req.user?.userId;

      if (!userId) {
        throw new BadRequestError('User ID not found in request');
      }

      const { eventId, tickets, buyerEmail, description } = req.body as {
        eventId: string;
        tickets: { ticketType: string; quantity: number }[];
        buyerEmail: string;
        description?: string;
      };

      if (!eventId) {
        throw new BadRequestError('Event ID is required');
      }

      if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
        throw new BadRequestError('At least one ticket is required');
      }

      if (!buyerEmail) {
        throw new BadRequestError('Buyer email is required');
      }

      const result = await this.orderService.createOrderWithPayment({
        userId,
        eventId,
        tickets,
        buyerEmail,
        description,
      });

      sendSuccess(res, result, 201);
    }
  );
}
