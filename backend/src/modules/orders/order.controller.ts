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

      // TODO: Implement getOrderById in service
      // For now, return placeholder response
      sendSuccess(
        res,
        {
          id,
          message: 'Order retrieval endpoint - to be implemented',
        },
        200
      );
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

      // TODO: Implement getUserOrders in service
      // For now, return empty array
      sendSuccess(res, [], 200);
    }
  );
}
