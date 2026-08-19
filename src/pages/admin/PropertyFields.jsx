import { useEffect, useState } from 'react';
import { settingsService } from '../../services/settingsService';
import { toast } from '../../store/toastStore';
import { Settings as SettingsIcon, ArrowUp, ArrowDown, Trash2, Edit, Plus, X, Power, ToggleLeft, ToggleRight } from 'lucide-react';
import { CATEGORIES } from '../../config/categories';
import { FIELD_DEFINITIONS, FIELD_STEPS, CATEGORY_DYNAMIC_FIELDS } from '../../config/propertyFieldDefinitions';

export default function PropertyFields() {
  const [settings, setSettings] = useState(null);
  const [savingField, setSavingField] = useState(null);

  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [fieldForm, setFieldForm] = useState({
    label: '',
    type: 'text',
    categoryScope: 'both',
    selectedCategories: [],
    optionsString: '',
    required: false,
    subFields: [],
  });

  const [showBuiltinEditModal, setShowBuiltinEditModal] = useState(false);
  const [editingBuiltin, setEditingBuiltin] = useState(null);
  const [builtinForm, setBuiltinForm] = useState({ label: '', type: 'text', step: '', required: false });

  useEffect(() => {
    settingsService.getSettings().then(setSettings);
  }, []);

  const propertyFields = settings?.propertyFields || [];
  const fieldConfig = settings?.fieldConfig || {};

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
    FIELD_DEFINITIONS.forEach((def) => {
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

  function handleOpenBuiltinEdit(def) {
    setEditingBuiltin(def);
    const cfg = getBuiltinConfig(def.id);
    setBuiltinForm({ label: cfg.label || def.label, type: cfg.type || def.type, step: cfg.step || def.step || '', required: cfg.required || false });
    setShowBuiltinEditModal(true);
  }

  async function handleSaveBuiltinEdit(e) {
    e.preventDefault();
    if (!builtinForm.label.trim()) {
      toast.error('Label is required');
      return;
    }
    const cfg = getBuiltinConfig(editingBuiltin.id);
    const updated = {
      ...fieldConfig,
      [editingBuiltin.id]: { ...cfg, label: builtinForm.label.trim(), type: builtinForm.type, step: builtinForm.step || cfg.step, required: builtinForm.required },
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
    const { label: _label, type: _type, step: _step, required: _required, ...rest } = cfg;
    const updated = { ...fieldConfig, [def.id]: rest };
    try {
      const res = await settingsService.updateSettings({ fieldConfig: updated });
      setSettings(res);
      toast.success('Field reset to defaults!');
    } catch {
      toast.error('Failed to reset field.');
    }
  }

  function handleOpenAddField() {
    setEditingField(null);
    setFieldForm({
      label: '',
      type: 'text',
      categoryScope: 'both',
      selectedCategories: [],
      optionsString: '',
      required: false,
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
      ...(fieldForm.type === 'group' ? { subFields } : {}),
    };
    let updatedList;
    if (editingField) {
      updatedList = propertyFields.map((f) =>
        f.id === editingField.id ? { ...f, ...fieldData } : f
      );
      toast.success('Field updated!');
    } else {
      updatedList = [...propertyFields, { ...fieldData, id: 'f_' + Date.now() }];
      toast.success('Field added!');
    }
    try {
      const res = await settingsService.updateSettings({ propertyFields: updatedList });
      setSettings(res);
      setShowFieldModal(false);
    } catch {
      toast.error('Failed to save field.');
    }
  }

  async function handleDeleteField(id) {
    if (!window.confirm('Delete this custom field?')) return;
    const updated = propertyFields.filter((f) => f.id !== id);
    try {
      const res = await settingsService.updateSettings({ propertyFields: updated });
      setSettings(res);
      toast.success('Field deleted.');
    } catch {
      toast.error('Failed to delete field.');
    }
  }

  async function handleMoveField(idx, direction) {
    const updated = [...propertyFields];
    const target = idx + direction;
    if (target < 0 || target >= updated.length) return;
    [updated[idx], updated[target]] = [updated[target], updated[idx]];
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

  const groupedBuiltin = {};
  FIELD_DEFINITIONS.forEach((def) => {
    if (!groupedBuiltin[def.step]) groupedBuiltin[def.step] = [];
    groupedBuiltin[def.step].push(def);
  });

  const builtinEnabledCount = FIELD_DEFINITIONS.filter((d) => getBuiltinConfig(d.id).enabled !== false).length;
  const builtinRequiredCount = FIELD_DEFINITIONS.filter((d) => getBuiltinConfig(d.id).required === true).length;

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
        Control which fields appear on the property form. Edit labels, enable/disable, make required, and add custom fields. Changes reflect on the user property form immediately.
      </p>

      {/* Built-in Fields */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Built-in Fields</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {builtinEnabledCount}/{FIELD_DEFINITIONS.length} enabled &middot; {builtinRequiredCount} required
            </p>
          </div>
          <div className="flex items-center gap-2">
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

        <div className="space-y-4">
          {Object.entries(groupedBuiltin).map(([step, fields]) => (
            <div key={step}>
              <p className="text-xs font-bold text-brand-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold">{step}</span>
                Step {step} &mdash; {FIELD_STEPS[step]}
              </p>
              <div className="rounded-lg border border-gray-100 divide-y divide-gray-100">
                {fields.map((def) => {
                  const cfg = getBuiltinConfig(def.id);
                  const isEnabled = cfg.enabled !== false;
                  const isRequired = cfg.required === true;
                  const isCustomized = cfg.label || cfg.type;
                  return (
                    <div key={def.id} className={`flex items-center justify-between px-3 py-2.5 text-sm transition-colors ${isEnabled ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="truncate font-medium text-gray-800">
                          {getDisplayLabel(def)}
                          {isCustomized && <span className="ml-1 text-[10px] text-amber-500 font-normal">(edited)</span>}
                        </span>
                        <span className="shrink-0 text-[10px] font-medium text-gray-400 uppercase bg-gray-100 rounded px-1.5 py-0.5">{getDisplayType(def)}</span>
                        <span className="shrink-0 text-[10px] font-medium text-blue-500 bg-blue-50 rounded px-1.5 py-0.5">{getCategoryLabel(def.category)}</span>
                        {isRequired && <span className="shrink-0 text-[10px] font-bold text-red-600 bg-red-50 rounded px-1.5 py-0.5">Required</span>}
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
          ))}
        </div>
      </div>

      {/* Category-Specific Dynamic Fields */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-900">Category-Specific Fields</h2>
          <p className="text-xs text-gray-500 mt-0.5">Fields that appear based on the selected property category. Each field can be enabled/disabled and customized.</p>
        </div>
        <div className="space-y-5">
          {Object.entries(CATEGORY_DYNAMIC_FIELDS).map(([catSlug, catDef]) => {
            const enabledCount = catDef.fields.filter((f) => {
              const cfg = fieldConfig[f.id];
              return cfg ? cfg.enabled !== false : true;
            }).length;
            return (
              <div key={catSlug}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-brand-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold">{enabledCount}</span>
                    {catDef.label}
                    <span className="text-gray-400 font-normal normal-case tracking-normal">&mdash; {catDef.fields.length} fields, {enabledCount} enabled</span>
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = { ...fieldConfig };
                        catDef.fields.forEach((f) => {
                          const cur = updated[f.id] || { enabled: true, required: false };
                          updated[f.id] = { ...cur, enabled: true };
                        });
                        settingsService.updateSettings({ fieldConfig: updated }).then(setSettings);
                      }}
                      className="rounded border border-green-300 bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700 hover:bg-green-100 cursor-pointer"
                    >Enable All</button>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = { ...fieldConfig };
                        catDef.fields.forEach((f) => {
                          const cur = updated[f.id] || { enabled: true, required: false };
                          updated[f.id] = { ...cur, enabled: false };
                        });
                        settingsService.updateSettings({ fieldConfig: updated }).then(setSettings);
                      }}
                      className="rounded border border-red-300 bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700 hover:bg-red-100 cursor-pointer"
                    >Disable All</button>
                  </div>
                </div>
                <div className="rounded-lg border border-gray-100 divide-y divide-gray-100">
                  {catDef.fields.map((fDef) => {
                    const cfg = fieldConfig[fDef.id] || {};
                    const isEnabled = cfg.enabled !== false;
                    const isRequired = cfg.required === true;
                    const displayLabel = cfg.label || fDef.label;
                    const displayType = cfg.type || fDef.type;
                    const isCustomized = cfg.label || cfg.type;
                    return (
                      <div key={fDef.id} className={`flex items-center justify-between px-3 py-2.5 text-sm transition-colors ${isEnabled ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="truncate font-medium text-gray-800">
                            {displayLabel}
                            {isCustomized && <span className="ml-1 text-[10px] text-amber-500 font-normal">(edited)</span>}
                          </span>
                          <span className="shrink-0 text-[10px] font-medium text-gray-400 uppercase bg-gray-100 rounded px-1.5 py-0.5">{displayType}</span>
                          {isRequired && <span className="shrink-0 text-[10px] font-bold text-red-600 bg-red-50 rounded px-1.5 py-0.5">Required</span>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBuiltin({ id: fDef.id, label: fDef.label, type: fDef.type, step: fDef.step });
                              setBuiltinForm({ label: displayLabel, type: displayType, step: String(fDef.step), required: isRequired });
                              setShowBuiltinEditModal(true);
                            }}
                            className="p-1.5 rounded cursor-pointer transition-colors text-gray-500 hover:text-amber-600 hover:bg-amber-50"
                            title="Edit label / type"
                          >
                            <Edit size={15} />
                          </button>
                          {isCustomized && (
                            <button
                              type="button"
                              onClick={() => {
                                const { label: _l, type: _t, required: _r, ...rest } = cfg;
                                const updated = { ...fieldConfig, [fDef.id]: rest };
                                settingsService.updateSettings({ fieldConfig: updated }).then(setSettings);
                                toast.success('Field reset!');
                              }}
                              className="p-1.5 rounded cursor-pointer transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                              title="Reset to default"
                            >
                              <span className="text-[10px] font-bold">↺</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleToggleBuiltin(fDef.id, 'enabled')}
                            className={`p-1.5 rounded cursor-pointer transition-colors ${isEnabled ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                            title={isEnabled ? 'Disable field' : 'Enable field'}
                          >
                            {isEnabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleBuiltin(fDef.id, 'required')}
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
        </div>
      </div>

      {/* Custom Fields */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-900">Custom Fields</h2>
          <p className="text-xs text-gray-500 mt-0.5">{propertyFields.length} field{propertyFields.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="space-y-3">
          {propertyFields.length === 0 ? (
            <p className="text-sm text-gray-400 italic py-4 text-center">No custom fields yet.</p>
          ) : (
            propertyFields.map((field, idx) => (
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
                    onClick={() => handleMoveField(idx, -1)}
                    className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={idx === propertyFields.length - 1}
                    onClick={() => handleMoveField(idx, 1)}
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
                    onClick={() => handleDeleteField(field.id)}
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
                {editingField ? 'Edit Field' : 'Add Custom Field'}
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
                  <option value="land">Land Only</option>
                  <option value="residential">Residential Only</option>
                  <option value="custom">Specific Categories...</option>
                </select>
              </div>
              {fieldForm.categoryScope === 'custom' && (
                <div className="rounded-lg border border-gray-200 p-3 bg-gray-50/50 space-y-2 max-h-48 overflow-y-auto">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Select Categories:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {CATEGORIES.map((c) => (
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
    </div>
  );
}
