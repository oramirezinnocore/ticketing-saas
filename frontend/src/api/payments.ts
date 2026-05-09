import { apiClient } from './client';
import type { PaymentPreference, Payment } from '@/types';

export const paymentsApi = {
  createPreference: (data: { orderId: string; description: string; buyerEmail: string }) =>
    apiClient.post<PaymentPreference>('/payments/preference', data),

  getByOrderId: (orderId: string) => apiClient.get<Payment>(`/payments/order/${orderId}`),
};
