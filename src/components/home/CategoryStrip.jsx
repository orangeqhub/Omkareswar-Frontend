import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { CATEGORIES } from '../../config/categories';
import { useLanguageStore } from '../../store/languageStore';
import { propertyService } from '../../services/propertyService';
import { resolveMediaUrl } from '../../store/url';

export default function CategoryStrip() {
  const { t } = useTranslation('common');
  const language = useLanguageStore((s) => s.language);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    propertyService.getProperties({ pageSize: 1000 }).then(({ items }) => {
      const tally = {};
      for (const p of items) {
        tally[p.categorySlug] = (tally[p.categorySlug] || 0) + 1;
      }
      setCounts(tally);
    });
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h2 className="text-xl font-bold text-brand-800 sm:text-2xl">{t('sections.categories')}</h2>
      <div className="mt-5 flex gap-4 overflow-x-auto scrollbar-none sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible lg:grid-cols-8">
        {CATEGORIES.map((cat) => {
          const Icon = Icons[cat.icon] || Icons.Home;
          return (
            <Link
              key={cat.slug}
              to={`/properties/category/${cat.slug}`}
              className="flex w-32 shrink-0 flex-col items-center gap-2 rounded-xl border border-gray-200 bg-warm-white p-3 text-center shadow-sm transition-shadow hover:shadow-md sm:w-auto"
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-brand-100 bg-gray-100 flex items-center justify-center">
                {cat.image && cat.image.trim() !== '' ? (
                  <>
                    <img
                      src={resolveMediaUrl(cat.image)}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                      <Icon size={20} className="text-warm-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                    <Icon size={24} />
                  </div>
                )}
              </div>
              <span className="lang-te text-sm font-semibold text-gray-800">
                {language === 'te' ? cat.nameTe : cat.nameEn}
              </span>
              <span className="text-xs text-gray-500">{counts[cat.slug] || 0}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
