import { create } from 'zustand';

let idCounter = 0;

export const useToastStore = create((set) => ({
  toasts: [],
  push: (toast) =>
    set((state) => {
      const id = ++idCounter;
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      }, toast.duration || 4000);
      return { toasts: [...state.toasts, { id, type: 'info', ...toast }] };
    }),
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (message) => useToastStore.getState().push({ type: 'success', message }),
  error: (message) => useToastStore.getState().push({ type: 'error', message }),
  info: (message) => useToastStore.getState().push({ type: 'info', message }),
};
