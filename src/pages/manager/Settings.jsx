import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { settingsService } from '../../services/settingsService';
import { toast } from '../../store/toastStore';

export default function ManagerSettings() {
  const { t } = useTranslation('dashboard');
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    settingsService.getSettings().then(setSettings);
  }, []);

  async function handleToggle(key) {
    const updated = await settingsService.updateSettings({ [key]: !settings[key] });
    setSettings(updated);
    toast.success(t('toast.settingsUpdated'));
  }

  async function handleMaxSize(e) {
    const updated = await settingsService.updateSettings({ maxImageSizeMb: Number(e.target.value) });
    setSettings(updated);
  }

  if (!settings) return null;

  return (
    <div className="max-w-lg space-y-5">
      <label className="flex items-center justify-between rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
        <span className="text-sm text-gray-700">{t('settings.autoApproveRegistrations')}</span>
        <input type="checkbox" checked={settings.autoApproveRegistrations} onChange={() => handleToggle('autoApproveRegistrations')} className="h-4 w-4 rounded border-gray-300 text-brand-600" />
      </label>
      <label className="flex items-center justify-between rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
        <span className="text-sm text-gray-700">{t('settings.autoApproveProperties')}</span>
        <input type="checkbox" checked={settings.autoApproveProperties} onChange={() => handleToggle('autoApproveProperties')} className="h-4 w-4 rounded border-gray-300 text-brand-600" />
      </label>
      <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
        <label htmlFor="max-image-size-manager" className="mb-1.5 block text-sm text-gray-700">{t('settings.maxImageSize')}</label>
        <input id="max-image-size-manager" type="number" min="1" max="20" value={settings.maxImageSizeMb} onChange={handleMaxSize} className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
    </div>
  );
}