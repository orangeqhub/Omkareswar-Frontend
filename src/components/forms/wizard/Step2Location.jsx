import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Locate, Loader2 } from 'lucide-react';
import { STATES, DISTRICTS, CITIES } from '../../../data/locations';
import { useUserLocationStore } from '../../../store/userLocationStore';
import { toast } from '../../../store/toastStore';

export default function Step2Location({ data, onChange, errors }) {
  const { t } = useTranslation('forms');
  const [detecting, setDetecting] = useState(false);
  const requestLocation = useUserLocationStore((s) => s.requestLocation);
  const districtOptions = data.state ? DISTRICTS[data.state] || [] : Object.values(DISTRICTS).flat();

  function handleAutoDetect() {
    setDetecting(true);
    requestLocation(
      (detectedCity, coords, place) => {
        setDetecting(false);
        const patch = {};

        const matchedState = STATES.find((s) => s.toLowerCase() === (place?.state || '').toLowerCase()) || 'Andhra Pradesh';
        patch.state = matchedState;

        const availableDistricts = DISTRICTS[matchedState] || Object.values(DISTRICTS).flat();
        const matchedDistrict = availableDistricts.find((d) => d.toLowerCase() === (place?.district || '').toLowerCase());
        if (matchedDistrict) patch.district = matchedDistrict;

        const matchedCity = CITIES.find((c) => c.toLowerCase() === detectedCity.toLowerCase());
        if (matchedCity) patch.cityVillage = matchedCity;

        if (place?.pincode) patch.pincode = place.pincode;
        if (place?.fullAddress || place?.road) patch.address = place.fullAddress || place.road;

        if (coords?.lat && coords?.lng) {
          patch.mapLocation = `https://maps.google.com/?q=${coords.lat},${coords.lng}`;
        }

        onChange(patch);
        toast.success(`Location detected: ${detectedCity}`);
      },
      () => {
        setDetecting(false);
        toast.error('Could not auto-detect location. Please fill manually.');
      }
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleAutoDetect}
          disabled={detecting}
          className="flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 active:scale-95 disabled:opacity-60"
        >
          {detecting ? (
            <>
              <Loader2 size={14} className="animate-spin text-brand-700" />
              <span>Detecting Location...</span>
            </>
          ) : (
            <>
              <Locate size={14} className="text-brand-700" />
              <span>Auto-Detect My Location</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="wz-state" className="mb-1.5 block text-sm font-medium text-gray-700">{t('wizard.state')}</label>
          <select id="wz-state" value={data.state} onChange={(e) => onChange({ state: e.target.value, district: '' })} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm">
            <option value="">-</option>
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="wz-district" className="mb-1.5 block text-sm font-medium text-gray-700">{t('wizard.district')}</label>
          <select id="wz-district" value={data.district} onChange={(e) => onChange({ district: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm">
            <option value="">-</option>
            {districtOptions.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {errors?.district && <p className="mt-1 text-xs text-red-600">{t('validation.required')}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="wz-mandal" className="mb-1.5 block text-sm font-medium text-gray-700">{t('wizard.mandal')}</label>
          <input id="wz-mandal" value={data.mandal} onChange={(e) => onChange({ mandal: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label htmlFor="wz-city" className="mb-1.5 block text-sm font-medium text-gray-700">{t('wizard.cityVillage')}</label>
          <select id="wz-city" value={data.cityVillage} onChange={(e) => onChange({ cityVillage: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm">
            <option value="">-</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors?.cityVillage && <p className="mt-1 text-xs text-red-600">{t('validation.required')}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="wz-locality" className="mb-1.5 block text-sm font-medium text-gray-700">{t('wizard.locality')}</label>
        <input id="wz-locality" value={data.locality} onChange={(e) => onChange({ locality: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="wz-landmark" className="mb-1.5 block text-sm font-medium text-gray-700">{t('wizard.landmark')}</label>
          <input id="wz-landmark" value={data.landmark} onChange={(e) => onChange({ landmark: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label htmlFor="wz-pincode" className="mb-1.5 block text-sm font-medium text-gray-700">{t('wizard.pincode')}</label>
          <input id="wz-pincode" value={data.pincode} onChange={(e) => onChange({ pincode: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" />
          {errors?.pincode && <p className="mt-1 text-xs text-red-600">{t('validation.invalidPincode')}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="wz-address" className="mb-1.5 block text-sm font-medium text-gray-700">{t('wizard.address')}</label>
        <textarea
          id="wz-address"
          rows={2}
          value={data.address}
          onChange={(e) => onChange({ address: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
        />
        {errors?.address && <p className="mt-1 text-xs text-red-600">{t('validation.required')}</p>}
      </div>

      <div>
        <label htmlFor="wz-map-location" className="mb-1.5 block text-sm font-medium text-gray-700">{t('wizard.mapLocation')}</label>
        <input
          id="wz-map-location"
          value={data.mapLocation}
          onChange={(e) => onChange({ mapLocation: e.target.value })}
          placeholder={t('wizard.mapLocationPlaceholder')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
        />
        {errors?.mapLocation && <p className="mt-1 text-xs text-red-600">{t('validation.required')}</p>}
      </div>
    </div>
  );
}
