import { apiClient } from './client';
import type { Order, CreateOrderData } from '@/types';

export const ordersApi = {
  create: (data: CreateOrderData) => apiClient.post<Order>('/orders', data),

  getById: (id: string) => apiClient.get<Order>(`/orders/${id}`),

  getUserOrders: () => apiClient.get<Order[]>('/orders/user/me'),
};
