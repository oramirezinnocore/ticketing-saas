import { Schema, model, Types } from 'mongoose';
import { IOrderDocument, OrderStatus } from './order.interface';

const orderTicketLineSchema = new Schema(
  {
    ticketType: {
      type: String,
      required: [true, 'Ticket type is required'],
      trim: true,
      maxlength: [120, 'Ticket type must not exceed 120 characters'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      validate: {
        validator: (value: number): boolean => Number.isInteger(value),
        message: 'Quantity must be a positive integer',
      },
    },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrderDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event is required'],
      index: true,
    },
    tickets: {
      type: [orderTicketLineSchema],
      required: [true, 'Tickets are required'],
      validate: {
        validator: (v: unknown[]): boolean => Array.isArray(v) && v.length >= 1,
        message: 'At least one ticket line is required',
      },
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative'],
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    expiresAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>): Record<string, unknown> => {
        ret.id = (ret._id as Types.ObjectId).toString();
        ret.userId = String(ret.userId);
        ret.eventId = String(ret.eventId);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ eventId: 1, status: 1 });
orderSchema.index({ status: 1, expiresAt: 1 });

export const Order = model<IOrderDocument>('Order', orderSchema);
