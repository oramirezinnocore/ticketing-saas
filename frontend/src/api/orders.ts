import { apiClient } from './client';
import type { Order, CreateOrderData } from '@/types';

export interface CreateOrderWithPaymentData extends CreateOrderData {
  buyerEmail: string;
  description?: string;
}

export interface CreateOrderWithPaymentResponse {
  order: Order;
  preferenceId: string;
  initPoint: string;
}

export const ordersApi = {
  create: (data: CreateOrderData) => apiClient.post<Order>('/orders', data),

  createWithPayment: (data: CreateOrderWithPaymentData) =>
    apiClient.post<CreateOrderWithPaymentResponse>('/orders/with-payment', data),

  getById: (id: string) => apiClient.get<Order>(`/orders/${id}`),

  getUserOrders: () => apiClient.get<Order[]>('/orders/user/me'),
};
