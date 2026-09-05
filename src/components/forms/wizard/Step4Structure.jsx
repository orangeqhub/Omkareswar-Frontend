import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BedDouble, Bath, Armchair, CookingPot, DoorOpen } from 'lucide-react';
import { isBuildingType } from '../../../utils/wizardDefaults';
import apiClient from '../../../services/apiClient';
import { toast } from '../../../store/toastStore';
import { getDynamicFieldsForCategory, SCHEDULE_CATEGORIES } from '../../../config/propertyFieldDefinitions';
import DynamicFieldsGroup from './DynamicFieldsGroup';
import StepExtraFields from './StepExtraFields';
import Step3PriceSize from './Step3PriceSize';
import { useLanguageStore } from '../../../store/languageStore';
import { getTe } from '../../../config/teluguDict';
import { DYNAMIC_DUPLICATES, isDuplicateField, matchesFieldCategory, isLandConversionField, shouldShowLandConversion, PLOT_APPROVAL_CATEGORIES, LAND_PRICE_CATEGORIES } from './dynamicFieldFilters';

const LAND_DIMENSION_CATEGORIES = ['agricultural-lands', 'commercial-plots'];

function Counter({ label, value, onChange, id, icon: Icon }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {Icon && <Icon size={14} className="text-brand-600" />}
        {label}
      </label>
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onChange(Math.max(0, Number(value) - 1))} className="h-9 w-9 rounded-lg border border-gray-300 bg-white font-medium text-gray-700 transition hover:bg-gray-50 cursor-pointer">-</button>
        <input id={id} type="number" min="0" value={value || 0} onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))} className="w-12 h-9 rounded-lg border border-gray-300 px-1 py-1 text-center text-sm font-semibold focus:border-brand-500 focus:outline-none" />
        <button type="button" onClick={() => onChange(Number(value || 0) + 1)} className="h-9 w-9 rounded-lg border border-gray-300 bg-white font-medium text-gray-700 transition hover:bg-gray-50 cursor-pointer">+</button>
      </div>
    </div>
  );
}

function lb(id, def, fc) { return fc[id]?.label || def; }

// Reorders a field list so that every field matching `movePred` sits directly
// after the field matching `anchorPred` (e.g. Land Conversion after Approval
// Type, Ownership Type after Owner Name).
function moveBeside(fields, anchorPred, movePred) {
  const movable = fields.filter((f) => movePred(f) && !anchorPred(f));
  const rest = fields.filter((f) => !(movePred(f) && !anchorPred(f)));
  const result = [];
  for (const f of rest) {
    result.push(f);
    if (anchorPred(f)) {
      const partner = movable.shift();
      if (partner) result.push(partner);
    }
  }
  while (movable.length) result.push(movable.shift());
  return result;
}

