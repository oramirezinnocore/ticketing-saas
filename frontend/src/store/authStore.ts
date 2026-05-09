import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  validateSession: () => void;
}

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

// Decode JWT without verification (verification happens on backend)
const decodeJWT = (token: string): JWTPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

// Check if JWT is expired
const isTokenExpired = (token: string): boolean => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;

  // exp is in seconds, Date.now() is in milliseconds
  return payload.exp * 1000 < Date.now();
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        // Validate token before setting
        if (isTokenExpired(token)) {
          console.warn('Attempted to set expired token');
          get().clearAuth();
          return;
        }

        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },
      clearAuth: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
      validateSession: () => {
        const { token, user } = get();

        // If no token or user, clear auth
        if (!token || !user) {
          get().clearAuth();
          return;
        }

        // If token is expired, clear auth
        if (isTokenExpired(token)) {
          console.warn('Session expired');
          get().clearAuth();
          return;
        }

        // Token is valid, keep session alive
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Validate session after rehydration from localStorage
        if (state) {
          state.validateSession();
        }
      },
    }
  )
);
