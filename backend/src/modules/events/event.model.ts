import { Schema, model, Types } from 'mongoose';
import { IEventDocument, ITicketType } from './event.interface';

const ticketTypeSchema = new Schema<ITicketType>(
  {
    name: {
      type: String,
      required: [true, 'Ticket type name is required'],
      trim: true,
      maxlength: [120, 'Ticket type name must not exceed 120 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Ticket price is required'],
      min: [0, 'Price cannot be negative'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      validate: {
        validator: (value: number): boolean => Number.isInteger(value),
        message: 'Quantity must be a whole number',
      },
    },
    quantityAvailable: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const eventSchema = new Schema<IEventDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [300, 'Title must not exceed 300 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [10000, 'Description must not exceed 10000 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Organizer is required'],
      index: true,
    },
    ticketTypes: {
      type: [ticketTypeSchema],
      required: [true, 'At least one ticket type is required'],
      validate: {
        validator: (v: ITicketType[]): boolean => Array.isArray(v) && v.length >= 1,
        message: 'At least one ticket type is required',
      },
    },
    coverImageUrl: {
      type: String,
      trim: true,
      validate: {
        validator: (value: string): boolean => {
          if (!value) return true; // Optional field
          try {
            const url = new URL(value);
            return url.protocol === 'http:' || url.protocol === 'https:';
          } catch {
            return false;
          }
        },
        message: 'Cover image URL must be a valid HTTP/HTTPS URL',
      },
    },
    coverImageAlt: {
      type: String,
      trim: true,
      maxlength: [200, 'Image alt text must not exceed 200 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>): Record<string, unknown> => {
        ret.id = (ret._id as { toString: () => string }).toString();
        if (
          ret.organizerId &&
          typeof ret.organizerId === 'object' &&
          'toString' in ret.organizerId
        ) {
          ret.organizerId = (ret.organizerId as Types.ObjectId).toString();
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

eventSchema.index({ organizerId: 1, date: 1 });

export const Event = model<IEventDocument>('Event', eventSchema);
