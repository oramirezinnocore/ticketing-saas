import { apiClient } from './client';
import type { Ticket } from '@/types';

export const ticketsApi = {
  getUserTickets: () => apiClient.get<Ticket[]>('/tickets/user/me'),

  getByOrderId: (orderId: string) => apiClient.get<Ticket[]>(`/tickets/order/${orderId}`),
};
