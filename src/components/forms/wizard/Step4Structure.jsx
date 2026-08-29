import { useTranslation } from 'react-i18next';
import { BedDouble, Bath, Armchair, CookingPot, DoorOpen } from 'lucide-react';
import { isBuildingType } from '../../../utils/wizardDefaults';
import apiClient from '../../../services/apiClient';
import { toast } from '../../../store/toastStore';
import { getDynamicFieldsForCategory } from '../../../config/propertyFieldDefinitions';
import DynamicFieldsGroup from './DynamicFieldsGroup';
import StepExtraFields from './StepExtraFields';
import { DYNAMIC_DUPLICATES, isDuplicateField, matchesFieldCategory } from './dynamicFieldFilters';

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

export default function Step4Structure({ data, onChange, fieldConfig = {}, propertyFields = [] }) {
  const { t } = useTranslation('forms');
  const building = isBuildingType(data.ruleKey);

  function updateStructure(patch) { onChange({ structure: { ...data.structure, ...patch } }); }
  function updatePlot(patch) { onChange({ plotDetails: { ...data.plotDetails, ...patch } }); }

  const dynamicFields = data.dynamicFields || {};

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

  const enabledCustomFields = propertyFields.filter((f) => {
    if (f.builtin === true) return false;
    if (f.active === false) return false;
    if (isDuplicateField(f.id)) return false;
    return matchesFieldCategory(f, data.categorySlug, building);
  });

  const allDynamicFields = [...enabledCatFields, ...enabledCustomFields];
  const regularFields = allDynamicFields.filter((f) => f.type !== 'direction');
  const directionFields = allDynamicFields.filter((f) => f.type === 'direction');
  const hasBuildingSection = building;
  const hasDynamicSection = regularFields.length > 0;
  const hasDirectionSection = directionFields.length > 0;

  return (
    <div className="space-y-8 bg-white rounded-2xl p-6 border border-gray-150 shadow-sm">
      <div>
        <h3 className="text-lg font-bold text-gray-900">{building ? 'Residential Property Details' : 'Land Details'}</h3>
        <p className="text-xs text-gray-500 mt-1">Please provide structure specifications, category-specific details, and document uploads.</p>
      </div>

      {hasBuildingSection && (
        <div className="space-y-6">
          <div className="border-l-4 border-brand-650 pl-3"><h4 className="text-xs font-bold text-brand-800 uppercase tracking-wider">1. Layout & Room Counters</h4></div>
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
              <input id="wz-floors" type="number" min="0" value={data.structure?.floors || ''} onChange={(e) => updateStructure({ floors: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/25 focus:outline-none transition-colors" placeholder="Total floors in building" />
            </div>
            <div>
              <label htmlFor="wz-propfloor" className="mb-1.5 block text-xs font-semibold text-gray-700">{t('wizard.propertyFloor')}</label>
              <input id="wz-propfloor" type="number" min="0" value={data.structure?.propertyFloor || ''} onChange={(e) => updateStructure({ propertyFloor: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/25 focus:outline-none transition-colors" placeholder="Floor number of this property" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="wz-furnishing" className="mb-1.5 block text-xs font-semibold text-gray-700">{t('wizard.furnishing')}</label>
              <select id="wz-furnishing" value={data.structure?.furnishing || 'unfurnished'} onChange={(e) => updateStructure({ furnishing: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/25 focus:outline-none transition-colors">
                <option value="unfurnished">Unfurnished</option>
                <option value="semi">Semi-furnished</option>
                <option value="furnished">Furnished</option>
              </select>
            </div>
            <div>
              <label htmlFor="wz-parking" className="mb-1.5 block text-xs font-semibold text-gray-700">{t('wizard.parking')}</label>
              <input id="wz-parking" value={data.structure?.parking || ''} onChange={(e) => updateStructure({ parking: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/25 focus:outline-none transition-colors" placeholder="e.g. Car / Bike parking availability" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="wz-age" className="mb-1.5 block text-xs font-semibold text-gray-700">{t('wizard.ageOfProperty')}</label>
              <input id="wz-age" value={data.structure?.ageOfProperty || ''} onChange={(e) => updateStructure({ ageOfProperty: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/25 focus:outline-none transition-colors" placeholder="e.g. New / 2 years old" />
            </div>
          </div>
        </div>
      )}

      {hasBuildingSection && hasDynamicSection && <hr className="border-gray-100" />}

      {hasDynamicSection && (
        <div className="space-y-6">
          <div className="border-l-4 border-brand-650 pl-3"><h4 className="text-xs font-bold text-brand-800 uppercase tracking-wider">{hasBuildingSection ? '2. Category-Specific Details' : '1. Property Details'}</h4></div>
          <DynamicFieldsGroup
            fields={regularFields}
            dynamicFields={dynamicFields}
            updateDynamicField={updateDynamicField}
            onDocumentUpload={handleDynamicDocUpload}
          />
        </div>
      )}

      {hasDirectionSection && (
        <>
          <hr className="border-gray-100" />
          <div className="space-y-6">
            <div className="border-l-4 border-brand-650 pl-3"><h4 className="text-xs font-bold text-brand-800 uppercase tracking-wider">Schedule / Boundaries</h4></div>
            <DynamicFieldsGroup
              fields={directionFields}
              vertical
              dynamicFields={dynamicFields}
              updateDynamicField={updateDynamicField}
              onDocumentUpload={handleDynamicDocUpload}
            />
          </div>
        </>
      )}

      {!building && (
        <>
          <hr className="border-gray-150" />
          <div className="space-y-6">
            <div className="border-l-4 border-brand-650 pl-3"><h4 className="text-xs font-bold text-brand-800 uppercase tracking-wider">{hasDynamicSection ? '3. Dimensions & Borders (Optional)' : '2. Dimensions & Borders (Optional)'}</h4></div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="wz-plotlength" className="mb-1.5 block text-xs font-semibold text-gray-700">{t('wizard.plotLength')}</label>
                <input id="wz-plotlength" value={data.plotDetails?.plotLength || ''} onChange={(e) => updatePlot({ plotLength: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/25 focus:outline-none transition-colors" placeholder="e.g. 50 ft" />
              </div>
              <div>
                <label htmlFor="wz-plotwidth" className="mb-1.5 block text-xs font-semibold text-gray-700">{t('wizard.plotWidth')}</label>
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
                <input id="wz-boundary" value={data.plotDetails?.boundary || ''} onChange={(e) => updatePlot({ boundary: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/25 focus:outline-none transition-colors" placeholder="e.g. Fencing / Compound wall" />
              </div>
            </div>
          </div>
        </>
      )}

      <StepExtraFields step={4} data={data} onChange={onChange} propertyFields={propertyFields} />
    </div>
  );
}