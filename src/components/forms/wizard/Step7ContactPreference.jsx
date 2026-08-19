import { useTranslation } from 'react-i18next';

function en(id, fc) { return fc[id] ? fc[id].enabled !== false : true; }
function lb(id, def, fc) { return fc[id]?.label || def; }

export default function Step7ContactPreference({ data, onChange, fieldConfig = {} }) {
  const { t } = useTranslation('forms');

  return (
    <div className="space-y-4">
      {en('contactName', fieldConfig) && (
        <div>
          <label htmlFor="wz-contact-name" className="mb-1.5 block text-sm font-medium text-gray-700">
            {lb('contactName', t('wizard.contactName'), fieldConfig)}
          </label>
          <input id="wz-contact-name" value={data.contactName} onChange={(e) => onChange({ contactName: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" />
        </div>
      )}

      {en('contactPhone', fieldConfig) && (
        <div>
          <label htmlFor="wz-contact-phone" className="mb-1.5 block text-sm font-medium text-gray-700">
            {lb('contactPhone', t('wizard.contactPhone'), fieldConfig)}
          </label>
          <input id="wz-contact-phone" inputMode="numeric" value={data.contactPhone} onChange={(e) => onChange({ contactPhone: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" />
        </div>
      )}

      {en('preferWhatsapp', fieldConfig) && (
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={data.preferWhatsapp} onChange={(e) => onChange({ preferWhatsapp: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-brand-600" />
          {lb('preferWhatsapp', t('wizard.preferWhatsapp'), fieldConfig)}
        </label>
      )}
      {en('preferCall', fieldConfig) && (
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={data.preferCall} onChange={(e) => onChange({ preferCall: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-brand-600" />
          {lb('preferCall', t('wizard.preferCall'), fieldConfig)}
        </label>
      )}
      {en('hidePhone', fieldConfig) && (
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={data.hidePhone} onChange={(e) => onChange({ hidePhone: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-brand-600" />
          {lb('hidePhone', t('wizard.hidePhone'), fieldConfig)}
        </label>
      )}
    </div>
  );
}
