import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order } from '@/types';

interface CheckoutState {
  currentOrder: Order | null;
  pendingPayment: boolean;
  setCurrentOrder: (order: Order) => void;
  setPendingPayment: (pending: boolean) => void;
  clearCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      currentOrder: null,
      pendingPayment: false,
      setCurrentOrder: (order) => set({ currentOrder: order, pendingPayment: true }),
      setPendingPayment: (pending) => set({ pendingPayment: pending }),
      clearCheckout: () => set({ currentOrder: null, pendingPayment: false }),
    }),
    {
      name: 'checkout-storage',
      partialize: (state) => ({
        currentOrder: state.currentOrder,
        pendingPayment: state.pendingPayment,
      }),
    }
  )
);
