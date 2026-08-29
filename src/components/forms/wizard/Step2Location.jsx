import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Locate, Loader2 } from 'lucide-react';
import { STATES, DISTRICTS, CITIES, MANDALS } from '../../../data/locations';
import { toast } from '../../../store/toastStore';
import { loadGoogleMapsScript } from '../../../utils/googleMaps';
import StepExtraFields from './StepExtraFields';

export default function Step2Location({ data, onChange, fieldConfig = {}, propertyFields = [] }) {
  const { t } = useTranslation('forms');
  const [detecting, setDetecting] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [markerInstance, setMarkerInstance] = useState(null);

  // ── Cascading dropdown state ──
  const [selectedState, setSelectedState] = useState(data.state || '');
  const [selectedDistrict, setSelectedDistrict] = useState(data.district || '');

  const districtsForState = useMemo(() => {
    if (!selectedState) return [];
    return DISTRICTS[selectedState] || [];
  }, [selectedState]);

  const citiesForDistrict = useMemo(() => {
    if (!selectedDistrict) return CITIES;
    return CITIES;
  }, [selectedDistrict]);

  const mandalsForDistrict = useMemo(() => {
    if (!selectedDistrict) return [];
    return MANDALS[selectedDistrict] || [];
  }, [selectedDistrict]);

  const mandalListed = mandalsForDistrict.includes(data.mandal);

  // Sync external data changes (e.g. geolocation) into local dropdown state
  useEffect(() => {
    if (data.state && data.state !== selectedState) {
      setSelectedState(data.state);
    }
  }, [data.state]);

  useEffect(() => {
    if (data.district && data.district !== selectedDistrict) {
      setSelectedDistrict(data.district);
    }
  }, [data.district]);

  // ── Google Maps init ──
  useEffect(() => {
    loadGoogleMapsScript(() => {
      if (typeof window === 'undefined' || !window.google) return;
      const mapEl = document.getElementById('wizard-map');
      if (!mapEl) return;
      const initLat = Number(data.mapLat) || 16.3067;
      const initLng = Number(data.mapLng) || 80.4365;
      const map = new window.google.maps.Map(mapEl, {
        center: { lat: initLat, lng: initLng },
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      const marker = new window.google.maps.Marker({
        position: { lat: initLat, lng: initLng },
        map,
        draggable: true,
      });
      marker.addListener('dragend', () => {
        const pos = marker.getPosition();
        onChange({
          mapLat: pos.lat().toFixed(6),
          mapLng: pos.lng().toFixed(6),
          mapLocation: `https://maps.google.com/?q=${pos.lat().toFixed(6)},${pos.lng().toFixed(6)}`,
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

  // ── Handlers ──
  function handleStateChange(e) {
    const val = e.target.value;
    setSelectedState(val);
    setSelectedDistrict('');
    onChange({ state: val, district: '', mandal: '' });
  }

  function handleDistrictChange(e) {
    const val = e.target.value;
    setSelectedDistrict(val);
    onChange({ district: val, mandal: '' });
  }

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
          mapLocation: `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`,
        };
        try {
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
          const geocode = await res.json();
          if (geocode?.status === 'OK' && geocode.results?.length > 0) {
            const addressComponents = geocode.results[0].address_components;
            let district = '', state = '', postcode = '';
            addressComponents.forEach(component => {
              const types = component.types;
              if (types.includes('administrative_area_level_2')) district = component.long_name;
              if (types.includes('administrative_area_level_1')) state = component.long_name;
              if (types.includes('postal_code')) postcode = component.long_name;
            });
            if (state) {
              const matchedState = STATES.find(s => s.toLowerCase() === state.toLowerCase());
              patch.state = matchedState || state;
            }
            if (district) {
              const cleaned = district.replace(/\s+district$/i, '');
              patch.district = cleaned;
            }
            if (postcode) patch.pincode = postcode;
            patch.address = geocode.results[0].formatted_address || '';
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

  const en = (id) => (fieldConfig[id] ? fieldConfig[id].enabled !== false : true);
  const lb = (id, def) => fieldConfig[id]?.label || def;

  const selectCls = 'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none bg-white';

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
        {/* ── State dropdown ── */}
        {en('state') && (
          <div>
            <label htmlFor="wz-state" className="mb-1.5 block text-sm font-medium text-gray-700">
              {lb('state', t('wizard.state'))}
            </label>
            <select
              id="wz-state"
              value={selectedState}
              onChange={handleStateChange}
              className={selectCls}
            >
              <option value="">Select State</option>
              {STATES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        {/* ── District dropdown (cascades from state) ── */}
        {en('district') && (
          <div>
            <label htmlFor="wz-district" className="mb-1.5 block text-sm font-medium text-gray-700">
              {lb('district', t('wizard.district'))}
            </label>
            <select
              id="wz-district"
              value={selectedDistrict}
              onChange={handleDistrictChange}
              disabled={!selectedState}
              className={selectCls + (!selectedState ? ' bg-gray-100 cursor-not-allowed' : '')}
            >
              <option value="">{selectedState ? 'Select District' : 'Select State first'}</option>
              {districtsForState.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {en('mandal') && (
          mandalsForDistrict.length === 0 ? (
            <div>
              <label htmlFor="wz-mandal" className="mb-1.5 block text-sm font-medium text-gray-700">
                {lb('mandal', t('wizard.mandal'))}
              </label>
              <input
                id="wz-mandal"
                value={data.mandal || ''}
                onChange={(e) => onChange({ mandal: e.target.value })}
                placeholder={selectedDistrict ? 'Enter Mandal' : 'Select District first'}
                disabled={!selectedDistrict}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="wz-mandal" className="mb-1.5 block text-sm font-medium text-gray-700">
                {lb('mandal', t('wizard.mandal'))}
              </label>
              <select
                id="wz-mandal"
                value={mandalListed ? data.mandal : '__other__'}
                onChange={(e) => {
                  if (e.target.value === '__other__') {
                    onChange({ mandal: '' });
                  } else {
                    onChange({ mandal: e.target.value });
                  }
                }}
                disabled={!selectedDistrict}
                className={selectCls + (!selectedDistrict ? ' bg-gray-100 cursor-not-allowed' : '')}
              >
                <option value="">{selectedDistrict ? 'Select Mandal' : 'Select District first'}</option>
                {mandalsForDistrict.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
                <option value="__other__">Other (type manually)</option>
              </select>
              {selectedDistrict && !mandalListed && (
                <input
                  type="text"
                  value={data.mandal || ''}
                  onChange={(e) => onChange({ mandal: e.target.value })}
                  placeholder="Type mandal name"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                />
              )}
            </div>
          )
        )}

        {/* ── City / Town / Village dropdown with "Other" option ── */}
        {en('cityVillage') && (
          <div>
            <label htmlFor="wz-city" className="mb-1.5 block text-sm font-medium text-gray-700">
              {lb('cityVillage', t('wizard.cityVillage'))}
            </label>
            <select
              id="wz-city"
              value={CITIES.includes(data.cityVillage) ? data.cityVillage : '__other__'}
              onChange={(e) => {
                if (e.target.value === '__other__') {
                  onChange({ cityVillage: '' });
                } else {
                  onChange({ cityVillage: e.target.value });
                }
              }}
              className={selectCls}
            >
              <option value="">Select City / Town / Village</option>
              {citiesForDistrict.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value="__other__">Other (type manually)</option>
            </select>
            {!CITIES.includes(data.cityVillage) && data.cityVillage !== '' && (
              <input
                type="text"
                value={data.cityVillage || ''}
                onChange={(e) => onChange({ cityVillage: e.target.value })}
                placeholder="Type city / town / village name"
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
              />
            )}
            {!CITIES.includes(data.cityVillage) && data.cityVillage === '' && (
              <input
                type="text"
                value=""
                onChange={(e) => onChange({ cityVillage: e.target.value })}
                placeholder="Type city / town / village name"
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
              />
            )}
          </div>
        )}
      </div>

      {en('locality') && (
        <div>
          <label htmlFor="wz-locality" className="mb-1.5 block text-sm font-medium text-gray-700">
            {lb('locality', t('wizard.locality'))}
          </label>
          <input
            id="wz-locality"
            value={data.locality || ''}
            onChange={(e) => onChange({ locality: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {en('landmark') && (
          <div>
            <label htmlFor="wz-landmark" className="mb-1.5 block text-sm font-medium text-gray-700">
              {lb('landmark', t('wizard.landmark'))}
            </label>
            <input
              id="wz-landmark"
              value={data.landmark || ''}
              onChange={(e) => onChange({ landmark: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            />
          </div>
        )}
        {en('pincode') && (
          <div>
            <label htmlFor="wz-pincode" className="mb-1.5 block text-sm font-medium text-gray-700">
              {lb('pincode', t('wizard.pincode'))}
            </label>
            <input
              id="wz-pincode"
              value={data.pincode || ''}
              onChange={(e) => onChange({ pincode: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            />
          </div>
        )}
      </div>

      {en('address') && (
        <div>
          <label htmlFor="wz-address" className="mb-1.5 block text-sm font-medium text-gray-700">
            {lb('address', t('wizard.address'))}
          </label>
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
          <label htmlFor="wz-map-location" className="mb-1.5 block text-sm font-medium text-gray-700">
            {lb('mapLocation', t('wizard.mapLocation'))}
          </label>
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

      <StepExtraFields step={2} data={data} onChange={onChange} propertyFields={propertyFields} />
    </div>
  );
}
