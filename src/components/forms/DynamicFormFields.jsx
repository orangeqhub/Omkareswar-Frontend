import { toTitleCase } from '../../utils/registrationForm';

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none';
const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';
const errorClass = 'mt-1 text-xs text-red-600';

/**
 * Renders the fields of a fetched registration form config using the caller's
 * react-hook-form `register`/`errors`. File fields keep their selected FileList
 * inside the form state (`values`) so the file name can be shown.
 */
export default function DynamicFormFields({ fields = [], register, errors = {}, values = {} }) {
  return fields.map((field) => {
    const key = field.fieldKey;
    const label = field.label || toTitleCase(key);
    const err = errors[key];
    const requiredMark = field.isRequired ? <span className="text-red-500"> *</span> : null;

    let control = null;
    switch (field.fieldType) {
      case 'textarea':
        control = <textarea id={key} rows={3} {...register(key)} className={inputClass} placeholder={field.placeholder} />;
        break;
      case 'number':
        control = <input id={key} type="number" {...register(key)} className={inputClass} placeholder={field.placeholder} />;
        break;
      case 'email':
        control = <input id={key} type="email" {...register(key)} className={inputClass} placeholder={field.placeholder} />;
        break;
      case 'phone':
        control = (
          <input id={key} type="tel" inputMode="numeric" maxLength={10} {...register(key)} className={inputClass} placeholder={field.placeholder} />
        );
        break;
      case 'password':
        control = <input id={key} type="password" {...register(key)} className={inputClass} placeholder={field.placeholder} />;
        break;
      case 'date':
        control = <input id={key} type="date" {...register(key)} className={inputClass} />;
        break;
      case 'checkbox':
        control = (
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" {...register(key)} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600" />
            {label}
          </label>
        );
        break;
      case 'select':
        control = (
          <select id={key} {...register(key)} className={inputClass}>
            <option value="">{field.placeholder || 'Select an option'}</option>
            {(field.options || []).map((opt, i) => {
              const optValue = typeof opt === 'object' ? String(opt.value) : String(opt);
              const optLabel = typeof opt === 'object' ? opt.label : String(opt);
              return (
                <option key={`${key}-${i}`} value={optValue}>
                  {optLabel}
                </option>
              );
            })}
          </select>
        );
        break;
      case 'radio':
        control = (
          <div className="space-y-2">
            {(field.options || []).map((opt, i) => {
              const optValue = typeof opt === 'object' ? String(opt.value) : String(opt);
              const optLabel = typeof opt === 'object' ? opt.label : String(opt);
              return (
                <label key={`${key}-${i}`} className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="radio" value={optValue} {...register(key)} className="h-4 w-4 border-gray-300 text-brand-600" />
                  {optLabel}
                </label>
              );
            })}
          </div>
        );
        break;
      case 'file': {
        const files = values[key] && typeof values[key].length === 'number' ? Array.from(values[key]).map((f) => f.name) : [];
        control = (
          <div>
            <input id={key} type="file" multiple {...register(key)} className="w-full text-sm" />
            {files.length > 0 && <p className="mt-1 text-xs text-gray-500">{files.join(', ')}</p>}
          </div>
        );
        break;
      }
      default:
        control = <input id={key} type="text" {...register(key)} className={inputClass} placeholder={field.placeholder} />;
    }

    return (
      <div key={key}>
        {field.fieldType !== 'checkbox' && (
          <label htmlFor={key} className={labelClass}>
            {label}
            {requiredMark}
          </label>
        )}
        {control}
        {field.helpText && <p className="mt-1 text-xs text-gray-400">{field.helpText}</p>}
        {err && <p className={errorClass}>{err.message}</p>}
      </div>
    );
  });
}
