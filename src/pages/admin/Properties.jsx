import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, X } from 'lucide-react';
import PropertyModerationList from '../../components/dashboard/PropertyModerationList';
import { categoryService } from '../../services/categoryService';

const TABS = ['pending', 'active', 'changes_requested', 'rejected', 'draft'];

export default function Properties() {
  const { t } = useTranslation('common');
  const [tab, setTab] = useState('pending');
  const [categories, setCategories] = useState([]);
  const [categorySlug, setCategorySlug] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    categoryService
      .getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  const applyLocation = () => {
    setLocation(locationInput.trim());
  };

  const clearFilters = () => {
    setCategorySlug('');
    setLocationInput('');
    setLocation('');
  };

  const hasFilters = Boolean(categorySlug) || Boolean(location.trim());

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((tabKey) => (
          <button
            key={tabKey}
            type="button"
            onClick={() => setTab(tabKey)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              tab === tabKey ? 'border-brand-600 bg-brand-600 text-warm-white' : 'border-gray-300 text-gray-600'
            }`}
          >
            {t(`status.${tabKey}`)}
          </button>
        ))}
      </div>

      <div className="mb-4 space-y-3 rounded-xl border border-gray-200 bg-warm-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="category-filter" className="text-xs font-semibold uppercase tracking-wide text-gray-400">Category</label>
          <select
            id="category-filter"
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.nameEn || cat.slug}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-sm">
            <MapPin size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyLocation();
              }}
              placeholder="Search by city, district, mandal, village or locality…"
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-8 text-sm focus:border-brand-500 focus:outline-none"
            />
            {locationInput && (
              <button
                type="button"
                onClick={() => {
                  setLocationInput('');
                  setLocation('');
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={applyLocation}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-warm-white hover:bg-brand-700"
          >
            <Search size={15} /> Search
          </button>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <X size={15} /> Clear Filters
            </button>
          )}
        </div>

        {(categorySlug || location) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Active filters:</span>
            {categorySlug && (
              <button
                type="button"
                onClick={() => setCategorySlug('')}
                className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100"
              >
                {categories.find((c) => c.slug === categorySlug)?.nameEn || categorySlug}
                <X size={12} />
              </button>
            )}
            {location && (
              <button
                type="button"
                onClick={() => {
                  setLocationInput('');
                  setLocation('');
                }}
                className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100"
              >
                <MapPin size={12} /> {location}
                <X size={12} />
              </button>
            )}
          </div>
        )}
      </div>

      <PropertyModerationList statusFilter={tab} categorySlug={categorySlug} location={location} />
    </div>
  );
}