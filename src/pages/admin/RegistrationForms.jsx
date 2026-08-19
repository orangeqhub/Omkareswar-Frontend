import { useEffect, useMemo, useState } from 'react';
import { toast } from '../../store/toastStore';
import { registrationFormService } from '../../services/registrationFormService';
import {
  FIELD_TYPE_LABELS,
  FORM_TYPE_TO_ROLE,
  toTitleCase,
} from '../../utils/registrationForm';
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit,
  Plus,
  X,
  Power,
  Eye,
  ClipboardList,
} from 'lucide-react';

const FORM_TABS = ['BUYER', 'SELLER', 'EMPLOYEE', 'MEDIATOR'];

// Essential system fields can never be made optional or hidden.
const ESSENTIAL_KEYS = ['name', 'mobile', 'password'];
const SYSTEM_LOCKED_TYPES = ['name', 'mobile', 'password', 'email', 'district', 'city', 'address', 'aadhaarCard', 'panCard', 'certificate10th'];

const FIELD_TYPE_OPTIONS = [
  'text',
  'textarea',
  'number',
  'email',
  'phone',
  'password',
  'date',
  'select',
  'radio',
  'checkbox',
  'file',
];

const emptyFieldForm = {
  fieldKey: '',
  label: '',
  fieldType: 'text',
  placeholder: '',
  helpText: '',
  isRequired: false,
  isActive: true,
  optionsString: '',
  minLength: '',
  maxLength: '',
};

function optionsStringFrom(field) {
  if (!field.options || !field.options.length) return '';
  return field.options.map((o) => (typeof o === 'object' ? o.label : String(o))).join(', ');
}

