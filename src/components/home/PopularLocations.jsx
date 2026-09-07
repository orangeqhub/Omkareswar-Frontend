import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { propertyService } from '../../services/propertyService';
import { responsiveSrcSet } from '../../utils/imageSrcset';

export default function PopularLocations() {
  const { t } = useTranslation('common');
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    propertyService.getPopularLocations(6).then((data) => {
      if (Array.isArray(data)) setLocations(data);
    }).catch(() => {});
  }, []);

  if (locations.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h2 className="text-xl font-bold text-brand-800 sm:text-2xl">{t('sections.popularLocations')}</h2>
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {locations.map((loc) => (
          <Link
            key={loc.city}
            to={`/properties?city=${encodeURIComponent(loc.city)}`}
            className="group relative h-28 overflow-hidden rounded-xl shadow-sm"
          >
            <img
              src={loc.image}
              srcSet={responsiveSrcSet(loc.image, [320, 600, 900])}
              sizes="(min-width: 1024px) 16.66vw, (min-width: 640px) 33vw, 50vw"
              alt=""
              loading="lazy"
              decoding="async"
              width={600}
              height={400}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-warm-white">
              <span className="font-semibold">{loc.city}</span>
              <span className="text-xs">{loc.count}+</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
