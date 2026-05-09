import { Schema, model, Types } from 'mongoose';
import { ITicketDocument, TicketStatus } from './ticket.interface';

const ticketSchema = new Schema<ITicketDocument>(
  {
    code: {
      type: String,
      required: [true, 'Ticket code is required'],
      unique: true,
      trim: true,
      maxlength: [64, 'Code must not exceed 64 characters'],
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order is required'],
      index: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event is required'],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(TicketStatus),
      default: TicketStatus.VALID,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>): Record<string, unknown> => {
        ret.id = (ret._id as Types.ObjectId).toString();
        ret.orderId = String(ret.orderId);
        ret.eventId = String(ret.eventId);
        ret.userId = String(ret.userId);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

ticketSchema.index({ eventId: 1, status: 1 });

export const Ticket = model<ITicketDocument>('Ticket', ticketSchema);