export default function RegistrationForms() {
  const [forms, setForms] = useState([]);
  const [activeType, setActiveType] = useState('BUYER');
  const [loading, setLoading] = useState(true);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [fieldForm, setFieldForm] = useState(emptyFieldForm);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    registrationFormService
      .listForms()
      .then(setForms)
      .catch(() => toast.error('Failed to load registration forms'))
      .finally(() => setLoading(false));
  }, []);

  const activeForm = useMemo(() => forms.find((f) => f.formType === activeType) || null, [forms, activeType]);

  function refreshForms() {
    registrationFormService.listForms().then(setForms).catch(() => toast.error('Failed to refresh registration forms'));
  }

  async function handleToggleFormActive() {
    if (!activeForm) return;
    try {
      const updated = await registrationFormService.updateFormMeta(activeType, {
        isActive: !activeForm.isActive,
      });
      setForms((prev) => prev.map((f) => (f.formType === activeType ? updated : f)));
      toast.success(`Form ${activeForm.isActive ? 'disabled' : 'enabled'} successfully`);
    } catch (err) {
      toast.error(err.message || 'Failed to update form');
    }
  }

  function handleOpenAddField() {
    setEditingField(null);
    setFieldForm(emptyFieldForm);
    setShowFieldModal(true);
  }

  function handleOpenEditField(field) {
    setEditingField(field);
    setFieldForm({
      fieldKey: field.fieldKey,
      label: field.label,
      fieldType: field.fieldType,
      placeholder: field.placeholder || '',
      helpText: field.helpText || '',
      isRequired: field.isRequired,
      isActive: field.isActive,
      optionsString: optionsStringFrom(field),
      minLength: field.validation?.minLength != null ? String(field.validation.minLength) : '',
      maxLength: field.validation?.maxLength != null ? String(field.validation.maxLength) : '',
    });
    setShowFieldModal(true);
  }

  async function handleSaveField(e) {
    e.preventDefault();
    const isSystem = !!editingField?.isSystemField;

    if (!isSystem) {
      if (!fieldForm.fieldKey.trim()) {
        toast.error('Field key is required');
        return;
      }
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(fieldForm.fieldKey.trim())) {
        toast.error('Field key must start with a letter and contain only letters, numbers and underscores');
        return;
      }
    }
    if (!fieldForm.label.trim()) {
      toast.error('Label is required');
      return;
    }

    if (['select', 'radio'].includes(fieldForm.fieldType) && !fieldForm.optionsString.trim()) {
      toast.error('Options are required for dropdown and radio fields');
      return;
    }

    const options = fieldForm.optionsString
      ? fieldForm.optionsString
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean)
          .map((label) => ({ label, value: label.toLowerCase().replace(/\s+/g, '_') }))
      : undefined;

    const validation = {};
    if (fieldForm.minLength !== '') validation.minLength = Number(fieldForm.minLength);
    if (fieldForm.maxLength !== '') validation.maxLength = Number(fieldForm.maxLength);

    const payload = {
      fieldKey: fieldForm.fieldKey.trim(),
      label: fieldForm.label.trim(),
      fieldType: fieldForm.fieldType,
      placeholder: fieldForm.placeholder.trim(),
      helpText: fieldForm.helpText,
      isRequired: fieldForm.isRequired,
      isActive: fieldForm.isActive,
      options,
      validation,
    };

    try {
      if (editingField) {
        await registrationFormService.updateField(activeType, editingField.id, payload);
        toast.success('Field updated successfully');
      } else {
        await registrationFormService.createField(activeType, payload);
        toast.success('Field added successfully');
      }
      setShowFieldModal(false);
      refreshForms();
    } catch (err) {
      toast.error(err.message || 'Failed to save field');
    }
  }

  async function handleDeleteField(field) {
    if (!window.confirm(`Delete "${field.label}"? Stored user data is not removed.`)) return;
    try {
      await registrationFormService.deleteField(activeType, field.id);
      toast.success('Field deleted');
      refreshForms();
    } catch (err) {
      toast.error(err.message || 'Failed to delete field');
    }
  }

  async function handleMoveField(idx, direction) {
    if (!activeForm) return;
    const target = idx + direction;
    if (target < 0 || target >= activeForm.fields.length) return;
    const keys = activeForm.fields.map((f) => f.fieldKey);
    const temp = keys[idx];
    keys[idx] = keys[target];
    keys[target] = temp;
    try {
      await registrationFormService.reorderFields(activeType, keys);
      refreshForms();
    } catch (err) {
      toast.error(err.message || 'Failed to reorder fields');
    }
  }

  async function handleToggleActive(field) {
    try {
      await registrationFormService.updateField(activeType, field.id, { isActive: !field.isActive });
      refreshForms();
    } catch (err) {
      toast.error(err.message || 'Failed to toggle field');
    }
  }

  async function handleToggleRequired(field) {
    if (ESSENTIAL_KEYS.includes(field.fieldKey)) return;
    try {
      await registrationFormService.updateField(activeType, field.id, { isRequired: !field.isRequired });
      refreshForms();
    } catch (err) {
      toast.error(err.message || 'Failed to update field');
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Loading registration forms...</div>;
  }

  const isSystemEdit = !!editingField?.isSystemField;
  const typeLocked = isSystemEdit && SYSTEM_LOCKED_TYPES.includes(editingField.fieldKey);
  const essentialLocked = isSystemEdit && ESSENTIAL_KEYS.includes(editingField.fieldKey);
  const requiresOptions = ['select', 'radio'].includes(fieldForm.fieldType);

  return (
    <div className="space-y-5">
      <div className="mb-4 flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-brand-800" />
          <h1 className="font-semibold text-brand-800 text-xl">Registration Forms</h1>
        </div>
        <div className="flex items-center gap-2">
          {activeForm && (
            <button
              type="button"
              onClick={handleToggleFormActive}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold cursor-pointer ${
                activeForm.isActive
                  ? 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <Power size={16} /> {activeForm.isActive ? 'Disable Form' : 'Enable Form'}
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            <Eye size={16} /> Preview
          </button>
          <button
            type="button"
            onClick={handleOpenAddField}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-warm-white hover:bg-brand-700 cursor-pointer"
          >
            <Plus size={16} /> Add Field
          </button>
        </div>
      </div>

      {/* Form type tabs */}
      <div className="flex flex-wrap gap-2">
        {FORM_TABS.map((ft) => {
          const form = forms.find((f) => f.formType === ft);
          const active = ft === activeType;
          return (
            <button
              key={ft}
              type="button"
              onClick={() => setActiveType(ft)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${
                active ? 'bg-brand-600 text-warm-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {toTitleCase(FORM_TYPE_TO_ROLE[ft])}
              {form && !form.isActive && <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-[10px] text-red-700">OFF</span>}
            </button>
          );
        })}
      </div>

      <p className="text-sm text-gray-500">
        Configure the fields collected when a {FORM_TYPE_TO_ROLE[activeType]} registers. Custom fields are stored on the
        user record as additional information. System fields (locked) map to existing profile fields and cannot be
        deleted or re-keyed.
      </p>

      {/* Fields list */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        {activeForm?.fields.length === 0 ? (
          <p className="py-4 text-center text-sm italic text-gray-400">
            No fields configured for this form. Click "Add Field" to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {(activeForm?.fields || []).map((field, idx) => {
              const isActive = field.isActive;
              return (
                <div
                  key={field.id}
                  className={`flex items-center justify-between rounded-xl border p-4 text-sm text-gray-700 transition-colors ${
                    isActive ? 'border-gray-150 bg-gray-50 hover:border-gray-300' : 'border-gray-100 bg-gray-100/60 opacity-70'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900 text-base">{field.label}</p>
                      {field.isSystemField && (
                        <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">
                          System
                        </span>
                      )}
                      {!isActive && (
                        <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-600">
                          Hidden
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                      <code className="text-brand-700">{field.fieldKey}</code> &middot; {FIELD_TYPE_LABELS[field.fieldType] || field.fieldType}
                      {field.isRequired ? <span className="ml-1 font-bold text-red-600">&middot; Required</span> : ''}
                    </p>
                    {(field.options || []).length > 0 && (
                      <p className="mt-1 inline-block rounded border bg-white px-2 py-1 text-xs italic text-gray-500">
                        Options: {field.options.map((o) => (typeof o === 'object' ? o.label : String(o))).join(', ')}
                      </p>
                    )}
                    {field.helpText && <p className="text-xs text-gray-400">{field.helpText}</p>}
                  </div>

                  <div className="flex items-center gap-3">
                    {!ESSENTIAL_KEYS.includes(field.fieldKey) && (
                      <button
                        type="button"
                        onClick={() => handleToggleRequired(field)}
                        className={`rounded px-2 py-1 text-xs font-semibold cursor-pointer ${
                          field.isRequired ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        title="Toggle required"
                      >
                        {field.isRequired ? 'Required' : 'Optional'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(field)}
                      className={`p-1.5 rounded hover:bg-gray-100 cursor-pointer transition-colors ${
                        isActive ? 'text-green-600 hover:text-green-700 bg-green-50' : 'text-gray-400 hover:text-gray-500 bg-gray-50'
                      }`}
                      title={isActive ? 'Hide field' : 'Show field'}
                    >
                      <Power size={18} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveField(idx, -1)}
                      className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded disabled:opacity-30 cursor-pointer"
                      title="Move up"
                    >
                      <ArrowUp size={18} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === activeForm.fields.length - 1}
                      onClick={() => handleMoveField(idx, 1)}
                      className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded disabled:opacity-30 cursor-pointer"
                      title="Move down"
                    >
                      <ArrowDown size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditField(field)}
                      className="p-1.5 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded cursor-pointer"
                      title="Edit field"
                    >
                      <Edit size={18} />
                    </button>
                    {!field.isSystemField && (
                      <button
                        type="button"
                        onClick={() => handleDeleteField(field)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                        title="Delete field"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / edit field modal */}
      {showFieldModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold text-brand-800">
                {editingField ? `Edit Field: ${editingField.label}` : 'Add Field'}
              </h3>
              <button type="button" onClick={() => setShowFieldModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveField} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Label *</label>
                  <input
                    type="text"
                    value={fieldForm.label}
                    onChange={(e) => {
                      const label = e.target.value;
                      setFieldForm({
                        ...fieldForm,
                        label,
                        fieldKey: isSystemEdit ? fieldForm.fieldKey : label ? toTitleCase(label).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') : '',
                      });
                    }}
                    placeholder="e.g. Occupation, Preferred Location"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Field Key *</label>
                  <input
                    type="text"
                    value={fieldForm.fieldKey}
                    onChange={(e) => !isSystemEdit && setFieldForm({ ...fieldForm, fieldKey: e.target.value })}
                    placeholder="e.g. occupation"
                    disabled={isSystemEdit}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
                    required
                  />
                  {isSystemEdit && <p className="mt-1 text-xs text-gray-400">System field key cannot be changed</p>}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Input Type</label>
                <select
                  value={fieldForm.fieldType}
                  onChange={(e) => setFieldForm({ ...fieldForm, fieldType: e.target.value })}
                  disabled={typeLocked}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
                >
                  {FIELD_TYPE_OPTIONS.map((ft) => (
                    <option key={ft} value={ft}>
                      {FIELD_TYPE_LABELS[ft]}
                    </option>
                  ))}
                </select>
                {typeLocked && <p className="mt-1 text-xs text-gray-400">System field type cannot be changed</p>}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Placeholder</label>
                  <input
                    type="text"
                    value={fieldForm.placeholder}
                    onChange={(e) => setFieldForm({ ...fieldForm, placeholder: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Min Length</label>
                  <input
                    type="number"
                    min={0}
                    value={fieldForm.minLength}
                    onChange={(e) => setFieldForm({ ...fieldForm, minLength: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Max Length</label>
                  <input
                    type="number"
                    min={0}
                    value={fieldForm.maxLength}
                    onChange={(e) => setFieldForm({ ...fieldForm, maxLength: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Help Text</label>
                  <input
                    type="text"
                    value={fieldForm.helpText}
                    onChange={(e) => setFieldForm({ ...fieldForm, helpText: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {requiresOptions && (
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

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fieldForm.isRequired}
                    disabled={essentialLocked}
                    onChange={(e) => setFieldForm({ ...fieldForm, isRequired: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 disabled:opacity-50"
                  />
                  Required field
                  {essentialLocked && <span className="text-xs text-gray-400">(always required)</span>}
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fieldForm.isActive}
                    disabled={essentialLocked}
                    onChange={(e) => setFieldForm({ ...fieldForm, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 disabled:opacity-50"
                  />
                  Visible on form
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t pt-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowFieldModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 cursor-pointer"
                >
                  {editingField ? 'Save Changes' : 'Create Field'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold text-brand-800">
                Preview: {activeForm?.name || activeType} Registration Form
              </h3>
              <button type="button" onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              How this form appears to users. Hidden fields and the static terms/role controls are not shown.
            </p>
            <div className="mt-4 space-y-4">
              {(activeForm?.fields || [])
                .filter((f) => f.isActive)
                .map((field) => {
                  const isReq = field.isRequired;
                  return (
                    <div key={field.id}>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        {field.label}
                        {isReq && <span className="text-red-500"> *</span>}
                      </label>
                      {field.fieldType === 'textarea' ? (
                        <textarea rows={3} disabled placeholder={field.placeholder} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm" />
                      ) : field.fieldType === 'select' ? (
                        <select disabled className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm">
                          <option>Select an option</option>
                          {(field.options || []).map((o, i) => (
                            <option key={i}>{typeof o === 'object' ? o.label : String(o)}</option>
                          ))}
                        </select>
                      ) : field.fieldType === 'radio' ? (
                        <div className="space-y-1.5">
                          {(field.options || []).map((o, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                              <input type="radio" disabled />
                              {typeof o === 'object' ? o.label : String(o)}
                            </div>
                          ))}
                        </div>
                      ) : field.fieldType === 'checkbox' ? (
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                          <input type="checkbox" disabled /> {field.label}
                        </label>
                      ) : field.fieldType === 'file' ? (
                        <input type="file" disabled className="w-full text-sm" />
                      ) : (
                        <input
                          type={field.fieldType === 'password' ? 'password' : field.fieldType === 'date' ? 'date' : 'text'}
                          disabled
                          placeholder={field.placeholder}
                          className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm"
                        />
                      )}
                      {field.helpText && <p className="mt-1 text-xs text-gray-400">{field.helpText}</p>}
                    </div>
                  );
                })}
              {(activeForm?.fields || []).filter((f) => f.isActive).length === 0 && (
                <p className="py-4 text-center text-sm italic text-gray-400">No visible fields in this form.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
