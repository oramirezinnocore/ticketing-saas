import crypto from 'crypto';
import mongoose, { Types } from 'mongoose';
import { Ticket } from './ticket.model';
import { Order } from '../orders/order.model';
import { OrderStatus } from '../orders/order.interface';
import { ITicket, ITicketDocument, TicketStatus } from './ticket.interface';
import { BadRequestError, ConflictError, NotFoundError } from '../../utils/AppError';

const CODE_BYTES = 18;

export class TicketService {
  private toPublicTicket(doc: ITicketDocument): ITicket {
    return {
      id: doc._id.toString(),
      code: doc.code,
      orderId: doc.orderId.toString(),
      eventId: doc.eventId.toString(),
      userId: doc.userId.toString(),
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  /** Cryptographically strong, URL-safe code suitable for QR payload (sign separately at validation time). */
  generateTicketCode(): string {
    return crypto.randomBytes(CODE_BYTES).toString('base64url');
  }

  /**
   * After payment succeeds and the order is persisted as `paid`, call this to mint one document per seat.
   * Idempotent: if tickets already exist for the order, returns them without creating duplicates.
   */
  async issueTicketsForPaidOrder(orderId: string): Promise<ITicket[]> {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new BadRequestError('Invalid order id format');
    }

    const oid = new Types.ObjectId(orderId);
    const session = await mongoose.startSession();

    try {
      let result: ITicketDocument[] = [];

      await session.withTransaction(async () => {
        const order = await Order.findById(oid).session(session);
        if (!order) {
          throw new NotFoundError('Order not found');
        }

        if (order.status !== OrderStatus.PAID) {
          throw new BadRequestError('Tickets can only be issued for paid orders');
        }

        const existing = await Ticket.find({ orderId: oid })
          .session(session)
          .sort({ createdAt: 1 });
        if (existing.length > 0) {
          result = existing;
          return;
        }

        const totalUnits = order.tickets.reduce((sum, line) => sum + line.quantity, 0);
        if (totalUnits < 1) {
          throw new BadRequestError('Order has no ticket quantity to issue');
        }

        const codes = new Set<string>();
        while (codes.size < totalUnits) {
          codes.add(this.generateTicketCode());
        }

        const docs = Array.from(codes).map((code) => ({
          code,
          orderId: order._id,
          eventId: order.eventId,
          userId: order.userId,
          status: TicketStatus.VALID,
        }));

        try {
          await Ticket.insertMany(docs, { session, ordered: true });
        } catch (err: unknown) {
          if (
            typeof err === 'object' &&
            err !== null &&
            'code' in err &&
            (err as { code?: number }).code === 11000
          ) {
            throw new ConflictError('Ticket code collision; retry issue operation');
          }
          throw err;
        }

        result = await Ticket.find({ orderId: oid }).session(session).sort({ createdAt: 1 });
      });

      return result.map((d) => this.toPublicTicket(d));
    } finally {
      await session.endSession();
    }
  }

  /** Lookup for QR / scanner flow (normalize input). */
  async findTicketByCode(rawCode: string): Promise<ITicket | null> {
    const code = rawCode?.trim();
    if (!code) {
      throw new BadRequestError('Ticket code is required');
    }

    const doc = await Ticket.findOne({ code });
    if (!doc) {
      return null;
    }
    return this.toPublicTicket(doc);
  }

  /** Gate validation: marks a valid ticket as used once. */
  async markTicketUsed(rawCode: string): Promise<ITicket> {
    const code = rawCode?.trim();
    if (!code) {
      throw new BadRequestError('Ticket code is required');
    }

    const doc = await Ticket.findOne({ code });
    if (!doc) {
      throw new NotFoundError('Ticket not found');
    }

    if (doc.status === TicketStatus.USED) {
      throw new ConflictError('Ticket has already been used');
    }

    if (doc.status !== TicketStatus.VALID) {
      throw new BadRequestError('Ticket cannot be marked used');
    }

    doc.status = TicketStatus.USED;
    await doc.save();
    return this.toPublicTicket(doc);
  }
}
