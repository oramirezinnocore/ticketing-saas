import { Document, Types } from 'mongoose';

export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REFUNDED = 'refunded',
}

export interface IPayment {
  id: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: string;
  externalId?: string;
  webhookProcessed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPaymentDocument extends Document {
  orderId: Types.ObjectId;
  amount: number;
  status: PaymentStatus;
  paymentMethod: string;
  externalId?: string;
  webhookProcessed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentPreferenceDTO {
  orderId: string;
  amount: number;
  description: string;
  buyerEmail: string;
}

export interface MercadoPagoWebhookPayload {
  action: string;
  api_version: string;
  data: {
    id: string;
  };
  date_created: string;
  id: number;
  live_mode: boolean;
  type: string;
  user_id: string;
}
