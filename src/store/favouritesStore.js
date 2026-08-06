import { create } from 'zustand';
import { propertyService } from '../services/propertyService';

export const useFavouritesStore = create((set, get) => ({
  ids: [],

  refresh: async (userId) => {
    if (!userId) return set({ ids: [] });
    try {
      const ids = await propertyService.getFavouriteIds(userId);
      set({ ids: Array.isArray(ids) ? ids : [] });
    } catch {
      set({ ids: [] });
    }
  },

  toggle: async (userId, propertyId) => {
    if (!userId) return;
    try {
      const res = await propertyService.toggleFavourite(userId, propertyId);
      const current = get().ids;
      if (res?.favourited) {
        set({ ids: [...current.filter((id) => id !== propertyId), propertyId] });
      } else {
        set({ ids: current.filter((id) => id !== propertyId) });
      }
    } catch (e) {
      console.error('Failed to toggle favourite:', e);
    }
  },

  isFavourite: (propertyId) => {
    const currentIds = get().ids;
    return Array.isArray(currentIds) && currentIds.includes(propertyId);
  },
}));
