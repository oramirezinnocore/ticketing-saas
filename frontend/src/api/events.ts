import { apiClient } from './client';
import type { Event, CreateEventData } from '@/types';

export const eventsApi = {
  getAll: () => apiClient.get<Event[]>('/events'),

  getById: (id: string) => apiClient.get<Event>(`/events/${id}`),

  create: (data: CreateEventData) => apiClient.post<Event>('/events', data),

  delete: (id: string) => apiClient.delete<{ message: string }>(`/events/${id}`),
};
