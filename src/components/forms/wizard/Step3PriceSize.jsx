import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LAND_PRICE_CATEGORIES } from './dynamicFieldFilters';
import { getTe as g } from '../../../config/teluguDict';

function formatNumber(value) {
  if (!value && value !== 0) return '';
  const str = String(value).replace(/[^0-9]/g, '');
  if (!str) return '';
  return Number(str).toLocaleString('en-IN');
}

function parseFormattedNumber(value) {
  return value.replace(/[^0-9]/g, '');
}

function formatDecimal(value, maxDigits) {
  if (!value && value !== 0) return '';
  return Number(value).toLocaleString('en-IN', { maximumFractionDigits: maxDigits });
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

export default function Step3PriceSize({ data, onChange, fieldConfig = {} }) {
  const { t } = useTranslation('forms');

  // Agricultural & commercial lands: price is driven by Acres converted from the
  // Sq.Ft area — Sq.Yds = Area ÷ 9, Cents = Sq.Yds ÷ 48, Acres = Cents ÷ 100.
  const isLand = LAND_PRICE_CATEGORIES.includes(data.categorySlug);
  const areaVal = Number(data.area) || 0;
  const sqYardsVal = isLand && areaVal > 0 ? areaVal / 9 : 0;
  const centsVal = isLand && sqYardsVal > 0 ? sqYardsVal / 48 : 0;
  const acresVal = isLand && centsVal > 0 ? centsVal / 100 : 0;

  // For plots, Surface Area is stored in Sq.Yds, so the sq.ft equivalent (L × W)
  // is shown as a hint beside the Area field.
  const plotLength = Number(data.plotDetails?.plotLength);
  const plotWidth = Number(data.plotDetails?.plotWidth);
  const sqFtHint = plotLength > 0 && plotWidth > 0 ? Math.round(plotLength * plotWidth) : Math.round(Number(data.area) * 9);

  // Auto-calculate price = area × pricePerUnit (for plots: Sq.Yds × Price/Sq.Yd;
  // for agricultural & commercial lands: Acres × Price/Acre).
  useEffect(() => {
    const pricePerUnit = Number(data.pricePerUnit);
    if (isLand) {
      if (acresVal > 0 && pricePerUnit > 0) {
        const calculated = String(Math.round(acresVal * pricePerUnit));
        if (calculated !== String(data.price)) {
          onChange({ price: calculated });
        }
      }
    } else {
      const area = Number(data.area);
      if (area > 0 && pricePerUnit > 0) {
        const calculated = String(Math.round(area * pricePerUnit));
        if (calculated !== String(data.price)) {
          onChange({ price: calculated });
        }
      }
    }
  }, [data.area, data.pricePerUnit]);

  // Auto-calculate Total Amount = area × Government Value (for plots: Sq.Yds ×
  // Govt/Sq.Yd; for agricultural & commercial lands: Acres × Govt Value per Acre).
  useEffect(() => {
    const govtValue = Number(data.govtValue);
    if (isLand) {
      if (acresVal > 0 && govtValue > 0) {
        const calculated = String(Math.round(acresVal * govtValue));
        if (calculated !== String(data.totalAmount)) {
          onChange({ totalAmount: calculated });
        }
      }
    } else {
      const area = Number(data.area);
      if (area > 0 && govtValue > 0) {
        const calculated = String(Math.round(area * govtValue));
        if (calculated !== String(data.totalAmount)) {
          onChange({ totalAmount: calculated });
        }
      }
    }
  }, [data.area, data.govtValue]);

  return (
    <div className="space-y-4">
      {/* Row 1: Area + Unit */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {en('area', fieldConfig) && (
          <div>
            <label htmlFor="wz-area" className="mb-1.5 block text-sm font-medium text-gray-700">
              {lb('area', t('wizard.area'), fieldConfig)}
              {data.areaUnit === 'sqyd' && Number(data.area) > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-400">
                  (≈ {formatNumber(sqFtHint)} sq.ft)
                </span>
              )}
            </label>
            <FormattedInput
              id="wz-area"
              value={data.area}
              onChange={(val) => onChange({ area: val })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            />
            <div className="mt-1.5 flex items-center gap-1.5">
              <input
                id="wz-areamanual"
                type="checkbox"
                checked={!!data.areaManual}
                onChange={(e) => onChange({ areaManual: e.target.checked })}
                className="h-3.5 w-3.5 rounded border-gray-300 text-brand-600"
              />
              <label htmlFor="wz-areamanual" className="text-xs text-gray-500">{t('wizard.areaManual')}</label>
            </div>
          </div>
        )}
        {en('areaUnit', fieldConfig) && (
          <div>
            <label htmlFor="wz-unit" className="mb-1.5 block text-sm font-medium text-gray-700">
              {lb('areaUnit', t('wizard.unit'), fieldConfig)}
              {isLand && <span className="ml-2 text-xs font-normal text-gray-400">(Sq.Ft, conversions below)</span>}
            </label>
            {isLand ? (
              <div className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5 text-sm text-gray-600">Sq. Ft</div>
            ) : (
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
            )}
          </div>
        )}
      </div>

      {/* Conversion panel (Agricultural & Commercial Lands only): Area → Sq.Yds → Cents → Acres */}
      {isLand && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {g('Sq Yards')}
              <span className="ml-1.5 text-xs font-normal text-gray-400">(Area ÷ 9)</span>
            </label>
            <div className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-700">{formatDecimal(sqYardsVal, 2)}</div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {g('Cents')}
              <span className="ml-1.5 text-xs font-normal text-gray-400">(Sq Yards ÷ 48)</span>
            </label>
            <div className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-700">{formatDecimal(centsVal, 2)}</div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {g('Acre')}
              <span className="ml-1.5 text-xs font-normal text-gray-400">(Cents ÷ 100)</span>
            </label>
            <div className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-700">{formatDecimal(acresVal, 4)}</div>
          </div>
        </div>
      )}

      {/* Row 2: Price Per Unit + Government Value */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {en('pricePerUnit', fieldConfig) && (
          <div>
            <label htmlFor="wz-priceperunit" className="mb-1.5 block text-sm font-medium text-gray-700">
              {lb('pricePerUnit', t('wizard.pricePerUnit'), fieldConfig)}
              {isLand && <span className="ml-1.5 text-xs font-normal text-gray-400">(Price per Acre)</span>}
              <span className="ml-1.5 rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">Private</span>
            </label>
            <FormattedInput
              id="wz-priceperunit"
              value={data.pricePerUnit}
              onChange={(val) => onChange({ pricePerUnit: val })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
        )}
        <div>
          <label htmlFor="wz-govtvalue" className="mb-1.5 block text-sm font-medium text-gray-700">
            {t('wizard.govtValue')}
            {isLand && <span className="ml-1.5 text-xs font-normal text-gray-400">(Govt Value per Acre)</span>}
            <span className="ml-1.5 rounded border border-gray-600 bg-gray-800 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Govt</span>
          </label>
          <FormattedInput
            id="wz-govtvalue"
            value={data.govtValue}
            onChange={(val) => onChange({ govtValue: val })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Row 3: Price (auto-calculated) + Total Amount (auto-calculated) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {en('price', fieldConfig) && (
          <div>
            <label htmlFor="wz-price" className="mb-1.5 block text-sm font-medium text-gray-700">
              {lb('price', t('wizard.price'), fieldConfig)}
              <span className="ml-1.5 rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">Private</span>
              {isLand
                ? acresVal > 0 && data.pricePerUnit > 0 && (
                    <span className="ml-2 text-xs font-normal text-gray-400">
                      (Acres × Price/Acre = {formatDecimal(acresVal, 4)} × {formatNumber(data.pricePerUnit)})
                    </span>
                  )
                : data.area > 0 && data.pricePerUnit > 0 && (
                    <span className="ml-2 text-xs font-normal text-gray-400">
                      ({data.areaUnit === 'sqyd' ? 'Sq.Yds × Price/Sq.Yd' : data.areaUnit === 'sqft' ? 'Sq.Ft × Price/Sq.Ft' : 'Area × Price/Unit'} = {formatNumber(data.area)} × {formatNumber(data.pricePerUnit)})
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
        <div>
          <label htmlFor="wz-totalamount" className="mb-1.5 block text-sm font-medium text-gray-700">
            {t('wizard.totalAmount')}
            <span className="ml-1.5 rounded border border-gray-600 bg-gray-800 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Govt</span>
            {isLand
              ? acresVal > 0 && data.govtValue > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-400">
                  (Acres × Govt Value = {formatDecimal(acresVal, 4)} × {formatNumber(data.govtValue)})
                </span>
              )
              : data.area > 0 && data.govtValue > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-400">
                  (Area × Govt Value = {formatNumber(data.area)} × {formatNumber(data.govtValue)})
                </span>
              )}
          </label>
          <FormattedInput
            id="wz-totalamount"
            value={data.totalAmount}
            onChange={(val) => onChange({ totalAmount: val })}
            readOnly
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
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
    </div>
  );
}
