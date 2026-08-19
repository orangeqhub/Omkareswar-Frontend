import { useTranslation } from 'react-i18next';

function formatNumber(value) {
  if (!value && value !== 0) return '';
  const str = String(value).replace(/[^0-9]/g, '');
  if (!str) return '';
  return Number(str).toLocaleString('en-IN');
}

function parseFormattedNumber(value) {
  return value.replace(/[^0-9]/g, '');
}

function FormattedInput({ id, value, onChange, className }) {
  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      value={formatNumber(value)}
      onChange={(e) => onChange(parseFormattedNumber(e.target.value))}
      className={className}
    />
  );
}

function en(id, fc) { return fc[id] ? fc[id].enabled !== false : true; }
function lb(id, def, fc) { return fc[id]?.label || def; }

export default function Step3PriceSize({ data, onChange, fieldConfig = {} }) {
  const { t } = useTranslation('forms');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {en('price', fieldConfig) && (
          <div>
            <label htmlFor="wz-price" className="mb-1.5 block text-sm font-medium text-gray-700">{lb('price', t('wizard.price'), fieldConfig)}</label>
            <FormattedInput
              id="wz-price"
              value={data.price}
              onChange={(val) => onChange({ price: val })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            />
          </div>
        )}
        {en('priceNegotiable', fieldConfig) && (
          <label className="mt-6 flex items-center gap-2 text-sm text-gray-700 sm:mt-8">
            <input type="checkbox" checked={data.priceNegotiable} onChange={(e) => onChange({ priceNegotiable: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-brand-600" />
            {lb('priceNegotiable', t('wizard.negotiable'), fieldConfig)}
          </label>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {en('area', fieldConfig) && (
          <div>
            <label htmlFor="wz-area" className="mb-1.5 block text-sm font-medium text-gray-700">{lb('area', t('wizard.area'), fieldConfig)}</label>
            <FormattedInput
              id="wz-area"
              value={data.area}
              onChange={(val) => onChange({ area: val })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            />
          </div>
        )}
        {en('areaUnit', fieldConfig) && (
          <div>
            <label htmlFor="wz-unit" className="mb-1.5 block text-sm font-medium text-gray-700">{lb('areaUnit', t('wizard.unit'), fieldConfig)}</label>
            <select id="wz-unit" value={data.areaUnit} onChange={(e) => onChange({ areaUnit: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm">
              <option value="sqft">Sq. Ft</option>
              <option value="sqyd">Sq. Yd</option>
              <option value="acre">Acre</option>
              <option value="cent">Cent</option>
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {en('dimensions', fieldConfig) && (
          <div>
            <label htmlFor="wz-dimensions" className="mb-1.5 block text-sm font-medium text-gray-700">{lb('dimensions', t('wizard.dimensions'), fieldConfig)}</label>
            <input id="wz-dimensions" value={data.dimensions} onChange={(e) => onChange({ dimensions: e.target.value })} placeholder="e.g. 30x40" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" />
          </div>
        )}
        {en('pricePerUnit', fieldConfig) && (
          <div>
            <label htmlFor="wz-priceperunit" className="mb-1.5 block text-sm font-medium text-gray-700">{lb('pricePerUnit', t('wizard.pricePerUnit'), fieldConfig)}</label>
            <FormattedInput
              id="wz-priceperunit"
              value={data.pricePerUnit}
              onChange={(val) => onChange({ pricePerUnit: val })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}
