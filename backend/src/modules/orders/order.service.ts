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

        const [orderDoc] = await Order.create(
          [
            {
              userId: new Types.ObjectId(userId),
              eventId: new Types.ObjectId(eventId),
              tickets: normalizedTickets,
              total,
              status: OrderStatus.PENDING,
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
}
