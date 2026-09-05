import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CATEGORIES } from '../../config/categories';
import { STATES, DISTRICTS, CITIES, CITIES_BY_STATE } from '../../data/locations';
import { useLanguageStore } from '../../store/languageStore';
import { getEnabledFilters } from '../../config/propertyFilterConfig';
import DualRangeSlider from '../common/DualRangeSlider';

const FACINGS = ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'];
const MAX_PRICE = 20000000;
const MAX_AREA = 5000;

const RESIDENTIAL_SLUGS = [
  'apartments',
  'independent-houses',
  'gated-communities',
  'flats',
  'villas'
];

export function isResidentialCategory(slug) {
  return RESIDENTIAL_SLUGS.includes(slug);
}

export default function FilterPanel({ filters, onChange, onReset, hideCategory, selectedCategorySlug, filterConfig }) {
  const { t } = useTranslation('properties');
  const language = useLanguageStore((s) => s.language);

  const activeCategorySlugs = useMemo(() => {
    if (hideCategory) return selectedCategorySlug ? [selectedCategorySlug].filter(Boolean) : [];
    const slugs = Array.isArray(filters.categorySlugs) ? filters.categorySlugs : [];
    if (slugs.length) return slugs;
    return filters.categorySlug ? [filters.categorySlug] : [];
  }, [hideCategory, selectedCategorySlug, filters.categorySlugs, filters.categorySlug]);

  const showRoomFilters = activeCategorySlugs.length === 0 || activeCategorySlugs.some((s) => isResidentialCategory(s));

  const enabledFilters = useMemo(() => getEnabledFilters(filterConfig), [filterConfig]);

  // admin-added custom cities (not tied to a state) stay selectable in every state
  const customCities = useMemo(() => {
    const knownCities = Object.values(CITIES_BY_STATE).flat();
    return CITIES.filter((c) => !knownCities.includes(c));
  }, []);

  // ── Cascading location state ──
  const [filterState, setFilterState] = useState(filters.state || '');
  const [filterDistrict, setFilterDistrict] = useState(filters.district || '');

  const districtsForState = useMemo(() => {
    if (!filterState) return [];
    return DISTRICTS[filterState] || [];
  }, [filterState]);

  useEffect(() => {
    if (filters.state !== filterState) setFilterState(filters.state || '');
  }, [filters.state]);

  useEffect(() => {
    if (filters.district !== filterDistrict) setFilterDistrict(filters.district || '');
  }, [filters.district]);

  function set(patch) {
    const nextFilters = { ...filters, ...patch };
    const slugs = Array.isArray(nextFilters.categorySlugs) && nextFilters.categorySlugs.length
      ? nextFilters.categorySlugs
      : selectedCategorySlug ? [selectedCategorySlug].filter(Boolean)
      : nextFilters.categorySlug ? [nextFilters.categorySlug]
      : [];
    const nextResidential = slugs.length === 0 || slugs.some((s) => isResidentialCategory(s));

    if (!nextResidential) {
      delete nextFilters.bedrooms;
      delete nextFilters.bathrooms;
      delete nextFilters.furnishing;
    }

    onChange(nextFilters);
  }

  function handleStateChange(e) {
    const val = e.target.value;
    setFilterState(val);
    setFilterDistrict('');
    set({ state: val || undefined, district: undefined, city: undefined });
  }

  function handleDistrictChange(e) {
    const val = e.target.value;
    setFilterDistrict(val);
    set({ district: val || undefined, city: undefined });
  }

  const selectCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';

  function renderState() {
    return (
      <div>
        <label htmlFor="filter-state" className="mb-1.5 block text-sm font-medium text-gray-700">
          {t('filters.state', { defaultValue: 'State' })}
        </label>
        <select
          id="filter-state"
          value={filterState}
          onChange={handleStateChange}
          className={selectCls}
        >
          <option value="">{t('filters.any')}</option>
          {STATES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    );
  }

  function renderDistrict() {
    return (
      <div>
        <label htmlFor="filter-district" className="mb-1.5 block text-sm font-medium text-gray-700">
          {t('filters.district', { defaultValue: 'District' })}
        </label>
        <select
          id="filter-district"
          value={filterDistrict}
          onChange={handleDistrictChange}
          disabled={!filterState}
          className={selectCls + (!filterState ? ' bg-gray-100 cursor-not-allowed' : '')}
        >
          <option value="">{filterState ? t('filters.any') : 'Select State first'}</option>
          {districtsForState.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>
    );
  }

  function renderCity() {
    const cityOptions = filterState
      ? [...(CITIES_BY_STATE[filterState] || []), ...customCities]
      : [];
    if (filters.city && !cityOptions.includes(filters.city)) cityOptions.unshift(filters.city);

    return (
      <div>
        <label htmlFor="filter-location" className="mb-1.5 block text-sm font-medium text-gray-700">
          {t('filters.location')}
        </label>
        <select
          id="filter-location"
          value={filters.city || ''}
          onChange={(e) => set({ city: e.target.value || undefined })}
          disabled={!filterState}
          className={selectCls + (!filterState ? ' bg-gray-100 cursor-not-allowed' : '')}
        >
          <option value="">{filterState ? t('filters.any') : 'Select State first'}</option>
          {cityOptions.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
    );
  }

  function renderCategory() {
    if (hideCategory) return null;
    return (
      <div>
        <span className="mb-1.5 block text-sm font-medium text-gray-700">
          {t('filters.category')}
        </span>
        <div className="flex flex-col gap-2">
          {CATEGORIES.map(c => {
            const slug = c.slug;
            const checked = Array.isArray(filters.categorySlugs)
              ? filters.categorySlugs.includes(slug)
              : filters.categorySlug === slug;
            return (
              <label key={slug} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCategory(slug)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600"
                />
                {language === 'te' ? c.nameTe : c.nameEn}
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  function toggleCategory(slug) {
    const current = Array.isArray(filters.categorySlugs) ? filters.categorySlugs : [];
    const next = current.includes(slug)
      ? current.filter(s => s !== slug)
      : [...current, slug];
    set({
      categorySlugs: next.length ? next : undefined,
      categorySlug: undefined,
    });
  }

  function renderPrice() {
    return (
      <div>
        <span className="mb-1.5 block text-sm font-medium text-gray-700">{t('filters.priceRange')}</span>
        <DualRangeSlider
          min={0}
          max={MAX_PRICE}
          step={50000}
          valueMin={filters.minPrice ?? 0}
          valueMax={filters.maxPrice ?? MAX_PRICE}
          onChange={(lo, hi) => set({ minPrice: lo, maxPrice: hi })}
        />
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          <span>₹{(filters.minPrice ?? 0).toLocaleString('en-IN')}</span>
          <span>₹{(filters.maxPrice ?? MAX_PRICE).toLocaleString('en-IN')}</span>
        </div>
      </div>
    );
  }

  function renderArea() {
    return (
      <div>
        <span className="mb-1.5 block text-sm font-medium text-gray-700">{t('filters.areaRange')}</span>
        <DualRangeSlider
          min={0}
          max={MAX_AREA}
          step={10}
          valueMin={filters.minArea ?? 0}
          valueMax={filters.maxArea ?? MAX_AREA}
          onChange={(lo, hi) => set({ minArea: lo, maxArea: hi })}
        />
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          <span>{filters.minArea ?? 0}</span>
          <span>{filters.maxArea ?? MAX_AREA}</span>
        </div>
      </div>
    );
  }

  function renderBedrooms() {
    if (!showRoomFilters) return null;
    return (
      <div>
        <label htmlFor="filter-bedrooms" className="mb-1.5 block text-sm font-medium text-gray-700">
          {t('filters.bedrooms')}
        </label>
        <select
          id="filter-bedrooms"
          value={filters.bedrooms || ''}
          onChange={(e) => set({ bedrooms: e.target.value ? Number(e.target.value) : undefined })}
          className={selectCls}
        >
          <option value="">{t('filters.any')}</option>
          {[1, 2, 3, 4, 5].map(n => (
            <option key={n} value={n}>{n}+</option>
          ))}
        </select>
      </div>
    );
  }

  function renderBathrooms() {
    if (!showRoomFilters) return null;
    return (
      <div>
        <label htmlFor="filter-bathrooms" className="mb-1.5 block text-sm font-medium text-gray-700">
          {t('filters.bathrooms')}
        </label>
        <select
          id="filter-bathrooms"
          value={filters.bathrooms || ''}
          onChange={(e) => set({ bathrooms: e.target.value ? Number(e.target.value) : undefined })}
          className={selectCls}
        >
          <option value="">{t('filters.any')}</option>
          {[1, 2, 3, 4, 5].map(n => (
            <option key={n} value={n}>{n}+</option>
          ))}
        </select>
      </div>
    );
  }

  function renderFacing() {
    return (
      <div>
        <label htmlFor="filter-facing" className="mb-1.5 block text-sm font-medium text-gray-700">
          {t('filters.facing')}
        </label>
        <select
          id="filter-facing"
          value={filters.facing || ''}
          onChange={(e) => set({ facing: e.target.value || undefined })}
          className={selectCls}
        >
          <option value="">{t('filters.any')}</option>
          {FACINGS.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>
    );
  }

  function renderFurnishing() {
    if (!showRoomFilters) return null;
    return (
      <div>
        <label htmlFor="filter-furnishing" className="mb-1.5 block text-sm font-medium text-gray-700">
          {t('filters.furnishing')}
        </label>
        <select
          id="filter-furnishing"
          value={filters.furnishing || ''}
          onChange={(e) => set({ furnishing: e.target.value || undefined })}
          className={selectCls}
        >
          <option value="">{t('filters.any')}</option>
          <option value="furnished">Furnished</option>
          <option value="semi">Semi-furnished</option>
          <option value="unfurnished">Unfurnished</option>
        </select>
      </div>
    );
  }

  function renderQuality() {
    return (
      <div>
        <span className="mb-1.5 block text-sm font-medium text-gray-700">{t('filters.featuredOrVerified')}</span>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={Boolean(filters.verified)}
              onChange={(e) => set({ verified: e.target.checked || undefined })}
              className="h-4 w-4 rounded border-gray-300 text-brand-600"
            />
            {t('filters.verified')}
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={Boolean(filters.featured)}
              onChange={(e) => set({ featured: e.target.checked || undefined })}
              className="h-4 w-4 rounded border-gray-300 text-brand-600"
            />
            {t('filters.featured')}
          </label>
        </div>
      </div>
    );
  }

  function renderCustomFilter(def) {
    const label = def.label || def.fieldKey || def.id;
    const value = filters[def.id] ?? '';

    if (def.type === 'select' && Array.isArray(def.options) && def.options.length > 0) {
      return (
        <div>
          <label htmlFor={`filter-${def.id}`} className="mb-1.5 block text-sm font-medium text-gray-700">
            {label}
          </label>
          <select
            id={`filter-${def.id}`}
            value={value}
            onChange={(e) => set({ [def.id]: e.target.value || undefined })}
            className={selectCls}
          >
            <option value="">{t('filters.any')}</option>
            {def.options.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div>
        <label htmlFor={`filter-${def.id}`} className="mb-1.5 block text-sm font-medium text-gray-700">
          {label}
        </label>
        <input
          id={`filter-${def.id}`}
          type={def.type === 'number' ? 'number' : 'text'}
          value={value}
          onChange={(e) => set({ [def.id]: e.target.value || undefined })}
          className={selectCls}
          placeholder={t('filters.any')}
        />
      </div>
    );
  }

  const renderers = {
    state: renderState,
    district: renderDistrict,
    city: renderCity,
    category: renderCategory,
    price: renderPrice,
    area: renderArea,
    bedrooms: renderBedrooms,
    bathrooms: renderBathrooms,
    facing: renderFacing,
    furnishing: renderFurnishing,
    quality: renderQuality,
  };

  const visibleBlocks = enabledFilters
    .map((def) => ({
      id: def.id,
      node: def.custom ? renderCustomFilter(def) : renderers[def.id]?.(),
    }))
    .filter((b) => b.node != null);

  return (
    <div className="space-y-6">
      {visibleBlocks.map((block) => (
        <div key={block.id}>{block.node}</div>
      ))}

      <button
        type="button"
        onClick={onReset}
        className="mt-2 w-full rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
      >
        {t('filters.clearAll')}
      </button>
    </div>
  );
}