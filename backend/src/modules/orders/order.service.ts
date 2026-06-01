import mongoose, { Types } from 'mongoose';
import { Order } from './order.model';
import { Event } from '../events/event.model';
import { UserService } from '../users/user.service';
import {
  CreateOrderDTO,
  IOrder,
  IOrderDocument,
  IOrderTicketLine,
  OrderStatus,
} from './order.interface';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../utils/AppError';

export class OrderService {
  constructor(private readonly userService: UserService = new UserService()) {}

  private toPublicOrder(doc: IOrderDocument): IOrder {
    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      eventId: doc.eventId.toString(),
      tickets: doc.tickets.map((t) => ({
        ticketType: t.ticketType,
        quantity: t.quantity,
      })),
      total: doc.total,
      status: doc.status,
      expiresAt: doc.expiresAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  private mergeTicketQuantities(tickets: IOrderTicketLine[]): Map<string, number> {
    const merged = new Map<string, number>();
    for (const line of tickets) {
      const name = line.ticketType?.trim();
      if (!name) {
        throw new ValidationError('Each ticket line must include ticketType');
      }
      if (!Number.isInteger(line.quantity) || line.quantity < 1) {
        throw new ValidationError('Each quantity must be a positive integer');
      }
      merged.set(name, (merged.get(name) ?? 0) + line.quantity);
    }
    return merged;
  }

  private computeTotal(
    eventTicketTypes: { name: string; price: number }[],
    merged: Map<string, number>
  ): number {
    let total = 0;
    for (const [typeName, qty] of merged) {
      const tt = eventTicketTypes.find((t) => t.name === typeName);
      if (!tt) {
        throw new BadRequestError(`Unknown ticket type: ${typeName}`);
      }
      total += tt.price * qty;
    }
    return total;
  }

  async createOrder(data: CreateOrderDTO): Promise<IOrder> {
    const { userId, eventId, tickets } = data;

    if (!tickets?.length) {
      throw new ValidationError('At least one ticket line is required');
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestError('Invalid user id format');
    }

    if (!Types.ObjectId.isValid(eventId)) {
      throw new BadRequestError('Invalid event id format');
    }

    const buyer = await this.userService.findUserById(userId);
    if (!buyer) {
      throw new NotFoundError('User not found');
    }

    const merged = this.mergeTicketQuantities(tickets);

    const session = await mongoose.startSession();

    try {
      let created: IOrderDocument | undefined;

      await session.withTransaction(async () => {
        const event = await Event.findById(eventId).session(session);
        if (!event) {
          throw new NotFoundError('Event not found');
        }

        if (event.date < new Date()) {
          throw new BadRequestError('Cannot purchase tickets for past events');
        }

        const total = this.computeTotal(event.ticketTypes, merged);

        const normalizedTickets: IOrderTicketLine[] = Array.from(merged.entries()).map(
          ([ticketType, quantity]) => ({ ticketType, quantity })
        );

        for (const [typeName, qty] of merged) {
          const result = await Event.updateOne(
            { _id: event._id },
            { $inc: { 'ticketTypes.$[elem].quantityAvailable': -qty } },
            {
              session,
              arrayFilters: [
                {
                  'elem.name': typeName,
                  'elem.quantityAvailable': { $gte: qty },
                },
              ],
            }
          );

          if (result.modifiedCount !== 1) {
            throw new ConflictError(`Not enough tickets available for "${typeName}"`);
          }
        }

        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);

        const [orderDoc] = await Order.create(
          [
            {
              userId: new Types.ObjectId(userId),
              eventId: new Types.ObjectId(eventId),
              tickets: normalizedTickets,
              total,
              status: OrderStatus.PENDING,
              expiresAt,
            },
          ],
          { session }
        );

        created = orderDoc;
      });

      if (!created) {
        throw new ValidationError('Order could not be created');
      }

      return this.toPublicOrder(created);
    } finally {
      await session.endSession();
    }
  }

  async getOrderById(orderId: string, userId?: string): Promise<IOrder> {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new BadRequestError('Invalid order id format');
    }

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (userId && order.userId.toString() !== userId) {
      throw new NotFoundError('Order not found');
    }

    return this.toPublicOrder(order);
  }

  async getUserOrders(userId: string): Promise<IOrder[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestError('Invalid user id format');
    }

    const orders = await Order.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(50);

    return orders.map((doc) => this.toPublicOrder(doc));
  }

  async createOrderWithPayment(
    data: CreateOrderDTO & {
      buyerEmail: string;
      description?: string;
    }
  ): Promise<{
    order: IOrder;
    preferenceId: string;
    initPoint: string;
  }> {
    const order = await this.createOrder(data);

    const { PaymentService } = await import('../payments/payment.service');
    const paymentService = new PaymentService();

    const paymentResult = await paymentService.createPaymentPreference({
      orderId: order.id,
      amount: order.total,
      description: data.description || `Order #${order.id.slice(0, 8)}`,
      buyerEmail: data.buyerEmail,
    });

    return {
      order,
      preferenceId: paymentResult.preferenceId,
      initPoint: paymentResult.initPoint,
    };
  }
}
