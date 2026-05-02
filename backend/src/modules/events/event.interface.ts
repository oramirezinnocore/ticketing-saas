import { Document, Types } from 'mongoose';

export interface ITicketType {
  name: string;
  price: number;
  quantity: number;
  quantityAvailable: number;
}

export interface IEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  organizerId: string;
  ticketTypes: ITicketType[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventDTO {
  title: string;
  description: string;
  date: string | Date;
  organizerId: string;
  ticketTypes: ITicketType[];
}

export interface IEventDocument extends Document {
  title: string;
  description: string;
  date: Date;
  organizerId: Types.ObjectId;
  ticketTypes: ITicketType[];
  createdAt: Date;
  updatedAt: Date;
}
