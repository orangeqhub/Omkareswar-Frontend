import { useTranslation } from 'react-i18next';
import StepExtraFields from './StepExtraFields';
import { getAmenitiesForCategory } from '../../../config/categoryConfig';
import { CATEGORIES } from '../../../config/categories';
import AmenityIcon from '../../common/AmenityIcon';
import { useLanguageStore } from '../../../store/languageStore';
import { getTe } from '../../../config/teluguDict';

export default function Step5Amenities({ data, onChange, fieldConfig = {}, propertyFields = [], amenitiesByCategory = {} }) {
  const { t } = useTranslation('forms');
  const language = useLanguageStore((s) => s.language);
  const g = (text) => getTe(text, language);
  const selectedCategory = CATEGORIES.find((c) => c.slug === data.categorySlug);

  const amenitiesEnabled = fieldConfig.amenities ? fieldConfig.amenities.enabled !== false : true;
  const amenities = (data.amenities || []);
  const amenityList = getAmenitiesForCategory(data.categorySlug, amenitiesByCategory);
  const selectedExtras = amenities.filter((a) => !amenityList.includes(a));

  function toggle(amenity) {
    const has = amenities.includes(amenity);
    onChange({ amenities: has ? amenities.filter((a) => a !== amenity) : [...amenities, amenity] });
  }

  return (
    <div className="space-y-8">
      {amenitiesEnabled ? (
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium text-gray-700">{t('wizard.amenities')}</span>
            {data.categorySlug && (
              <span className="text-[11px] font-medium text-brand-600 bg-brand-50 rounded px-2 py-0.5">
                {t('wizard.shownFor', { defaultValue: 'Shown for:' })} {language === 'te' ? (selectedCategory?.nameTe || data.categorySlug) : (selectedCategory?.nameEn || data.categorySlug)}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {amenityList.map((a) => (
              <label key={a} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={amenities.includes(a)}
                  onChange={() => toggle(a)}
                  className="h-4 w-4 shrink-0 rounded border-gray-300 text-brand-600"
                />
                <AmenityIcon amenity={a} size={16} className="shrink-0 text-brand-600" />
                <span className="min-w-0 truncate">{g(a)}</span>
              </label>
            ))}
            {selectedExtras.map((a) => (
              <label key={a} className="flex items-center gap-2 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={amenities.includes(a)}
                  onChange={() => toggle(a)}
                  className="h-4 w-4 shrink-0 rounded border-gray-300 text-brand-600"
                />
                <AmenityIcon amenity={a} size={16} className="shrink-0 text-amber-600" />
                <span className="min-w-0 truncate">{g(a)}</span>
              </label>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic py-4">{g('Amenities section is disabled.')}</p>
      )}

      <StepExtraFields step={5} data={data} onChange={onChange} propertyFields={propertyFields} />
    </div>
  );
}