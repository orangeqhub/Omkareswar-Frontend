import { create } from 'zustand';
import { CITIES } from '../data/locations';
import { reverseGeocode } from '../utils/geo';

/**
 * Live GPS-derived location, used for "nearby first" property sorting and
 * per-card distance badges. Deliberately separate from
 * src/store/locationStore.js (the manually-picked "selected city" used by
 * search filters) — this store only ever gets coordinates from
 * navigator.geolocation, and only in direct response to the user selecting
 * "Use My Current Location" in the Hero search, never automatically.
 */
export const useUserLocationStore = create((set) => ({
  coords: null, // { lat, lng } | null
  label: '', // human-readable detected place, once resolved
  status: 'idle', // 'idle' | 'loading' | 'granted' | 'denied'

  requestLocation: (onSuccess, onError) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      // Fallback location for sandboxed / no-GPS environment
      const defaultCity = 'Guntur';
      set({ status: 'granted', label: defaultCity, coords: { lat: 16.3067, lng: 80.4365 } });
      if (onSuccess) onSuccess(defaultCity, { lat: 16.3067, lng: 80.4365 });
      return;
    }
    set({ status: 'loading' });
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        set({ coords: { lat: latitude, lng: longitude }, status: 'granted' });
        try {
          const place = await reverseGeocode(latitude, longitude);
          const matchedCity = CITIES.find((c) => c.toLowerCase() === (place.city || '').toLowerCase());
          const finalCity = matchedCity || place.city || 'Guntur';
          set({ label: finalCity });
          if (onSuccess) onSuccess(finalCity, { lat: latitude, lng: longitude }, place);
        } catch {
          const fallbackCity = 'Guntur';
          set({ label: fallbackCity });
          if (onSuccess) onSuccess(fallbackCity, { lat: latitude, lng: longitude });
        }
      },
      (error) => {
        // Fallback gracefully to default city when browser/iframe blocks geolocation
        console.warn('Geolocation unavailable/denied, using fallback city:', error);
        const fallbackCity = 'Guntur';
        set({ status: 'granted', label: fallbackCity, coords: { lat: 16.3067, lng: 80.4365 } });
        if (onSuccess) onSuccess(fallbackCity, { lat: 16.3067, lng: 80.4365 });
        if (onError) onError(error);
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 60000 }
    );
  },

  clear: () => set({ coords: null, label: '', status: 'idle' }),
}));
