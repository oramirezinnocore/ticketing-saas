import { Document, Types } from 'mongoose';

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export interface IOrderTicketLine {
  ticketType: string;
  quantity: number;
}

export interface IOrder {
  id: string;
  userId: string;
  eventId: string;
  tickets: IOrderTicketLine[];
  total: number;
  status: OrderStatus;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderDTO {
  userId: string;
  eventId: string;
  tickets: IOrderTicketLine[];
}

export interface IOrderDocument extends Document {
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  tickets: IOrderTicketLine[];
  total: number;
  status: OrderStatus;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
