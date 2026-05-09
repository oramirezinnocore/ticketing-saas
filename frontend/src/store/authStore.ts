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
        // Debug log (remove in production)
        console.debug('[Auth] setAuth called', {
          hasUser: !!user,
          hasToken: !!token,
          tokenLength: token?.length,
        });

        // Validate user object
        if (!user || !user.id || !user.email || !user.role) {
          console.error('[Auth] Invalid user object provided');
          get().clearAuth();
          return;
        }

        // Validate token structure
        if (!isValidJWT(token)) {
          console.error('[Auth] Invalid JWT token structure');
          get().clearAuth();
          return;
        }

        // Check if token is expired
        if (isTokenExpired(token)) {
          console.warn('[Auth] Attempted to set expired token');
          get().clearAuth();
          return;
        }

        // Verify token payload matches user
        const payload = decodeJWT(token);
        if (!payload) {
          console.error('[Auth] Failed to decode token payload');
          get().clearAuth();
          return;
        }

        if (payload.userId !== user.id || payload.role !== user.role) {
          console.error('[Auth] Token payload does not match user object');
          get().clearAuth();
          return;
        }

        // All validations passed - set auth state
        console.debug('[Auth] Authentication successful');
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },

      clearAuth: () => {
        console.debug('[Auth] Clearing authentication state');

        // Clear localStorage
        localStorage.removeItem('token');

        // Clear zustand persisted state
        localStorage.removeItem('auth-storage');

        // Reset state
        set({ user: null, token: null, isAuthenticated: false });
      },

      validateSession: () => {
        const { token, user } = get();

        console.debug('[Auth] Validating session', {
          hasToken: !!token,
          hasUser: !!user,
        });

        // If no token or user, clear auth
        if (!token || !user) {
          console.debug('[Auth] No token or user found, clearing auth');
          get().clearAuth();
          return;
        }

        // Validate token structure
        if (!isValidJWT(token)) {
          console.warn('[Auth] Invalid token structure, clearing auth');
          get().clearAuth();
          return;
        }

        // Check if token is expired
        if (isTokenExpired(token)) {
          console.warn('[Auth] Token expired, clearing auth');
          get().clearAuth();
          return;
        }

        // Verify token payload matches user
        const payload = decodeJWT(token);
        if (!payload || payload.userId !== user.id) {
          console.warn('[Auth] Token payload mismatch, clearing auth');
          get().clearAuth();
          return;
        }

        // Session is valid
        console.debug('[Auth] Session is valid');
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
        console.debug('[Auth] Rehydrating storage');

        // Validate session after rehydration from localStorage
        if (state) {
          state.validateSession();
        }
      },
    }
  )
);
