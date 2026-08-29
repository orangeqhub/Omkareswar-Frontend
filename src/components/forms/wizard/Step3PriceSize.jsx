import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import StepExtraFields from './StepExtraFields';

function formatNumber(value) {
  if (!value && value !== 0) return '';
  const str = String(value).replace(/[^0-9]/g, '');
  if (!str) return '';
  return Number(str).toLocaleString('en-IN');
}

function parseFormattedNumber(value) {
  return value.replace(/[^0-9]/g, '');
}

function FormattedInput({ id, value, onChange, className, readOnly }) {
  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      readOnly={readOnly}
      value={formatNumber(value)}
      onChange={(e) => onChange(parseFormattedNumber(e.target.value))}
      className={className + (readOnly ? ' bg-gray-50 cursor-not-allowed' : '')}
    />
  );
}

function en(id, fc) { return fc[id] ? fc[id].enabled !== false : true; }
function lb(id, def, fc) { return fc[id]?.label || def; }

export default function Step3PriceSize({ data, onChange, fieldConfig = {}, propertyFields = [] }) {
  const { t } = useTranslation('forms');

  // Auto-calculate price = area × pricePerUnit
  useEffect(() => {
    const area = Number(data.area);
    const pricePerUnit = Number(data.pricePerUnit);
    if (area > 0 && pricePerUnit > 0) {
      const calculated = String(Math.round(area * pricePerUnit));
      if (calculated !== String(data.price)) {
        onChange({ price: calculated });
      }
    }
  }, [data.area, data.pricePerUnit]);

  return (
    <div className="space-y-4">
      {/* Row 1: Area + Unit */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {en('area', fieldConfig) && (
          <div>
            <label htmlFor="wz-area" className="mb-1.5 block text-sm font-medium text-gray-700">
              {lb('area', t('wizard.area'), fieldConfig)}
            </label>
            <FormattedInput
              id="wz-area"
              value={data.area}
              onChange={(val) => onChange({ area: val })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
        )}
        {en('areaUnit', fieldConfig) && (
          <div>
            <label htmlFor="wz-unit" className="mb-1.5 block text-sm font-medium text-gray-700">
              {lb('areaUnit', t('wizard.unit'), fieldConfig)}
            </label>
            <select
              id="wz-unit"
              value={data.areaUnit}
              onChange={(e) => onChange({ areaUnit: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none bg-white"
            >
              <option value="sqft">Sq. Ft</option>
              <option value="sqyd">Sq. Yd</option>
              <option value="acre">Acre</option>
              <option value="cent">Cent</option>
              <option value="gunta">Gunta</option>
              <option value="sqm">Sq. M</option>
              <option value="hectare">Hectare</option>
            </select>
          </div>
        )}
      </div>

      {/* Row 2: Dimensions + Price Per Unit */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {en('dimensions', fieldConfig) && (
          <div>
            <label htmlFor="wz-dimensions" className="mb-1.5 block text-sm font-medium text-gray-700">
              {lb('dimensions', t('wizard.dimensions'), fieldConfig)}
            </label>
            <input
              id="wz-dimensions"
              value={data.dimensions}
              onChange={(e) => onChange({ dimensions: e.target.value })}
              placeholder="e.g. 30x40"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
        )}
        {en('pricePerUnit', fieldConfig) && (
          <div>
            <label htmlFor="wz-priceperunit" className="mb-1.5 block text-sm font-medium text-gray-700">
              {lb('pricePerUnit', t('wizard.pricePerUnit'), fieldConfig)}
            </label>
            <FormattedInput
              id="wz-priceperunit"
              value={data.pricePerUnit}
              onChange={(val) => onChange({ pricePerUnit: val })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Row 3: Price (auto-calculated) + Negotiable */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {en('price', fieldConfig) && (
          <div>
            <label htmlFor="wz-price" className="mb-1.5 block text-sm font-medium text-gray-700">
              {lb('price', t('wizard.price'), fieldConfig)}
              {data.area > 0 && data.pricePerUnit > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-400">
                  (Area × Price/Unit = {formatNumber(data.area)} × {formatNumber(data.pricePerUnit)})
                </span>
              )}
            </label>
            <FormattedInput
              id="wz-price"
              value={data.price}
              onChange={(val) => onChange({ price: val })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
        )}
        {en('priceNegotiable', fieldConfig) && (
          <label className="flex items-center gap-2 text-sm text-gray-700 mt-6 sm:mt-8">
            <input
              type="checkbox"
              checked={data.priceNegotiable}
              onChange={(e) => onChange({ priceNegotiable: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-brand-600"
            />
            {lb('priceNegotiable', t('wizard.negotiable'), fieldConfig)}
          </label>
        )}
      </div>

      <StepExtraFields step={3} data={data} onChange={onChange} propertyFields={propertyFields} />
    </div>
  );
}
