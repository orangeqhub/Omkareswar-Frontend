import apiClient from '../../../services/apiClient';
import { toast } from '../../../store/toastStore';
import { isBuildingType } from '../../../utils/wizardDefaults';
import DynamicFieldsGroup from './DynamicFieldsGroup';
import { useLanguageStore } from '../../../store/languageStore';
import { getTe } from '../../../config/teluguDict';
import { isDuplicateField, matchesFieldCategory, isLandConversionField, shouldShowLandConversion } from './dynamicFieldFilters';

function resolveStep(f) {
  if (f.step === undefined || f.step === null || f.step === '') return 4;
  return Number(f.step);
}

export default function StepExtraFields({ step, data, onChange, propertyFields = [] }) {
  const language = useLanguageStore((s) => s.language);
  const g = (text) => getTe(text, language);
  const building = isBuildingType(data.ruleKey);
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

  const selectedApproval = Object.entries(dynamicFields).find(([id]) => /approval/i.test(id))?.[1] || '';
  const showLandConversion = shouldShowLandConversion(data.categorySlug, selectedApproval);

  const fields = propertyFields.filter((f) => {
    if (f.builtin !== true) return false;
    if (f.active === false) return false;
    if (isDuplicateField(f.id)) return false;
    if (isLandConversionField(f) && !showLandConversion) return false;
    if (resolveStep(f) !== Number(step)) return false;
    return matchesFieldCategory(f, data.categorySlug, building);
  });

  if (fields.length === 0) return null;

  return (
    <div className="mt-8 border-t border-gray-100 pt-6 space-y-4">
      <div className="border-l-4 border-brand-650 pl-3"><h4 className="text-xs font-bold text-brand-800 uppercase tracking-wider">{g('Additional Details')}</h4></div>
      <DynamicFieldsGroup
        fields={fields}
        dynamicFields={dynamicFields}
        updateDynamicField={updateDynamicField}
        onDocumentUpload={handleDynamicDocUpload}
      />
    </div>
  );
}