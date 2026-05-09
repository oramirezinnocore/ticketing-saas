import axios, { AxiosError, AxiosInstance } from 'axios';
import type { ApiResponse, ApiError } from '@/types';
import { isValidJWT, isTokenExpired } from '@/utils/jwt';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor: Add Authorization header
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');

        // Debug log
        console.debug('[API] Request interceptor', {
          hasToken: !!token,
          tokenValid: token ? isValidJWT(token) : false,
          url: config.url,
        });

        // Only add Authorization header if token is valid
        if (token && isValidJWT(token) && !isTokenExpired(token)) {
          config.headers.Authorization = `Bearer ${token}`;
        } else if (token) {
          // Token exists but is invalid/expired - clear it
          console.warn('[API] Invalid or expired token found, clearing');
          localStorage.removeItem('token');
          localStorage.removeItem('auth-storage');
        }

        return config;
      },
      (error) => {
        console.error('[API] Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor: Handle 401 errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        console.debug('[API] Response error:', {
          status: error.response?.status,
          message: error.response?.data?.message,
        });

        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
          console.warn('[API] 401 Unauthorized - clearing auth and redirecting');

          // Clear all auth data
          localStorage.removeItem('token');
          localStorage.removeItem('auth-storage');

          // Only redirect if not already on login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url);
    return response.data.data;
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data);
    return response.data.data;
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data);
    return response.data.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url);
    return response.data.data;
  }
}

export const apiClient = new ApiClient();
