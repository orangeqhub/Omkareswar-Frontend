import { useTranslation } from 'react-i18next';
import { CATEGORIES } from '../../../config/categories';
import { useLanguageStore } from '../../../store/languageStore';

function isEnabled(id, fc) { return fc[id] ? fc[id].enabled !== false : true; }
function fl(id, def, fc) { return fc[id]?.label || def; }

export default function Step1BasicDetails({ data, onChange, fieldConfig = {} }) {
  const { t } = useTranslation('forms');
  const language = useLanguageStore((s) => s.language);
  const selectedCategory = CATEGORIES.find((c) => c.slug === data.categorySlug);

  return (
    <div className="space-y-4">
      {isEnabled('titleEn', fieldConfig) && (
        <div>
          <label htmlFor="wz-title" className="mb-1.5 block text-sm font-medium text-gray-700">
            {fl('titleEn', t('wizard.propertyTitle'), fieldConfig)}
          </label>
          <input
            id="wz-title"
            value={data.titleEn}
            onChange={(e) => onChange({ titleEn: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
          />
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          {t('wizard.category')}
        </label>
        <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700">
          {selectedCategory ? (language === 'te' ? selectedCategory.nameTe : selectedCategory.nameEn) : '—'}
        </div>
      </div>

      {isEnabled('descriptionEn', fieldConfig) && (
        <div>
          <label htmlFor="wz-desc" className="mb-1.5 block text-sm font-medium text-gray-700">
            {fl('descriptionEn', t('wizard.description'), fieldConfig)}
          </label>
          <textarea
            id="wz-desc"
            rows={4}
            value={data.descriptionEn}
            onChange={(e) => onChange({ descriptionEn: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
          />
        </div>
      )}

      {isEnabled('ventureName', fieldConfig) && (
        <div>
          <label htmlFor="wz-venture" className="mb-1.5 block text-sm font-medium text-gray-700">
            {fl('ventureName', t('wizard.ventureName'), fieldConfig)}
          </label>
          <input
            id="wz-venture"
            value={data.ventureName}
            onChange={(e) => onChange({ ventureName: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
          />
        </div>
      )}
    </div>
  );
}