export default function Step4Structure({ data, onChange, fieldConfig = {}, propertyFields = [] }) {
  const { t } = useTranslation('forms');
  const language = useLanguageStore((s) => s.language);
  const g = (text) => getTe(text, language);
  const building = isBuildingType(data.ruleKey);

  function updateStructure(patch) { onChange({ structure: { ...data.structure, ...patch } }); }
  function updatePlot(patch) { onChange({ plotDetails: { ...data.plotDetails, ...patch } }); }

  const dynamicFields = data.dynamicFields || {};

  // Auto-calculate Area when Length & Width are entered:
  // plots → Sq.Yds (L × W ÷ 9), all other categories → Sq.Ft (L × W).
  // Agricultural & commercial lands stay in Sq.Ft (L × W).
  useEffect(() => {
    if (data.areaManual) return;
    const length = Number(data.plotDetails?.plotLength);
    const width = Number(data.plotDetails?.plotWidth);
    if (length > 0 && width > 0) {
      const useSqYds = PLOT_APPROVAL_CATEGORIES.includes(data.categorySlug) && !LAND_PRICE_CATEGORIES.includes(data.categorySlug);
      if (useSqYds) {
        const sqYds = String(Math.round((length * width) / 9));
        if (sqYds !== String(data.area) || data.areaUnit !== 'sqyd') {
          onChange({ area: sqYds, areaUnit: 'sqyd' });
        }
      } else {
        const sqFt = String(Math.round(length * width));
        if (sqFt !== String(data.area) || data.areaUnit !== 'sqft') {
          onChange({ area: sqFt, areaUnit: 'sqft' });
        }
      }
    }
  }, [data.areaManual, data.categorySlug, data.plotDetails?.plotLength, data.plotDetails?.plotWidth, data.area, data.areaUnit, onChange]);

  // Auto-calculate Length/Width from Schedule/Boundaries feet values entered in
  // the direction fields: Length = (East + West) ÷ 2, Width = (North + South) ÷ 2.
  // Apartments and commercial buildings use Schedule B only; all other categories
  // use the single Schedule / Boundaries. Decimal values are preserved.
  useEffect(() => {
    const df = data.dynamicFields || {};
    const useScheduleB = SCHEDULE_CATEGORIES.includes(data.categorySlug);
    const east = Number(df[useScheduleB ? 'dyn_schB_eastFeet' : 'dyn_eastFeet']);
    const west = Number(df[useScheduleB ? 'dyn_schB_westFeet' : 'dyn_westFeet']);
    const north = Number(df[useScheduleB ? 'dyn_schB_northFeet' : 'dyn_northFeet']);
    const south = Number(df[useScheduleB ? 'dyn_schB_southFeet' : 'dyn_southFeet']);
    const patch = {};
    if (east > 0 && west > 0) {
      const length = String((east + west) / 2);
      if (length !== String(data.plotDetails?.plotLength)) patch.plotLength = length;
    }
    if (north > 0 && south > 0) {
      const width = String((north + south) / 2);
      if (width !== String(data.plotDetails?.plotWidth)) patch.plotWidth = width;
    }
    if (Object.keys(patch).length > 0) {
      onChange({ plotDetails: { ...data.plotDetails, ...patch } });
    }
  }, [data.categorySlug, data.dynamicFields, data.plotDetails, onChange]);

  function updateDynamicField(fieldId, value) {
    onChange({ dynamicFields: { ...dynamicFields, [fieldId]: value } });
  }

  async function handleDynamicDocUpload(fieldId, file) {
    try {
      toast.info('Uploading document, please wait...');
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiClient.post('/uploads/property-document', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = res.data?.data?.url || res.data?.url;
      updateDynamicField(fieldId, url);
      toast.success('Document uploaded successfully!');
    } catch (err) {
      console.error('Failed to upload dynamic document:', err);
      toast.error('Failed to upload document');
    }
  }

  const categoryFields = getDynamicFieldsForCategory(data.categorySlug);
  const enabledCatFields = categoryFields
    .filter((f) => {
      const cfg = fieldConfig[f.id];
      if (cfg && cfg.enabled === false) return false;
      if (DYNAMIC_DUPLICATES[f.id]) return false;
      return true;
    })
    .map((f) => {
      const cfg = fieldConfig[f.id];
      return cfg && Array.isArray(cfg.options) && cfg.options.length > 0 ? { ...f, options: cfg.options } : f;
    });

  const approvalField = enabledCatFields.find((f) => /approval/i.test(f.id));
  const selectedApproval = approvalField ? (dynamicFields[approvalField.id] || '') : '';
  const showLandConversion = shouldShowLandConversion(data.categorySlug, selectedApproval);

  const enabledCustomFields = propertyFields.filter((f) => {
    if (f.builtin === true) return false;
    if (f.active === false) return false;
    if (isDuplicateField(f.id)) return false;
    if (isLandConversionField(f) && !showLandConversion) return false;
    return matchesFieldCategory(f, data.categorySlug, building);
  });

  const allDynamicFields = [...enabledCatFields, ...enabledCustomFields];
  const directionFields = allDynamicFields.filter((f) => f.type === 'direction');
  let regularFields = allDynamicFields.filter((f) => f.type !== 'direction');
  regularFields = moveBeside(regularFields, (f) => /approval/i.test(f.id), isLandConversionField);
  regularFields = moveBeside(regularFields, (f) => f.id === 'f_owner' || /owner name/i.test(f.label || ''), (f) => f.id === 'dyn_ownershipType' || /ownership type/i.test(f.label || ''));
  const hasBuildingSection = building;

  // Schedule A / B carry the boundary directions; Schedule C only keeps
  // Ground Sq Yards and Total Valuation for apartments & commercial buildings.
  const isScheduleCategory = SCHEDULE_CATEGORIES.includes(data.categorySlug);
  const scheduleCFields = isScheduleCategory
    ? allDynamicFields.filter((f) => (f.id || '').startsWith('dyn_schC_'))
    : [];
  if (scheduleCFields.length > 0) {
    regularFields = regularFields.filter((f) => !(f.id || '').startsWith('dyn_schC_'));
  }
  const hasDynamicSection = regularFields.length > 0;
  const scheduleBlocks = isScheduleCategory
    ? [
        ...['A', 'B']
          .map((s) => ({
            key: `dyn_sch${s}_`,
            label: g(`Schedule ${s}`),
            fields: directionFields.filter((f) => (f.feetId || '').startsWith(`dyn_sch${s}_`)),
          }))
          .filter((grp) => grp.fields.length > 0),
        ...(scheduleCFields.length > 0 ? [{ label: g('Schedule C'), fields: scheduleCFields }] : []),
      ]
    : directionFields.length > 0
      ? [{ key: 'single', label: g('Schedule / Boundaries'), fields: directionFields }]
      : [];

  return (
    <div className="space-y-8 bg-white rounded-2xl p-6 border border-gray-150 shadow-sm">
      <div>
        <h3 className="text-lg font-bold text-gray-900">{building ? g('Residential Property Details') : g('Land Details')}</h3>
        <p className="text-xs text-gray-500 mt-1">{g('Please provide structure specifications, category-specific details, and document uploads.')}</p>
      </div>

      {hasBuildingSection && (
        <div className="space-y-6">
          <div className="border-l-4 border-brand-650 pl-3"><h4 className="text-xs font-bold text-brand-800 uppercase tracking-wider">{g('1. Layout & Room Counters')}</h4></div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
            <Counter id="wz-bedrooms" label={lb('bedrooms', t('wizard.bedrooms'), fieldConfig)} icon={BedDouble} value={data.structure?.bedrooms} onChange={(v) => updateStructure({ bedrooms: v })} />
            <Counter id="wz-bathrooms" label={lb('bathrooms', t('wizard.bathrooms'), fieldConfig)} icon={Bath} value={data.structure?.bathrooms} onChange={(v) => updateStructure({ bathrooms: v })} />
            <Counter id="wz-halls" label={lb('halls', t('wizard.halls'), fieldConfig)} icon={Armchair} value={data.structure?.halls} onChange={(v) => updateStructure({ halls: v })} />
            <Counter id="wz-kitchens" label={lb('kitchens', t('wizard.kitchens'), fieldConfig)} icon={CookingPot} value={data.structure?.kitchens} onChange={(v) => updateStructure({ kitchens: v })} />
            <Counter id="wz-balconies" label={lb('balconies', t('wizard.balconies'), fieldConfig)} icon={DoorOpen} value={data.structure?.balconies} onChange={(v) => updateStructure({ balconies: v })} />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="wz-floors" className="mb-1.5 block text-xs font-semibold text-gray-700">{t('wizard.floors')}</label>
              <input id="wz-floors" type="number" min="0" value={data.structure?.floors || ''} onChange={(e) => updateStructure({ floors: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/25 focus:outline-none transition-colors" placeholder={g('Total floors in building')} />
            </div>
            <div>
              <label htmlFor="wz-propfloor" className="mb-1.5 block text-xs font-semibold text-gray-700">{t('wizard.propertyFloor')}</label>
              <input id="wz-propfloor" type="number" min="0" value={data.structure?.propertyFloor || ''} onChange={(e) => updateStructure({ propertyFloor: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/25 focus:outline-none transition-colors" placeholder={g('Floor number of this property')} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="wz-furnishing" className="mb-1.5 block text-xs font-semibold text-gray-700">{t('wizard.furnishing')}</label>
              <select id="wz-furnishing" value={data.structure?.furnishing || 'unfurnished'} onChange={(e) => updateStructure({ furnishing: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/25 focus:outline-none transition-colors">
                <option value="unfurnished">{g('Unfurnished')}</option>
                <option value="semi">{g('Semi-furnished')}</option>
                <option value="furnished">{g('Furnished')}</option>
              </select>
            </div>
            <div>
              <label htmlFor="wz-parking" className="mb-1.5 block text-xs font-semibold text-gray-700">{t('wizard.parking')}</label>
              {data.categorySlug === 'apartments' ? (
                <select id="wz-parking" value={data.structure?.parking || ''} onChange={(e) => updateStructure({ parking: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/25 focus:outline-none transition-colors">
                  <option value="">{g('Select...')}</option>
                  <option value="Yes">{g('Yes')}</option>
                  <option value="No">{g('No')}</option>
                </select>
              ) : (
                <input id="wz-parking" value={data.structure?.parking || ''} onChange={(e) => updateStructure({ parking: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/25 focus:outline-none transition-colors" placeholder={g('e.g. Car / Bike parking availability')} />
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="wz-age" className="mb-1.5 block text-xs font-semibold text-gray-700">{t('wizard.ageOfProperty')}</label>
              <input id="wz-age" value={data.structure?.ageOfProperty || ''} onChange={(e) => updateStructure({ ageOfProperty: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/25 focus:outline-none transition-colors" placeholder={g('e.g. New / 2 years old')} />
            </div>
          </div>
        </div>
      )}

      {hasBuildingSection && hasDynamicSection && <hr className="border-gray-100" />}

      {hasDynamicSection && (
        <div className="space-y-6">
          <div className="border-l-4 border-brand-650 pl-3"><h4 className="text-xs font-bold text-brand-800 uppercase tracking-wider">{hasBuildingSection ? g('2. Category-Specific Details') : g('1. Property Details')}</h4></div>
          <DynamicFieldsGroup
            fields={regularFields}
            dynamicFields={dynamicFields}
            updateDynamicField={updateDynamicField}
            onDocumentUpload={handleDynamicDocUpload}
          />
        </div>
      )}

      {scheduleBlocks.length > 0 && (
        <>
          <hr className="border-gray-100" />
          <div className="space-y-8">
            {scheduleBlocks.map((group) => (
              <div key={group.label} className="space-y-4">
                <div className="border-l-4 border-brand-650 pl-3"><h4 className="text-xs font-bold text-brand-800 uppercase tracking-wider">{group.label}</h4></div>
                <DynamicFieldsGroup
                  fields={group.fields}
                  vertical={group.key !== undefined}
                  dynamicFields={dynamicFields}
                  updateDynamicField={updateDynamicField}
                  onDocumentUpload={handleDynamicDocUpload}
                />
              </div>
            ))}
          </div>
        </>
      )}

      <hr className="border-gray-150" />
      <div className="space-y-6">
        <div className="border-l-4 border-brand-650 pl-3"><h4 className="text-xs font-bold text-brand-800 uppercase tracking-wider">{building || hasDynamicSection ? g('3. Dimensions & Borders (Optional)') : g('2. Dimensions & Borders (Optional)')}</h4></div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="wz-plotlength" className="mb-1.5 block text-xs font-semibold text-gray-700">{LAND_DIMENSION_CATEGORIES.includes(data.categorySlug) ? g('Land Length') : t('wizard.plotLength')}</label>
            <input id="wz-plotlength" value={data.plotDetails?.plotLength || ''} onChange={(e) => updatePlot({ plotLength: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/25 focus:outline-none transition-colors" placeholder="e.g. 50 ft" />
          </div>
          <div>
            <label htmlFor="wz-plotwidth" className="mb-1.5 block text-xs font-semibold text-gray-700">{LAND_DIMENSION_CATEGORIES.includes(data.categorySlug) ? g('Land Width') : t('wizard.plotWidth')}</label>
            <input id="wz-plotwidth" value={data.plotDetails?.plotWidth || ''} onChange={(e) => updatePlot({ plotWidth: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/25 focus:outline-none transition-colors" placeholder="e.g. 40 ft" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="wz-roadwidth" className="mb-1.5 block text-xs font-semibold text-gray-700">{t('wizard.roadWidth')}</label>
            <input id="wz-roadwidth" value={data.plotDetails?.roadWidth || ''} onChange={(e) => updatePlot({ roadWidth: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/25 focus:outline-none transition-colors" placeholder="e.g. 30 ft" />
          </div>
          <div>
            <label htmlFor="wz-boundary" className="mb-1.5 block text-xs font-semibold text-gray-700">{t('wizard.boundary')}</label>
            <input id="wz-boundary" value={data.plotDetails?.boundary || ''} onChange={(e) => updatePlot({ boundary: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/25 focus:outline-none transition-colors" placeholder={g('e.g. Fencing / Compound wall')} />
          </div>
        </div>
      </div>

      <StepExtraFields step={4} data={data} onChange={onChange} propertyFields={propertyFields} />

      <hr className="border-gray-150" />
      <div className="space-y-6">
        <div className="border-l-4 border-brand-650 pl-3"><h4 className="text-xs font-bold text-brand-800 uppercase tracking-wider">{g('Price & Size')}</h4></div>
        <Step3PriceSize data={data} onChange={onChange} fieldConfig={fieldConfig} />
      </div>
    </div>
  );
}