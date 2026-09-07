import { useEffect, useState } from 'react';
import { settingsService } from '../../services/settingsService';
import { toast } from '../../store/toastStore';
import { Settings as SettingsIcon, ArrowUp, ArrowDown, Trash2, Edit, Pencil, Plus, X, Power, ToggleLeft, ToggleRight, Save } from 'lucide-react';
import { CATEGORIES } from '../../config/categories';
import { CATEGORY_GROUPS, getAmenitiesForCategory, getAmenityCategorySlugs } from '../../config/categoryConfig';
import { FIELD_DEFINITIONS, FIELD_STEPS, CATEGORY_DYNAMIC_FIELDS } from '../../config/propertyFieldDefinitions';
import { FILTER_DEFINITIONS, isFilterEnabled, getFilterOrder, getCustomFilterDefs, CUSTOM_FILTER_SUGGESTIONS } from '../../config/propertyFilterConfig';
import AmenityIcon from '../../components/common/AmenityIcon';
import { getCategoryGroupKey } from '../../config/categoryConfig';

const PROPERTY_CATEGORIES = CATEGORY_GROUPS.flatMap((group) => group.slugs);

export default function PropertyFields() {
  const [settings, setSettings] = useState(null);
  const [activeCategory, setActiveCategory] = useState(PROPERTY_CATEGORIES[0] || 'open-plots');
  const [savingField, setSavingField] = useState(null);

  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [isBuiltinField, setBuiltinField] = useState(false);
  const [fieldForm, setFieldForm] = useState({
    label: '',
    type: 'text',
    categoryScope: 'both',
    selectedCategories: [],
    optionsString: '',
    required: false,
    step: '4',
    subFields: [],
  });

  const [showBuiltinEditModal, setShowBuiltinEditModal] = useState(false);
  const [editingBuiltin, setEditingBuiltin] = useState(null);
  const [builtinForm, setBuiltinForm] = useState({ label: '', type: 'text', step: '', required: false, optionsString: '' });

  const [showAmenityModal, setShowAmenityModal] = useState(false);
  const [editingAmenityCategory, setEditingAmenityCategory] = useState(null);
  const [amenityForm, setAmenityForm] = useState({ options: '' });

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [editingFilter, setEditingFilter] = useState(null);
  const [filterForm, setFilterForm] = useState({
    label: '',
    type: 'select',
    optionsString: '',
    source: 'dynamicFields',
    fieldKey: '',
  });

  useEffect(() => {
    settingsService.getSettings().then(setSettings);
  }, []);

  const propertyFields = settings?.propertyFields || [];
  const fieldConfig = settings?.fieldConfig || {};
  const amenitiesByCategory = settings?.amenitiesByCategory || {};
  const filterConfig = settings?.filterConfig || {};

  function fieldMatchesCategory(field, categorySlug) {
    const category = field.category || 'both';
    if (category === 'both' || category === categorySlug) return true;
    if (Array.isArray(category)) return category.includes(categorySlug);
    return category === getCategoryGroupKey(categorySlug);
  }

  const visiblePropertyFields = propertyFields.filter((field) => fieldMatchesCategory(field, activeCategory));

  function getBuiltinConfig(fieldId) {
    return fieldConfig[fieldId] || { enabled: true, required: false };
  }

  function getDisplayLabel(def) {
    const cfg = getBuiltinConfig(def.id);
    return cfg.label || def.label;
  }

  function getDisplayType(def) {
    const cfg = getBuiltinConfig(def.id);
    return cfg.type || def.type;
  }

  function getDisplayOptions(def) {
    const cfg = getBuiltinConfig(def.id);
    return (cfg.options && cfg.options.length > 0) ? cfg.options : (def.options || []);
  }

  async function handleToggleBuiltin(fieldId, key) {
    setSavingField(fieldId);
    const current = getBuiltinConfig(fieldId);
    const updated = {
      ...fieldConfig,
      [fieldId]: { ...current, [key]: !current[key] },
    };
    try {
      const res = await settingsService.updateSettings({ fieldConfig: updated });
      setSettings(res);
      toast.success(`Field ${key} ${!current[key] ? 'enabled' : 'disabled'}!`);
    } catch {
      toast.error('Failed to update field.');
    }
    setSavingField(null);
  }

  async function handleToggleAllBuiltin(key, value) {
    const updated = { ...fieldConfig };
    ALL_BUILTIN_DEFS.forEach((def) => {
      const current = updated[def.id] || { enabled: true, required: false };
      updated[def.id] = { ...current, [key]: value };
    });
    try {
      const res = await settingsService.updateSettings({ fieldConfig: updated });
      setSettings(res);
      toast.success(`All fields ${key} ${value ? 'enabled' : 'disabled'}!`);
    } catch {
      toast.error('Failed to update fields.');
    }
  }

  const sortedFilterDefs = () => {
    const predefs = FILTER_DEFINITIONS.map((def) => ({
      ...def,
      order: getFilterOrder(def.id, filterConfig),
      enabled: isFilterEnabled(def.id, filterConfig),
      custom: false,
    }));
    const customs = getCustomFilterDefs(filterConfig).map((c) => ({
      ...c,
      order: getFilterOrder(c.id, filterConfig),
      enabled: c.enabled !== false,
      custom: true,
    }));
    return [...predefs, ...customs].sort((a, b) => a.order - b.order);
  };

  async function saveFilterConfig(updated, message) {
    try {
      const res = await settingsService.updateSettings({ filterConfig: updated });
      setSettings(res);
      toast.success(message);
    } catch {
      toast.error('Failed to update listing filters.');
    }
  }

  function isPredefinedFilter(id) {
    return FILTER_DEFINITIONS.some((d) => d.id === id);
  }

  function withFilterEntry(updated, id, patch) {
    if (isPredefinedFilter(id)) {
      updated[id] = { ...(updated[id] || {}), enabled: isFilterEnabled(id, updated), order: getFilterOrder(id, updated), ...patch };
    } else {
      const custom = Array.isArray(updated.custom) ? updated.custom.map((c) => (c.id === id ? { ...c, ...patch } : c)) : [];
      if (!custom.some((c) => c.id === id)) custom.push({ id, ...patch });
      updated.custom = custom;
    }
    return updated;
  }

  function handleToggleFilter(id) {
    const enabledNow = isFilterEnabled(id, filterConfig);
    let updated = { ...filterConfig };
    withFilterEntry(updated, id, { enabled: !enabledNow });
    saveFilterConfig(updated, `Filter ${enabledNow ? 'disabled' : 'enabled'}!`);
  }

  function handleMoveFilter(id, direction) {
    const entries = sortedFilterDefs();
    const pos = entries.findIndex((e) => e.id === id);
    const target = entries[pos + direction];
    if (!target) return;
    let updated = { ...filterConfig };
    const setOrder = (fid, order) => {
      withFilterEntry(updated, fid, { order });
    };
    setOrder(id, target.order);
    setOrder(target.id, entries[pos].order);
    saveFilterConfig(updated, 'Filter order updated!');
  }

  function handleResetFilters() {
    const updated = {};
    FILTER_DEFINITIONS.forEach((def, i) => {
      updated[def.id] = { enabled: true, order: i * 10 };
    });
    saveFilterConfig(updated, 'Listing filters reset to defaults.');
  }

  function handleOpenAddFilter() {
    setEditingFilter(null);
    setFilterForm({ label: '', type: 'select', optionsString: '', source: 'dynamicFields', fieldKey: '' });
    setShowFilterModal(true);
  }

  function handleOpenEditFilter(filter) {
    setEditingFilter(filter);
    setFilterForm({
      label: filter.label || '',
      type: filter.type || 'text',
      optionsString: Array.isArray(filter.options) ? filter.options.join(', ') : '',
      source: filter.source || 'dynamicFields',
      fieldKey: filter.fieldKey || '',
    });
    setShowFilterModal(true);
  }

  function handleDeleteFilter(id) {
    if (!window.confirm('Delete this custom filter? It will be removed from the listing page.')) return;
    const custom = getCustomFilterDefs(filterConfig).filter((c) => c.id !== id);
    const { custom: _removed, ...rest } = filterConfig;
    const updated = { ...rest, custom };
    saveFilterConfig(updated, 'Custom filter deleted.');
  }

  function handleSaveFilter(e) {
    e.preventDefault();
    if (!filterForm.label.trim()) {
      toast.error('Filter label is required');
      return;
    }
    if (!filterForm.fieldKey.trim()) {
      toast.error('Field key is required (e.g. dyn_bedrooms or bedrooms)');
      return;
    }
    let options = [];
    if (filterForm.type === 'select') {
      options = filterForm.optionsString.split(',').map((x) => x.trim()).filter(Boolean);
      if (options.length === 0) {
        toast.error('Dropdown filters need at least one option.');
        return;
      }
    }
    const customDef = {
      id: editingFilter ? editingFilter.id : 'cf_' + Date.now(),
      label: filterForm.label.trim(),
      type: filterForm.type,
      options,
      source: filterForm.source,
      fieldKey: filterForm.fieldKey.trim(),
      enabled: editingFilter ? editingFilter.enabled !== false : true,
      order: getFilterOrder(editingFilter ? editingFilter.id : '__none__', filterConfig),
    };
    if (editingFilter) {
      const custom = getCustomFilterDefs(filterConfig).map((c) => (c.id === editingFilter.id ? customDef : c));
      const { custom: _removed, ...rest } = filterConfig;
      saveFilterConfig({ ...rest, custom }, 'Custom filter updated!');
    } else {
      const maxOrder = sortedFilterDefs().reduce((m, f) => Math.max(m, f.order), 0);
      customDef.order = maxOrder + 10;
      const custom = [...getCustomFilterDefs(filterConfig), customDef];
      const { custom: _removed, ...rest } = filterConfig;
      saveFilterConfig({ ...rest, custom }, 'Custom filter added!');
    }
    setShowFilterModal(false);
  }

  function handleOpenBuiltinEdit(def) {
    setEditingBuiltin(def);
    const cfg = getBuiltinConfig(def.id);
    setBuiltinForm({ label: cfg.label || def.label, type: cfg.type || def.type, step: cfg.step || def.step || '', required: cfg.required || false, optionsString: (cfg.options || def.options || []).join(', ') });
    setShowBuiltinEditModal(true);
  }

  async function handleSaveBuiltinEdit(e) {
    e.preventDefault();
    if (!builtinForm.label.trim()) {
      toast.error('Label is required');
      return;
    }
    const cfg = getBuiltinConfig(editingBuiltin.id);
    const { options: _opts, ...restCfg } = cfg;
    const nextCfg = {
      ...restCfg,
      label: builtinForm.label.trim(),
      type: builtinForm.type,
      step: builtinForm.step || cfg.step,
      required: builtinForm.required,
    };
    if (builtinForm.type === 'select') {
      const parsed = builtinForm.optionsString
        ? builtinForm.optionsString.split(',').map((x) => x.trim()).filter(Boolean)
        : [];
      if (parsed.length === 0) {
        toast.error('Dropdown fields need at least one option.');
        return;
      }
      nextCfg.options = parsed;
    }
    const updated = {
      ...fieldConfig,
      [editingBuiltin.id]: nextCfg,
    };
    try {
      const res = await settingsService.updateSettings({ fieldConfig: updated });
      setSettings(res);
      setShowBuiltinEditModal(false);
      toast.success('Field updated!');
    } catch {
      toast.error('Failed to update field.');
    }
  }

  async function handleResetBuiltinLabel(def) {
    const cfg = getBuiltinConfig(def.id);
    const { label: _label, type: _type, step: _step, required: _required, options: _options, ...rest } = cfg;
    const updated = { ...fieldConfig, [def.id]: rest };
    try {
      const res = await settingsService.updateSettings({ fieldConfig: updated });
      setSettings(res);
      toast.success('Field reset to defaults!');
    } catch {
      toast.error('Failed to reset field.');
    }
  }

  function handleOpenAddField(builtin = false) {
    setBuiltinField(builtin);
    setEditingField(null);
    setFieldForm({
      label: '',
      type: 'text',
      categoryScope: 'both',
      selectedCategories: [],
      optionsString: '',
      required: false,
      step: '4',
      subFields: [],
    });
    setShowFieldModal(true);
  }

  function handleOpenEditField(field) {
    setEditingField(field);
    const cat = field.category || 'both';
    const isBroad = ['both', 'land', 'residential'].includes(cat);
    setFieldForm({
      label: field.label,
      type: field.type,
      categoryScope: isBroad ? cat : 'custom',
      selectedCategories: isBroad ? [] : (Array.isArray(cat) ? cat : [cat]),
      optionsString: (field.options || []).join(','),
      required: !!field.required,
      step: field.step || '4',
      subFields: (field.subFields || []).map((sf) => ({ ...sf, optionsString: (sf.options || []).join(',') })),
    });
    setShowFieldModal(true);
  }

  async function handleSaveField(e) {
    e.preventDefault();
    if (!fieldForm.label.trim()) {
      toast.error('Label is required');
      return;
    }
    let catVal;
    if (fieldForm.categoryScope === 'custom') {
      if (fieldForm.selectedCategories.length === 0) {
        toast.error('Select at least one category.');
        return;
      }
      catVal = fieldForm.selectedCategories;
    } else {
      catVal = fieldForm.categoryScope;
    }
    const options = fieldForm.optionsString
      ? fieldForm.optionsString.split(',').map((x) => x.trim()).filter(Boolean)
      : [];
    const subFields = fieldForm.subFields.map((sf) => ({
      id: sf.id || 'sf_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      label: sf.label,
      options: sf.optionsString
        ? sf.optionsString.split(',').map((x) => x.trim()).filter(Boolean)
        : [],
    }));
    const fieldData = {
      label: fieldForm.label.trim(),
      type: fieldForm.type,
      category: catVal,
      options,
      required: fieldForm.required,
      active: editingField ? (editingField.active !== false) : true,
      ...((isBuiltinField || editingField?.builtin) ? { step: fieldForm.step } : {}),
      ...(fieldForm.type === 'group' ? { subFields } : {}),
    };
    let updatedList;
    if (editingField) {
      updatedList = propertyFields.map((f) =>
        f.id === editingField.id ? { ...f, ...fieldData } : f
      );
      toast.success('Field updated!');
    } else {
      updatedList = [...propertyFields, { ...fieldData, id: 'f_' + Date.now(), ...(isBuiltinField ? { builtin: true } : {}) }];
      toast.success(isBuiltinField ? 'Built-in field added!' : 'Field added!');
    }
    try {
      const res = await settingsService.updateSettings({ propertyFields: updatedList });
      setSettings(res);
      setShowFieldModal(false);
    } catch {
      toast.error('Failed to save field.');
    }
  }

  async function handleDeleteField(id, field) {
    if (!window.confirm(`Delete this ${field?.builtin ? 'built-in' : 'custom'} field?`)) return;
    const updated = propertyFields.filter((f) => f.id !== id);
    try {
      const res = await settingsService.updateSettings({ propertyFields: updated });
      setSettings(res);
      toast.success('Field deleted.');
    } catch {
      toast.error('Failed to delete field.');
    }
  }

  async function handleMoveField(field, direction) {
    const currentIdx = propertyFields.findIndex((f) => f.id === field.id);
    if (currentIdx === -1) return;
    const isBuiltin = field.builtin === true;
    const siblings = propertyFields.map((f, i) => ({ f, i })).filter((x) => (x.f.builtin === true) === isBuiltin);
    const pos = siblings.findIndex((x) => x.f.id === field.id);
    const target = siblings[pos + direction];
    if (!target) return;
    const updated = [...propertyFields];
    [updated[currentIdx], updated[target.i]] = [updated[target.i], updated[currentIdx]];
    try {
      const res = await settingsService.updateSettings({ propertyFields: updated });
      setSettings(res);
    } catch {
      toast.error('Failed to reorder.');
    }
  }

  async function handleMoveBuiltin(field, direction) {
    const currentIdx = propertyFields.findIndex((f) => f.id === field.id);
    if (currentIdx === -1) return;
    const siblings = propertyFields.map((f, i) => ({ f, i })).filter((x) => x.f.builtin === true);
    const pos = siblings.findIndex((x) => x.f.id === field.id);
    const target = siblings[pos + direction];
    if (!target) return;
    const updated = [...propertyFields];
    [updated[currentIdx], updated[target.i]] = [updated[target.i], updated[currentIdx]];
    try {
      const res = await settingsService.updateSettings({ propertyFields: updated });
      setSettings(res);
    } catch {
      toast.error('Failed to reorder.');
    }
  }

  async function handleToggleCustomActive(field) {
    const updated = propertyFields.map((f) =>
      f.id === field.id ? { ...f, active: f.active === false ? true : false } : f
    );
    try {
      const res = await settingsService.updateSettings({ propertyFields: updated });
      setSettings(res);
      toast.success(`Field ${field.active === false ? 'activated' : 'deactivated'}!`);
    } catch {
      toast.error('Failed to toggle field.');
    }
  }

  function handleAddSubField() {
    setFieldForm((prev) => ({
      ...prev,
      subFields: [...prev.subFields, { id: '', label: '', optionsString: '' }],
    }));
  }

  function handleRemoveSubField(index) {
    setFieldForm((prev) => ({
      ...prev,
      subFields: prev.subFields.filter((_, i) => i !== index),
    }));
  }

  function handleSubFieldChange(index, key, value) {
    setFieldForm((prev) => {
      const updated = [...prev.subFields];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, subFields: updated };
    });
  }

  function toggleCategoryGroup(groupKey, value) {
    const group = CATEGORY_GROUPS.find((g) => g.key === groupKey);
    if (!group) return;
    const slugs = CATEGORIES.filter((c) => group.slugs.includes(c.slug)).map((c) => c.slug);
    setFieldForm((prev) => ({
      ...prev,
      selectedCategories: value
        ? [...new Set([...prev.selectedCategories, ...slugs])]
        : prev.selectedCategories.filter((s) => !slugs.includes(s)),
    }));
  }

  function handleOpenAmenityEdit(slug) {
    setEditingAmenityCategory(slug);
    setAmenityForm({ options: getAmenitiesForCategory(slug, amenitiesByCategory).join('\n') });
    setShowAmenityModal(true);
  }

  async function handleSaveAmenities(e) {
    e.preventDefault();
    const options = amenityForm.options.split('\n').map((x) => x.trim()).filter(Boolean);
    if (options.length === 0) {
      toast.error('Add at least one amenity option.');
      return;
    }
    const updated = { ...amenitiesByCategory, [editingAmenityCategory]: options };
    try {
      const res = await settingsService.updateSettings({ amenitiesByCategory: updated });
      setSettings(res);
      setShowAmenityModal(false);
      toast.success('Amenities saved!');
    } catch {
      toast.error('Failed to save amenities.');
    }
  }

  async function handleResetAmenities(slug) {
    if (!window.confirm(`Reset amenities for this category back to defaults?`)) return;
    const updated = { ...amenitiesByCategory };
    delete updated[slug];
    try {
      const res = await settingsService.updateSettings({ amenitiesByCategory: updated });
      setSettings(res);
      toast.success('Amenities reset to defaults.');
    } catch {
      toast.error('Failed to reset amenities.');
    }
  }

  if (!settings) return null;

  const getCategoryLabel = (catVal) => {
    if (catVal === 'both') return 'Both';
    if (catVal === 'land') return 'Land';
    if (catVal === 'residential') return 'Residential';
    if (Array.isArray(catVal)) {
      return catVal.map((slug) => {
        const m = CATEGORIES.find((c) => c.slug === slug);
        return m ? m.nameEn : slug;
      }).join(', ');
    }
    const m = CATEGORIES.find((c) => c.slug === catVal);
    return m ? m.nameEn : catVal;
  };

  const STEP_ORDER = [1, 2, 3, 4, 5, 6, 7];

  const ALL_BUILTIN_DEFS = [];
  const STEP_CATS = {};
  FIELD_DEFINITIONS.forEach((def) => {
    ALL_BUILTIN_DEFS.push(def);
    const s = String(def.step);
    if (!STEP_CATS[s]) STEP_CATS[s] = {};
    if (!STEP_CATS[s][def.category]) STEP_CATS[s][def.category] = [];
    STEP_CATS[s][def.category].push({ ...def });
  });
  Object.entries(CATEGORY_DYNAMIC_FIELDS).forEach(([catSlug, catDef]) => {
    catDef.fields.forEach((f) => {
      ALL_BUILTIN_DEFS.push(f);
      const s = String(f.step);
      if (!STEP_CATS[s]) STEP_CATS[s] = {};
      if (!STEP_CATS[s][catSlug]) STEP_CATS[s][catSlug] = [];
      STEP_CATS[s][catSlug].push({ ...f, category: catSlug });
    });
  });

  const adminBuiltinFields = propertyFields.filter((f) => f.builtin === true);
  const customOnlyFields = visiblePropertyFields.filter((f) => f.builtin !== true);

  function resolveBuiltinStep(f) {
    if (f.step === undefined || f.step === null || f.step === '') return 4;
    return Number(f.step);
  }

  const builtinEnabledCount = ALL_BUILTIN_DEFS.filter((d) => getBuiltinConfig(d.id).enabled !== false).length;
  const builtinRequiredCount = ALL_BUILTIN_DEFS.filter((d) => getBuiltinConfig(d.id).required === true).length;

  const groupedCategories = CATEGORY_GROUPS.map((g) => ({
    ...g,
    items: CATEGORIES.filter((c) => g.slugs.includes(c.slug)),
  })).filter((g) => g.items.length > 0);
  const otherCategories = CATEGORIES.filter((c) => !CATEGORY_GROUPS.some((g) => g.slugs.includes(c.slug)));
  const amenityCategorySlugs = getAmenityCategorySlugs(amenitiesByCategory);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="mb-4 flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-brand-800" />
          <h1 className="font-semibold text-brand-800 text-xl">Manage Property Fields</h1>
        </div>
        <button
          type="button"
          onClick={handleOpenAddField}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-warm-white hover:bg-brand-700 cursor-pointer"
        >
          <Plus size={16} /> Add Custom Field
        </button>
      </div>

      <p className="text-sm text-gray-500">
        Control which fields appear on the property form. Edit labels, enable/disable, make required, and add custom or built-in fields for any wizard step. Changes reflect on the user property form immediately.
      </p>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3" role="tablist" aria-label="Property field categories">
        {PROPERTY_CATEGORIES.map((categorySlug) => (
          <button
            key={categorySlug}
            type="button"
            role="tab"
            aria-selected={activeCategory === categorySlug}
            onClick={() => setActiveCategory(categorySlug)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeCategory === categorySlug
                ? 'bg-brand-600 text-warm-white'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {getCategoryLabel(categorySlug)}
          </button>
        ))}
      </div>

      {/* Built-in Fields */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Built-in Fields</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {builtinEnabledCount}/{ALL_BUILTIN_DEFS.length} enabled &middot; {builtinRequiredCount} required &middot; {adminBuiltinFields.length} admin-added
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenAddField(true)}
              className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-warm-white hover:bg-brand-700 cursor-pointer"
            >
              <Plus size={16} /> Add Built-in Field
            </button>
            <button
              type="button"
              onClick={() => handleToggleAllBuiltin('enabled', true)}
              className="rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 cursor-pointer"
            >
              Enable All
            </button>
            <button
              type="button"
              onClick={() => handleToggleAllBuiltin('enabled', false)}
              className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 cursor-pointer"
            >
              Disable All
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {STEP_ORDER.map((sn) => {
            const defsByCat = STEP_CATS[String(sn)] || {};
            const addedForStep = adminBuiltinFields.filter((f) => resolveBuiltinStep(f) === sn && fieldMatchesCategory(f, activeCategory));
            const hasConfigFields = Object.values(defsByCat).some((fields) => fields.some((field) => fieldMatchesCategory(field, activeCategory)));
            if (!hasConfigFields && addedForStep.length === 0) return null;
            return (
              <div key={sn}>
                <p className="text-xs font-bold text-brand-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold">{sn}</span>
                  Step {sn} &mdash; {FIELD_STEPS[sn]}
                </p>

                {Object.entries(defsByCat).map(([catKey, fields]) => {
                  const categoryFields = fields.filter((field) => fieldMatchesCategory(field, activeCategory));
                  if (categoryFields.length === 0) return null;
                  return (
                  <div key={catKey} className="mb-4">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                      <span className="shrink-0 text-[10px] font-medium text-blue-500 bg-blue-50 rounded px-1.5 py-0.5">{getCategoryLabel(catKey)}</span>
                      <span className="text-gray-400 normal-case tracking-normal">{fields.length} field(s)</span>
                    </p>
                    <div className="rounded-lg border border-gray-100 divide-y divide-gray-100">
                      {categoryFields.map((def) => {
                        const cfg = getBuiltinConfig(def.id);
                        const isEnabled = cfg.enabled !== false;
                        const isRequired = cfg.required === true;
                        const isCustomized = cfg.label || cfg.type || (Array.isArray(cfg.options) && cfg.options.length > 0);
                        const defOptions = getDisplayOptions(def);
                        return (
                          <div key={def.id} className={`flex items-center justify-between px-3 py-2.5 text-sm transition-colors ${isEnabled ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
                            <div className="min-w-0">
                              <div className="flex items-center gap-3">
                                <span className="truncate font-medium text-gray-800">
                                  {getDisplayLabel(def)}
                                  {isCustomized && <span className="ml-1 text-[10px] text-amber-500 font-normal">(edited)</span>}
                                </span>
                                <span className="shrink-0 text-[10px] font-medium text-gray-400 uppercase bg-gray-100 rounded px-1.5 py-0.5">{getDisplayType(def)}</span>
                                <span className="shrink-0 text-[10px] font-medium text-green-600 bg-green-50 rounded px-1.5 py-0.5">{getCategoryLabel(catKey)}</span>
                                {def.id === 'amenities' && <span className="shrink-0 text-[10px] font-medium text-purple-600 bg-purple-50 rounded px-1.5 py-0.5">per-category options (see Amenities card)</span>}
                                {def.type === 'direction' && <span className="shrink-0 text-[10px] font-medium text-purple-600 bg-purple-50 rounded px-1.5 py-0.5">boundary + feet</span>}
                                {def.type === 'group' && def.subFields && def.subFields.length > 0 && <span className="shrink-0 text-[10px] font-medium text-purple-600 bg-purple-50 rounded px-1.5 py-0.5">{def.subFields.length} sub-part(s)</span>}
                                {isRequired && <span className="shrink-0 text-[10px] font-bold text-red-600 bg-red-50 rounded px-1.5 py-0.5">Required</span>}
                              </div>
                              {defOptions.length > 0 && (
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {defOptions.map((o) => (
                                    <span key={o} className="text-[10px] font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5">{o}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0 ml-2">
                              <button
                                type="button"
                                onClick={() => handleOpenBuiltinEdit(def)}
                                className="p-1.5 rounded cursor-pointer transition-colors text-gray-500 hover:text-amber-600 hover:bg-amber-50"
                                title="Edit label / type"
                              >
                                <Edit size={15} />
                              </button>
                              {isCustomized && (
                                <button
                                  type="button"
                                  onClick={() => handleResetBuiltinLabel(def)}
                                  className="p-1.5 rounded cursor-pointer transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                  title="Reset to default"
                                >
                                  <span className="text-[10px] font-bold">↺</span>
                                </button>
                              )}
                              <button
                                type="button"
                                disabled={savingField === def.id}
                                onClick={() => handleToggleBuiltin(def.id, 'enabled')}
                                className={`p-1.5 rounded cursor-pointer transition-colors ${isEnabled ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                title={isEnabled ? 'Disable field' : 'Enable field'}
                              >
                                {isEnabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                              </button>
                              <button
                                type="button"
                                disabled={savingField === def.id}
                                onClick={() => handleToggleBuiltin(def.id, 'required')}
                                className={`p-1.5 rounded cursor-pointer transition-colors text-xs font-bold ${isRequired ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-gray-400 hover:bg-gray-100'}`}
                                title={isRequired ? 'Remove required' : 'Make required'}
                              >
                                R
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  );
                })}

                {addedForStep.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-brand-700 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                      <span className="shrink-0 text-[10px] font-medium text-brand-600 bg-brand-50 rounded px-1.5 py-0.5">Admin-Added Built-in</span>
                      <span className="text-gray-400 normal-case tracking-normal">{addedForStep.length} field(s)</span>
                    </p>
                    <div className="rounded-lg border border-dashed border-brand-300 divide-y divide-gray-100">
                      {addedForStep.map((field, idx) => (
                        <div key={field.id} className={`flex items-center justify-between px-3 py-2.5 text-sm transition-colors ${field.active !== false ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
                          <div className="min-w-0">
                            <div className="flex items-center gap-3">
                              <span className="truncate font-medium text-gray-800">{field.label}</span>
                              <span className="shrink-0 text-[10px] font-medium text-gray-400 uppercase bg-gray-100 rounded px-1.5 py-0.5">{field.type}</span>
                              <span className="shrink-0 text-[10px] font-medium text-green-600 bg-green-50 rounded px-1.5 py-0.5">{getCategoryLabel(field.category)}</span>
                              {field.type === 'group' && field.subFields && field.subFields.length > 0 && <span className="shrink-0 text-[10px] font-medium text-purple-600 bg-purple-50 rounded px-1.5 py-0.5">{field.subFields.length} sub-part(s)</span>}
                              {field.required && <span className="shrink-0 text-[10px] font-bold text-red-600 bg-red-50 rounded px-1.5 py-0.5">Required</span>}
                            </div>
                            {field.options && field.options.length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {field.options.map((o) => (
                                  <span key={o} className="text-[10px] font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5">{o}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <button
                              type="button"
                              onClick={() => handleToggleCustomActive(field)}
                              className={`p-1.5 rounded cursor-pointer transition-colors ${field.active !== false ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-400 bg-gray-50 hover:bg-gray-100'}`}
                              title={field.active !== false ? 'Deactivate' : 'Activate'}
                            >
                              <Power size={16} />
                            </button>
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveBuiltin(field, -1)}
                              className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded disabled:opacity-30 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              type="button"
                              disabled={idx === addedForStep.length - 1}
                              onClick={() => handleMoveBuiltin(field, 1)}
                              className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded disabled:opacity-30 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditField(field)}
                              className="p-1.5 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded cursor-pointer"
                              title="Edit"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteField(field.id, field)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Amenities by Category */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Amenities by Category</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Amenity checkboxes shown on Step 5 (Amenities) of the property form — each category shows only its own list.
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {amenityCategorySlugs.map((slug) => {
            const options = getAmenitiesForCategory(slug, amenitiesByCategory);
            const isCustom = Array.isArray(amenitiesByCategory[slug]) && amenitiesByCategory[slug].length > 0;
            return (
              <div key={slug} className="rounded-lg border border-gray-150 p-3 bg-gray-50">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-gray-800">
                    {getCategoryLabel(slug)}
                    {isCustom && <span className="ml-1 text-[10px] text-amber-500 font-normal">(customized)</span>}
                  </p>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => handleResetAmenities(slug)}
                        className="p-1.5 rounded cursor-pointer transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        title="Reset to defaults"
                      >
                        <span className="text-[10px] font-bold">↺</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenAmenityEdit(slug)}
                      className="flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 cursor-pointer"
                    >
                      <Edit size={13} /> Edit Options
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {options.map((o) => (
                    <span key={o} className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-700 bg-white border border-gray-200 rounded px-2 py-0.5">
                      <AmenityIcon amenity={o} size={11} className="text-brand-600" />
                      {o}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Listing Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Listing Filters</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Choose which filters appear on the public Properties page and in which order. Use “Add Filter” to create filters for your own extra fields. Changes apply immediately.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenAddFilter}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus size={14} /> Add Filter
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Reset to Defaults
            </button>
          </div>
        </div>

        {sortedFilterDefs().length === 0 ? (
          <p className="text-sm text-gray-400 italic py-4 text-center">No filters available.</p>
        ) : (
          <div className="space-y-2">
            {sortedFilterDefs().map((def, idx, all) => (
              <div key={def.id} className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-colors ${def.enabled ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex flex-col">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveFilter(def.id, -1)}
                      className="p-0.5 text-gray-400 hover:text-brand-600 disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === all.length - 1}
                      onClick={() => handleMoveFilter(def.id, 1)}
                      className="p-0.5 text-gray-400 hover:text-brand-600 disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown size={12} />
                    </button>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-800">{def.label}</p>
                    <p className="text-[10px] text-gray-400 truncate">
                      ID: {def.id}
                      {def.custom ? ` · ${def.type} · ${def.source}/${def.fieldKey}${def.options?.length ? ` · ${def.options.length} options` : ''}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {def.custom && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenEditFilter(def)}
                        className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 hover:text-brand-600 cursor-pointer"
                        title="Edit custom filter"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteFilter(def.id)}
                        className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                        title="Delete custom filter"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => handleToggleFilter(def.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                      def.enabled ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    title={def.enabled ? 'Disable filter' : 'Enable filter'}
                  >
                    {def.enabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    {def.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="mt-3 text-xs text-gray-400">
          Filters such as Bedrooms, Bathrooms and Furnishing are shown only when a residential category (Flats, Villas, etc.) is selected. Custom filters require the matching field key stored on the property (e.g. <code>dyn_bhk</code> for dynamic fields, <code>bedrooms</code> for structure).
        </p>
      </div>

      {/* Custom Fields */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-900">Custom Fields</h2>
          <p className="text-xs text-gray-500 mt-0.5">{customOnlyFields.length} field{customOnlyFields.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="space-y-3">
          {customOnlyFields.length === 0 ? (
            <p className="text-sm text-gray-400 italic py-4 text-center">No custom fields yet.</p>
          ) : (
            customOnlyFields.map((field, idx) => (
              <div key={field.id} className="flex items-center justify-between rounded-xl border border-gray-150 p-4 bg-gray-50 text-sm text-gray-700 hover:border-gray-300 transition-colors">
                <div className="space-y-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-base truncate">{field.label}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                    {field.type} &middot; {getCategoryLabel(field.category)} {field.required ? <span className="text-red-600 font-bold">&middot; Required</span> : ''}
                  </p>
                  {field.options && field.options.length > 0 && (
                    <p className="text-xs text-gray-500 italic mt-1 bg-white px-2 py-1 rounded border inline-block">Options: {field.options.join(', ')}</p>
                  )}
                  {field.type === 'group' && field.subFields && field.subFields.length > 0 && (
                    <div className="text-xs text-gray-500 italic mt-1 bg-white px-2 py-1 rounded border inline-block">
                      Sub-parts: {field.subFields.map((sf) => `${sf.label} (${sf.options?.length || 0} options)`).join(', ')}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={() => handleToggleCustomActive(field)}
                    className={`p-1.5 rounded cursor-pointer transition-colors ${field.active !== false ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-400 bg-gray-50 hover:bg-gray-100'}`}
                    title={field.active !== false ? 'Deactivate' : 'Activate'}
                  >
                    <Power size={18} />
                  </button>
<button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveField(field, -1)}
                      className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === customOnlyFields.length - 1}
                      onClick={() => handleMoveField(field, 1)}
                    className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEditField(field)}
                    className="p-1.5 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded cursor-pointer"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteField(field.id, field)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* BUILT-IN FIELD EDIT MODAL */}
      {showBuiltinEditModal && editingBuiltin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold text-brand-800">Edit Field</h3>
              <button type="button" onClick={() => setShowBuiltinEditModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveBuiltinEdit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Field Label</label>
                <input
                  type="text"
                  value={builtinForm.label}
                  onChange={(e) => setBuiltinForm({ ...builtinForm, label: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  required
                />
                <p className="mt-1 text-[11px] text-gray-400">Default: {editingBuiltin.label}</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={builtinForm.step}
                  onChange={(e) => setBuiltinForm({ ...builtinForm, step: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                >
                  {Object.entries(FIELD_STEPS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-gray-400">Default: Step {editingBuiltin.step}</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Input Type</label>
                <select
                  value={builtinForm.type}
                  onChange={(e) => setBuiltinForm({ ...builtinForm, type: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                >
                  <option value="text">Text Input</option>
                  <option value="number">Number Input</option>
                  <option value="textarea">Text Area</option>
                  <option value="select">Dropdown Select</option>
                  <option value="checkbox">Checkbox (Yes/No)</option>
                  <option value="document">Document Uploader</option>
                </select>
                <p className="mt-1 text-[11px] text-gray-400">Default: {editingBuiltin.type}</p>
              </div>
              {builtinForm.type === 'select' && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Dropdown Options (comma-separated)</label>
                  <input
                    type="text"
                    value={builtinForm.optionsString}
                    onChange={(e) => setBuiltinForm({ ...builtinForm, optionsString: e.target.value })}
                    placeholder="e.g. East, West, North, South"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-gray-400">Default: {(editingBuiltin.options || []).join(', ') || 'none'}</p>
                </div>
              )}
              <div className="flex items-center">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={builtinForm.required}
                    onChange={(e) => setBuiltinForm({ ...builtinForm, required: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  Required field
                </label>
              </div>
              <div className="flex justify-end gap-2 border-t pt-3 mt-4">
                <button type="button" onClick={() => setShowBuiltinEditModal(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 cursor-pointer">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM FIELD CREATE/EDIT MODAL */}
      {showFieldModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold text-brand-800">
                {editingField ? 'Edit Field' : isBuiltinField ? 'Add Built-in Field' : 'Add Custom Field'}
              </h3>
              <button type="button" onClick={() => setShowFieldModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveField} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Field Label</label>
                <input
                  type="text"
                  value={fieldForm.label}
                  onChange={(e) => setFieldForm({ ...fieldForm, label: e.target.value })}
                  placeholder="e.g. Owner Name, Survey Number"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={fieldForm.categoryScope}
                  onChange={(e) => setFieldForm({ ...fieldForm, categoryScope: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                >
                  <option value="both">Both Land & Residential</option>
                  <option value="land">Land & Plots Only</option>
                  <option value="residential">Houses & Apartments Only</option>
                  <option value="custom">Specific Categories...</option>
                </select>
                <p className="mt-1 text-[11px] text-gray-400">
                  Pick only the categories this field belongs to (e.g. Open Plots). The field appears only on those property forms.
                </p>
              </div>
              {fieldForm.categoryScope === 'custom' && (
                <div className="rounded-lg border border-gray-200 p-3 bg-gray-50/50 max-h-64 overflow-y-auto space-y-3">
                  <p className="text-xs font-semibold text-gray-500">Select Categories:</p>
                  {groupedCategories.map((group) => {
                    const allSelected = group.items.every((c) => fieldForm.selectedCategories.includes(c.slug));
                    const someSelected = group.items.some((c) => fieldForm.selectedCategories.includes(c.slug));
                    return (
                      <div key={group.key}>
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">{group.title}</p>
                          <button
                            type="button"
                            onClick={() => toggleCategoryGroup(group.key, !allSelected)}
                            className={`text-[11px] font-semibold rounded px-2 py-0.5 transition-colors cursor-pointer ${someSelected ? 'text-green-700 bg-green-50 hover:bg-green-100' : 'text-gray-500 bg-gray-100 hover:bg-gray-200'}`}
                          >
                            {allSelected ? 'Clear' : 'Select all'}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {group.items.map((c) => (
                            <label key={c.slug} className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer hover:text-brand-800">
                              <input
                                type="checkbox"
                                checked={fieldForm.selectedCategories.includes(c.slug)}
                                onChange={(e) => {
                                  const newSel = e.target.checked
                                    ? [...fieldForm.selectedCategories, c.slug]
                                    : fieldForm.selectedCategories.filter((s) => s !== c.slug);
                                  setFieldForm({ ...fieldForm, selectedCategories: newSel });
                                }}
                                className="h-3.5 w-3.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                              />
                              {c.nameEn}
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {otherCategories.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-1.5">Other Categories</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {otherCategories.map((c) => (
                          <label key={c.slug} className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer hover:text-brand-800">
                            <input
                              type="checkbox"
                              checked={fieldForm.selectedCategories.includes(c.slug)}
                              onChange={(e) => {
                                const newSel = e.target.checked
                                  ? [...fieldForm.selectedCategories, c.slug]
                                  : fieldForm.selectedCategories.filter((s) => s !== c.slug);
                                setFieldForm({ ...fieldForm, selectedCategories: newSel });
                              }}
                              className="h-3.5 w-3.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                            />
                            {c.nameEn}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Input Type</label>
                <select
                  value={fieldForm.type}
                  onChange={(e) => setFieldForm({ ...fieldForm, type: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                >
                  <option value="text">Text Input</option>
                  <option value="number">Number Input</option>
                  <option value="textarea">Text Area</option>
                  <option value="select">Dropdown Select</option>
                  <option value="checkbox">Checkbox (Yes/No)</option>
                  <option value="document">Document Uploader</option>
                  <option value="group">Group (Multi-Part Field)</option>
                </select>
              </div>
              {(isBuiltinField || editingField?.builtin) && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Wizard Step (where this field appears)</label>
                  <select
                    value={fieldForm.step}
                    onChange={(e) => setFieldForm({ ...fieldForm, step: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  >
                    {Object.entries(FIELD_STEPS).map(([val, label]) => (
                      <option key={val} value={val}>Step {val} &mdash; {label}</option>
                    ))}
                  </select>
                </div>
              )}
              {fieldForm.type === 'select' && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Options (comma-separated)</label>
                  <input
                    type="text"
                    value={fieldForm.optionsString}
                    onChange={(e) => setFieldForm({ ...fieldForm, optionsString: e.target.value })}
                    placeholder="e.g. East, West, North, South"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                    required
                  />
                </div>
              )}
              {fieldForm.type === 'group' && (
                <div className="rounded-lg border border-gray-200 p-4 bg-gray-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700">Sub-Parts (each becomes a dropdown)</label>
                    <button
                      type="button"
                      onClick={handleAddSubField}
                      className="flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-700 cursor-pointer"
                    >
                      <Plus size={12} /> Add Sub-Part
                    </button>
                  </div>
                  {fieldForm.subFields.length === 0 && (
                    <p className="text-xs text-gray-400 italic">No sub-parts added. Click "Add Sub-Part" to create dropdowns under this field.</p>
                  )}
                  {fieldForm.subFields.map((sf, idx) => (
                    <div key={idx} className="flex items-start gap-2 rounded-lg border border-gray-200 bg-white p-3">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={sf.label}
                          onChange={(e) => handleSubFieldChange(idx, 'label', e.target.value)}
                          placeholder="Sub-part name (e.g. North, South)"
                          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={sf.optionsString}
                          onChange={(e) => handleSubFieldChange(idx, 'optionsString', e.target.value)}
                          placeholder="Dropdown options, comma-separated (e.g. Road, House, Open)"
                          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubField(idx)}
                        className="mt-1 p-1.5 rounded cursor-pointer transition-colors text-gray-400 hover:text-red-600 hover:bg-red-50"
                        title="Remove sub-part"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fieldForm.required}
                    onChange={(e) => setFieldForm({ ...fieldForm, required: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  Required field
                </label>
              </div>
              <div className="flex justify-end gap-2 border-t pt-3 mt-4">
                <button type="button" onClick={() => setShowFieldModal(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 cursor-pointer">
                  {editingField ? 'Save Changes' : 'Create Field'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AMENITIES EDIT MODAL */}
      {showAmenityModal && editingAmenityCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold text-brand-800">Edit Amenities &mdash; {getCategoryLabel(editingAmenityCategory)}</h3>
              <button type="button" onClick={() => setShowAmenityModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveAmenities} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Amenity Options (one per line)</label>
                <textarea
                  rows={8}
                  value={amenityForm.options}
                  onChange={(e) => setAmenityForm({ ...amenityForm, options: e.target.value })}
                  placeholder={"Compound Wall\nStreet Lighting\nWater Supply"}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  required
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  These appear as checkboxes on Step 5 when the seller picks this category.
                </p>
              </div>
              <div className="flex justify-end gap-2 border-t pt-3 mt-4">
                <button type="button" onClick={() => setShowAmenityModal(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 cursor-pointer">Save Amenities</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM FILTER MODAL */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold text-brand-800">{editingFilter ? 'Edit Custom Filter' : 'Add Custom Filter'}</h3>
              <button type="button" onClick={() => setShowFilterModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveFilter} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Filter Label</label>
                <input
                  type="text"
                  value={filterForm.label}
                  onChange={(e) => setFilterForm({ ...filterForm, label: e.target.value })}
                  placeholder="e.g. BHK, Plot Length, Approval Type"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  required
                />
                <p className="mt-1 text-[11px] text-gray-400">Shown to visitors on the Properties page.</p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Filter Type</label>
                <select
                  value={filterForm.type}
                  onChange={(e) => setFilterForm({ ...filterForm, type: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                >
                  <option value="select">Dropdown (choose one of the options)</option>
                  <option value="text">Text input (free search)</option>
                  <option value="number">Number input</option>
                </select>
              </div>

              {filterForm.type === 'select' && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Options (comma-separated)</label>
                  <input
                    type="text"
                    value={filterForm.optionsString}
                    onChange={(e) => setFilterForm({ ...filterForm, optionsString: e.target.value })}
                    placeholder="e.g. 1, 2, 3, 4, 5+ or East, West, North, South"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                    required
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Where the value is stored</label>
                <select
                  value={filterForm.source}
                  onChange={(e) => setFilterForm({ ...filterForm, source: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                >
                  <option value="dynamicFields">Dynamic fields (category-specific extras)</option>
                  <option value="structure">Structure (bedrooms, bathrooms, facing, etc.)</option>
                  <option value="column">Built-in column (price, area, city, areaUnit...)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Field Key</label>
                <input
                  type="text"
                  value={filterForm.fieldKey}
                  onChange={(e) => setFilterForm({ ...filterForm, fieldKey: e.target.value })}
                  placeholder={filterForm.source === 'dynamicFields' ? 'dyn_bhk' : filterForm.source === 'structure' ? 'bedrooms' : 'price'}
                  list={`filter-key-suggestions-${filterForm.source}`}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  required
                />
                <datalist id={`filter-key-suggestions-${filterForm.source}`}>
                  {(CUSTOM_FILTER_SUGGESTIONS[filterForm.source] || []).map((k) => (
                    <option key={k} value={k} />
                  ))}
                </datalist>
                <p className="mt-1 text-[11px] text-gray-400">
                  Must exactly match the key stored on the property. Suggestions appear while typing.
                </p>
              </div>

              <div className="flex justify-end gap-2 border-t pt-3 mt-4">
                <button type="button" onClick={() => setShowFilterModal(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 cursor-pointer">
                  <Save size={15} /> {editingFilter ? 'Save Changes' : 'Create Filter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
