import { Document, Types } from 'mongoose';

export enum TicketStatus {
  VALID = 'valid',
  USED = 'used',
}

/** One issued admission unit; `code` is the stable identifier to embed in QR (sign externally for validation). */
export interface ITicket {
  id: string;
  code: string;
  orderId: string;
  eventId: string;
  userId: string;
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITicketDocument extends Document {
  code: string;
  orderId: Types.ObjectId;
  eventId: Types.ObjectId;
  userId: Types.ObjectId;
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
}
