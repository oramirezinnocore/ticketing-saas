import { apiClient } from './client';

export interface TicketWithQR {
  id: string;
  code: string;
  orderId: string;
  eventId: {
    _id?: string;
    id?: string;
    title: string;
    date: string;
    location: string;
    coverImageUrl?: string;
  };
  status: 'valid' | 'used';
  qrCode?: string;
  signedToken: string;
  createdAt: string;
  updatedAt: string;
}

export interface ValidateTicketRequest {
  token: string;
}

export interface ValidateTicketResponse {
  success: boolean;
  ticket: {
    id: string;
    code: string;
    status: string;
    eventId: {
      title: string;
      date: string;
      location: string;
    };
  };
  message: string;
}

export const ticketsApi = {
  getUserTickets: () => apiClient.get<TicketWithQR[]>('/tickets/my-tickets'),

  getTicketById: (id: string) => apiClient.get<TicketWithQR>(`/tickets/${id}`),

  validateTicket: (data: ValidateTicketRequest) =>
    apiClient.post<ValidateTicketResponse>('/tickets/validate', data),

  checkTicketStatus: (data: ValidateTicketRequest) =>
    apiClient.post<{
      id: string;
      code: string;
      status: string;
      eventId: unknown;
    }>('/tickets/check-status', data),
};
