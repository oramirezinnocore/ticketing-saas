import { apiClient } from './client';
import type { AuthResponse, LoginCredentials, RegisterData } from '@/types';

export const authApi = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<AuthResponse>('/auth/login', credentials),

  register: (data: RegisterData) =>
    apiClient.post<AuthResponse>('/auth/register', data),

  verify: () => apiClient.get<{ valid: boolean }>('/auth/verify'),
};
