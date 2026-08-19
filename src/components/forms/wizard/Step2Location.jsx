import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Locate, Loader2 } from 'lucide-react';
import { STATES } from '../../../data/locations';
import { toast } from '../../../store/toastStore';
import { loadGoogleMapsScript } from '../../../utils/googleMaps';

export default function Step2Location({ data, onChange, fieldConfig = {} }) {
  const { t } = useTranslation('forms');
  const [detecting, setDetecting] = useState(false);

  const [mapInstance, setMapInstance] = useState(null);
  const [markerInstance, setMarkerInstance] = useState(null);

  useEffect(() => {
    loadGoogleMapsScript(() => {
      if (typeof window === 'undefined' || !window.google) return;

      const initLat = Number(data.mapLat) || 16.3067;
      const initLng = Number(data.mapLng) || 80.4365;

      const mapOptions = {
        center: { lat: initLat, lng: initLng },
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      };

      const map = new window.google.maps.Map(document.getElementById('wizard-map'), mapOptions);
      const marker = new window.google.maps.Marker({
        position: { lat: initLat, lng: initLng },
        map: map,
        draggable: true,
      });

      marker.addListener('dragend', () => {
        const position = marker.getPosition();
        onChange({
          mapLat: position.lat().toFixed(6),
          mapLng: position.lng().toFixed(6),
          mapLocation: `https://maps.google.com/?q=${position.lat().toFixed(6)},${position.lng().toFixed(6)}`
        });
      });

      setMapInstance(map);
      setMarkerInstance(marker);
    });
  }, []);

  useEffect(() => {
    if (mapInstance && markerInstance && data.mapLat && data.mapLng) {
      const nextLat = Number(data.mapLat);
      const nextLng = Number(data.mapLng);
      const currentPos = markerInstance.getPosition();
      if (!currentPos || Math.abs(currentPos.lat() - nextLat) > 0.0001 || Math.abs(currentPos.lng() - nextLng) > 0.0001) {
        markerInstance.setPosition({ lat: nextLat, lng: nextLng });
        mapInstance.setCenter({ lat: nextLat, lng: nextLng });
      }
    }
  }, [data.mapLat, data.mapLng, mapInstance, markerInstance]);

  function handleUseCurrentLocation() {
    setDetecting(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      setDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (mapInstance && markerInstance) {
          mapInstance.setCenter({ lat, lng });
          mapInstance.setZoom(15);
          markerInstance.setPosition({ lat, lng });
        }

        const patch = {
          mapLat: lat.toFixed(6),
          mapLng: lng.toFixed(6),
          mapLocation: `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`
        };

        try {
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
          const geocode = await res.json();
          if (geocode && geocode.status === 'OK' && geocode.results && geocode.results.length > 0) {
            const firstResult = geocode.results[0];
            const addressComponents = firstResult.address_components;
            
            let district = '';
            let state = '';
            let postcode = '';
            
            addressComponents.forEach(component => {
              const types = component.types;
              if (types.includes('administrative_area_level_2')) {
                district = component.long_name;
              }
              if (types.includes('administrative_area_level_1')) {
                state = component.long_name;
              }
              if (types.includes('postal_code')) {
                postcode = component.long_name;
              }
            });

            if (state) {
              const matchedState = STATES.find((s) => s.toLowerCase() === state.toLowerCase());
              patch.state = matchedState || state;
            }
            if (district) {
              const cleaned = district.replace(/\s+district$/i, '');
              patch.district = cleaned;
            }
            if (postcode) patch.pincode = postcode;
            
            patch.address = firstResult.formatted_address || '';
          }
        } catch (err) {
          console.warn('Google reverse geocoding failed:', err);
        }

        onChange(patch);
        setDetecting(false);
        toast.success('Location updated to current coordinates!');
      },
      (error) => {
        setDetecting(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Location permission was denied. Please enable location access or fill details manually.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          toast.error('Location information is unavailable.');
        } else if (error.code === error.TIMEOUT) {
          toast.error('The request to get user location timed out.');
        } else {
          toast.error('Unable to retrieve current location.');
        }
      },
      { timeout: 10000 }
    );
  }

  const en = (id) => fieldConfig[id] ? fieldConfig[id].enabled !== false : true;
  const lb = (id, def) => fieldConfig[id]?.label || def;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={detecting}
          className="flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 active:scale-95 disabled:opacity-60 cursor-pointer"
        >
          {detecting ? (
            <>
              <Loader2 size={14} className="animate-spin text-brand-700" />
              <span>Detecting Location...</span>
            </>
          ) : (
            <>
              <Locate size={14} className="text-brand-700" />
              <span>Use Current Location</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {en('state') && (
          <div>
            <label htmlFor="wz-state" className="mb-1.5 block text-sm font-medium text-gray-700">{lb('state', t('wizard.state'))}</label>
            <input id="wz-state" type="text" value={data.state || ''} onChange={(e) => onChange({ state: e.target.value })} placeholder="Enter State" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
          </div>
        )}
        {en('district') && (
          <div>
            <label htmlFor="wz-district" className="mb-1.5 block text-sm font-medium text-gray-700">{lb('district', t('wizard.district'))}</label>
            <input id="wz-district" type="text" value={data.district || ''} onChange={(e) => onChange({ district: e.target.value })} placeholder="Enter District" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {en('mandal') && (
          <div>
            <label htmlFor="wz-mandal" className="mb-1.5 block text-sm font-medium text-gray-700">{lb('mandal', t('wizard.mandal'))}</label>
            <input id="wz-mandal" value={data.mandal || ''} onChange={(e) => onChange({ mandal: e.target.value })} placeholder="Enter Mandal" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
          </div>
        )}
        {en('cityVillage') && (
          <div>
            <label htmlFor="wz-city" className="mb-1.5 block text-sm font-medium text-gray-700">{lb('cityVillage', t('wizard.cityVillage'))}</label>
            <input id="wz-city" type="text" value={data.cityVillage || ''} onChange={(e) => onChange({ cityVillage: e.target.value })} placeholder="Enter City/Town/Village" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
          </div>
        )}
      </div>

      {en('locality') && (
        <div>
          <label htmlFor="wz-locality" className="mb-1.5 block text-sm font-medium text-gray-700">{lb('locality', t('wizard.locality'))}</label>
          <input id="wz-locality" value={data.locality || ''} onChange={(e) => onChange({ locality: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {en('landmark') && (
          <div>
            <label htmlFor="wz-landmark" className="mb-1.5 block text-sm font-medium text-gray-700">{lb('landmark', t('wizard.landmark'))}</label>
            <input id="wz-landmark" value={data.landmark || ''} onChange={(e) => onChange({ landmark: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" />
          </div>
        )}
        {en('pincode') && (
          <div>
            <label htmlFor="wz-pincode" className="mb-1.5 block text-sm font-medium text-gray-700">{lb('pincode', t('wizard.pincode'))}</label>
            <input id="wz-pincode" value={data.pincode || ''} onChange={(e) => onChange({ pincode: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" />
          </div>
        )}
      </div>

      {en('address') && (
        <div>
          <label htmlFor="wz-address" className="mb-1.5 block text-sm font-medium text-gray-700">{lb('address', t('wizard.address'))}</label>
          <textarea
            id="wz-address"
            rows={2}
            value={data.address || ''}
            onChange={(e) => onChange({ address: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
          />
        </div>
      )}

      {en('mapLocation') && (
        <div>
          <label htmlFor="wz-map-location" className="mb-1.5 block text-sm font-medium text-gray-700">{lb('mapLocation', t('wizard.mapLocation'))}</label>
          <input
            id="wz-map-location"
            value={data.mapLocation || ''}
            onChange={(e) => onChange({ mapLocation: e.target.value })}
            placeholder={t('wizard.mapLocationPlaceholder')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm mb-2"
          />
          
          <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-300 shadow-sm mt-3 z-0">
            <div id="wizard-map" className="w-full h-full" />
          </div>
        </div>
      )}
    </div>
  );
}
