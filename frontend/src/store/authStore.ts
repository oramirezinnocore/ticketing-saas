import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { decodeJWT, isTokenExpired, isValidJWT } from '@/utils/jwt';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  validateSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        // Validate user object
        if (!user || !user.id || !user.email || !user.role) {
          get().clearAuth();
          return;
        }

        // Validate token structure
        if (!isValidJWT(token)) {
          get().clearAuth();
          return;
        }

        // Check if token is expired
        if (isTokenExpired(token)) {
          get().clearAuth();
          return;
        }

        // Verify token payload matches user
        const payload = decodeJWT(token);
        if (!payload) {
          get().clearAuth();
          return;
        }

        if (payload.userId !== user.id || payload.role !== user.role) {
          get().clearAuth();
          return;
        }

        // All validations passed - set auth state
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },

      clearAuth: () => {
        // Clear localStorage
        localStorage.removeItem('token');

        // Clear zustand persisted state
        localStorage.removeItem('auth-storage');

        // Reset state
        set({ user: null, token: null, isAuthenticated: false });
      },

      validateSession: () => {
        const { token, user } = get();

        // If no token or user, clear auth
        if (!token || !user) {
          get().clearAuth();
          return;
        }

        // Validate token structure
        if (!isValidJWT(token)) {
          get().clearAuth();
          return;
        }

        // Check if token is expired
        if (isTokenExpired(token)) {
          get().clearAuth();
          return;
        }

        // Verify token payload matches user
        const payload = decodeJWT(token);
        if (!payload || payload.userId !== user.id) {
          get().clearAuth();
          return;
        }
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
