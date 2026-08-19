import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { CATEGORIES } from '../../config/categories';
import { PROPERTY_TYPE_CARD_SLUGS } from '../../config/propertyTypeCards';
import { useLanguageStore } from '../../store/languageStore';
import { useAuthStore } from '../../store/authStore';

function TypeIcon({ name, ...props }) {
  const Icon = Icons[name] || Icons.Home;
  return <Icon {...props} />;
}

export default function PostPropertyType() {
  const { t } = useTranslation('forms');
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const language = useLanguageStore((s) => s.language);

  const cards = PROPERTY_TYPE_CARD_SLUGS.map((slug) => CATEGORIES.find((c) => c.slug === slug)).filter(Boolean);

  function handleCategoryClick(category) {
    navigate(`/${user.role}/properties/new`, { state: { categorySlug: category.slug, ruleKey: category.ruleKey } });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-800">{t('postPropertyType.title')}</h1>
      <p className="mt-2 text-sm text-gray-500">{t('postPropertyType.subtitle')}</p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((category) => (
          <button
            key={category.slug}
            type="button"
            onClick={() => handleCategoryClick(category)}
            className="group relative flex flex-col items-center gap-2.5 rounded-2xl border border-gray-200 bg-warm-white p-5 text-center shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
              <TypeIcon name={category.icon} size={22} />
            </span>
            <span className="text-sm font-semibold text-gray-800">
              {language === 'te' ? category.nameTe : category.nameEn}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
