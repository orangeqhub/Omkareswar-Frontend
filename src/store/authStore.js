import { create } from 'zustand';
import { authService } from '../services/authService';

let sessionInitialisationPromise = null;

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  initialised: false,

  init: async () => {
    if (get().initialised) {
      return get().user;
    }

    set({ loading: true });

    try {
      if (!sessionInitialisationPromise) {
        sessionInitialisationPromise =
          authService.getSession();
      }

      const user = await sessionInitialisationPromise;

      set({
        user,
        loading: false,
        initialised: true,
      });

      return user;
    } catch (error) {
      console.warn(
        'Session restore failed:',
        error.message
      );

      set({
        user: null,
        loading: false,
        initialised: true,
      });

      return null;
    } finally {
      sessionInitialisationPromise = null;
    }
  },

  setUser: (user) => {
    set({
      user,
      loading: false,
      initialised: true,
    });
  },

  clearSession: () => {
    localStorage.removeItem('wizard_draft');
    set({
      user: null,
      loading: false,
      initialised: true,
    });
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('wizard_draft');
      set({
        user: null,
        loading: false,
        initialised: true,
      });
    }
  },
}));