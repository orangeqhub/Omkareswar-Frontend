import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Search, X, Clock, TrendingUp, Locate, Loader2 } from 'lucide-react';
import { CITIES } from '../../data/locations';
import { useLocationStore } from '../../store/locationStore';
import { useUserLocationStore } from '../../store/userLocationStore';
import { toast } from '../../store/toastStore';
import { loadGoogleMapsScript } from '../../utils/googleMaps';

function getGoogleString(obj) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'object') {
    if (typeof obj.text === 'string') return obj.text;
    for (const key in obj) {
      if (typeof obj[key] === 'string' && obj[key].length > 4) {
        return obj[key];
      }
    }
    for (const key in obj) {
      if (typeof obj[key] === 'string') return obj[key];
    }
    return typeof obj.toString === 'function' ? obj.toString() : '';
  }
  return String(obj);
}

/**
 * Shared "Select Location" panel used by the Navbar in both desktop
 * (positioned dropdown, anchored by the caller's `relative` wrapper) and
 * mobile (full-width bottom sheet via the `fixed` classes below `sm`).
 * Renders the same markup in both cases — only the panel's own positioning
 * classes change per breakpoint, so there's a single implementation to keep
 * behaviour (search/recent/popular/clear) consistent everywhere.
 */
export default function LocationPickerModal({ open, onClose }) {
  const { t } = useTranslation('common');
  const { selectedLocation, recentLocations, selectLocation, clearLocation } = useLocationStore();
  const requestLocation = useUserLocationStore((s) => s.requestLocation);
  const [query, setQuery] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [googleSuggestions, setGoogleSuggestions] = useState([]);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const inputRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setGoogleSuggestions([]);
      const id = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Debounced Google Places API call
  useEffect(() => {
    if (!open) return;
    if (!query.trim()) {
      setGoogleSuggestions([]);
      setLoadingGoogle(false);
      return;
    }

    setLoadingGoogle(true);
    const handler = setTimeout(() => {
      loadGoogleMapsScript((err) => {
        if (err) {
          setLoadingGoogle(false);
          return;
        }
        if (typeof window === 'undefined' || !window.google || !window.google.maps || !window.google.maps.places) {
          setLoadingGoogle(false);
          return;
        }

        try {
          if (window.google.maps.places.AutocompleteSuggestion) {
            const apCenter = new window.google.maps.LatLng(15.9129, 79.7400);
            window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
              input: query,
              includedRegionCodes: ['in'],
              locationBias: apCenter,
            }).then(({ suggestions }) => {
              setLoadingGoogle(false);
              if (suggestions && suggestions.length > 0) {
                const list = suggestions.map((p) => {
                  const display = getGoogleString(p.placePrediction.text || p.placePrediction.description);
                  const value = getGoogleString(p.placePrediction.structuredFormatting?.mainText || p.placePrediction.structuredFormatting?.main_text || display);
                  return { display, value };
                });
                setGoogleSuggestions(list);
              } else {
                setGoogleSuggestions([]);
              }
            }).catch((err) => {
              console.warn('AutocompleteSuggestion failed, falling back to AutocompleteService:', err);
              fallbackToService();
            });
          } else {
            fallbackToService();
          }
        } catch (err) {
          console.warn('Places API failed, falling back to AutocompleteService:', err);
          fallbackToService();
        }

        function fallbackToService() {
          try {
            const service = new window.google.maps.places.AutocompleteService();
            const apCenter = new window.google.maps.LatLng(15.9129, 79.7400);
            service.getPlacePredictions(
              {
                input: query,
                types: ['(regions)'],
                componentRestrictions: { country: 'in' },
                locationBias: apCenter,
                radius: 300000,
              },
              (predictions, status) => {
                setLoadingGoogle(false);
                if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                  const list = predictions.map((p) => ({
                    display: p.description,
                    value: p.structured_formatting?.main_text || p.description,
                  }));
                  setGoogleSuggestions(list);
                } else {
                  setGoogleSuggestions([]);
                }
              }
            );
          } catch (err) {
            console.error('Legacy AutocompleteService error:', err);
            setLoadingGoogle(false);
            setGoogleSuggestions([]);
          }
        }
      });
    }, 250); // 250ms debounce

    return () => clearTimeout(handler);
  }, [query, open]);

  const displayList = useMemo(() => {
    if (!query.trim()) {
      return CITIES.map((c) => ({ display: c, value: c }));
    }
    if (googleSuggestions.length > 0) {
      return googleSuggestions;
    }
    const term = query.trim().toLowerCase();
    return CITIES.filter((c) => c.toLowerCase().includes(term)).map((c) => ({ display: c, value: c }));
  }, [query, googleSuggestions]);

  if (!open) return null;

  function handleSelect(city) {
    selectLocation(city);
    onClose();
  }

  function handleAutoDetect() {
    setDetecting(true);
    requestLocation(
      (detectedCity) => {
        setDetecting(false);
        selectLocation(detectedCity);
        toast.success(`Location detected: ${detectedCity}`);
        onClose();
      },
      () => {
        setDetecting(false);
      }
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 sm:hidden" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('nav.selectLocation')}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] w-full overflow-auto rounded-t-2xl border border-gray-100 bg-warm-white p-4 shadow-2xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-full sm:mt-2 sm:max-h-[26rem] sm:w-80 sm:rounded-lg sm:p-3"
      >
        <div className="mb-3 flex items-center justify-between sm:hidden">
          <h2 className="text-base font-semibold text-brand-800">{t('nav.selectLocation')}</h2>
          <button type="button" onClick={onClose} aria-label={t('buttons.close')} className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAutoDetect}
          disabled={detecting}
          className="mb-2.5 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-50 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100 active:scale-[0.99] disabled:opacity-60"
        >
          {detecting ? (
            <>
              <Loader2 size={15} className="animate-spin text-brand-700" />
              <span>Detecting Location...</span>
            </>
          ) : (
            <>
              <Locate size={15} className="text-brand-700" />
              <span>Auto-Detect My Location</span>
            </>
          )}
        </button>

        <div className="relative">
          {loadingGoogle ? (
            <Loader2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
          ) : (
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          )}
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('location.searchPlaceholder')}
            aria-label={t('location.searchPlaceholder')}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm"
          />
        </div>

        {selectedLocation && (
          <div className="mt-3 flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2 text-sm">
            <span className="flex items-center gap-1.5 text-brand-800">
              <MapPin size={14} /> {selectedLocation}
            </span>
            <button
              type="button"
              onClick={() => {
                clearLocation();
                onClose();
              }}
              className="text-xs font-medium text-brand-700 hover:underline"
            >
              {t('location.clear')}
            </button>
          </div>
        )}

        {!query && recentLocations.length > 0 && (
          <div className="mt-3">
            <p className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase text-gray-400">
              <Clock size={12} /> {t('location.recent')}
            </p>
            <ul className="flex flex-wrap gap-2">
              {recentLocations.map((city) => (
                <li key={city}>
                  <button
                    type="button"
                    onClick={() => handleSelect(city)}
                    className="rounded-full border border-gray-200 px-3 py-1 text-xs hover:bg-gray-50"
                  >
                    {city}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-3">
          <p className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase text-gray-400">
            <TrendingUp size={12} /> {query ? t('location.results') : t('location.popular')}
          </p>
          {displayList.length === 0 ? (
            loadingGoogle ? (
              <p className="py-4 text-center text-sm text-gray-400">Searching locations...</p>
            ) : (
              <p className="py-4 text-center text-sm text-gray-400">{t('empty.noResults')}</p>
            )
          ) : (
            <ul role="listbox" aria-label={t('nav.selectLocation')} className="max-h-48 space-y-0.5 overflow-auto">
              {displayList.map((item) => (
                <li key={item.display}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={item.value === selectedLocation}
                    onClick={() => handleSelect(item.value)}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-brand-50 ${
                      item.value === selectedLocation ? 'bg-brand-50 font-semibold text-brand-800' : 'text-gray-700'
                    }`}
                  >
                    {item.display}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
