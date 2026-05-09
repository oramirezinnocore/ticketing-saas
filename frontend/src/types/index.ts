export enum UserRole {
  USER = 'user',
  ORGANIZER = 'organizer',
  ADMIN = 'admin',
}

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export enum TicketStatus {
  VALID = 'valid',
  USED = 'used',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface TicketType {
  name: string;
  price: number;
  quantity: number;
  quantityAvailable: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  organizerId: string;
  ticketTypes: TicketType[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  date: string;
  ticketTypes: TicketType[];
}

export interface OrderTicketLine {
  ticketType: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  eventId: string;
  tickets: OrderTicketLine[];
  total: number;
  status: OrderStatus;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  eventId: string;
  tickets: OrderTicketLine[];
}

export interface Ticket {
  id: string;
  code: string;
  orderId: string;
  eventId: string;
  userId: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  externalId?: string;
  webhookProcessed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentPreference {
  preferenceId: string;
  initPoint: string;
  payment: Payment;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: unknown;
}
