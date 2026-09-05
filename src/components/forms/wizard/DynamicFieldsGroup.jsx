import { useState } from 'react';
import { Check } from 'lucide-react';
import DocumentUploader from '../DocumentUploader';
import { useLanguageStore } from '../../../store/languageStore';
import { getTe } from '../../../config/teluguDict';

export default function DynamicFieldsGroup({ fields, dynamicFields, updateDynamicField, onDocumentUpload, vertical }) {
  const [customActive, setCustomActive] = useState({});
  const language = useLanguageStore((s) => s.language);
  const g = (text) => getTe(text, language);

  if (!fields || fields.length === 0) return null;

  function renderField(field) {
    const val = dynamicFields[field.id] || '';

    if (field.type === 'group') {
      const subFields = field.subFields || [];
      return (
        <div key={field.id} className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">{g(field.label)}</label>
          <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 space-y-3">
            {subFields.length === 0 ? (
              <p className="text-xs text-gray-400 italic">{g('No sub-parts configured.')}</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {subFields.map((sf) => {
                  const sfKey = `${field.id}_${sf.id}`;
                  const sfVal = dynamicFields[sfKey] || '';
                  return (
                    <div key={sf.id}>
                      <label className="mb-1 block text-[11px] font-semibold text-gray-600">{g(sf.label)}</label>
                      <select value={sfVal} onChange={(e) => updateDynamicField(sfKey, e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/25 focus:outline-none transition-colors">
                        <option value="">{g('Select...')}</option>
                        {(sf.options || []).map((o) => <option key={o} value={o}>{g(o)}</option>)}
                      </select>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (field.type === 'direction') {
      const boundaryVal = dynamicFields[field.boundaryId] || '';
      const feetVal = dynamicFields[field.feetId] || '';
      return (
        <div key={field.id} className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">{g(field.label)}</label>
          <div className="flex gap-3 items-center">
            <input type="text" value={boundaryVal} onChange={(e) => updateDynamicField(field.boundaryId, e.target.value)} placeholder={g(`${field.label} boundary details`)} className="flex-1 rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/25 focus:outline-none transition-colors" />
            <input type="number" min="0" value={feetVal} onChange={(e) => { const v = e.target.value; updateDynamicField(field.feetId, v === '' ? '' : Math.max(0, Number(v))); }} placeholder="Feet" className="w-24 rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/25 focus:outline-none transition-colors" />
            <span className="text-xs font-semibold text-gray-500 shrink-0">{g('Feet')}</span>
          </div>
        </div>
      );
    }

    if (field.type === 'checkbox') {
      return (
        <div key={field.id} className="flex items-center h-[70px]">
          <label className="flex items-center gap-3 w-full rounded-lg border border-gray-200 px-4 py-3.5 bg-gray-50/50 hover:bg-gray-50 cursor-pointer transition-all hover:border-gray-300">
            <input type="checkbox" checked={!!val} onChange={(e) => updateDynamicField(field.id, e.target.checked)} className="h-4.5 w-4.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
            <span className="text-sm font-semibold text-gray-700 select-none">{g(field.label)}</span>
          </label>
        </div>
      );
    }

    if (field.type === 'checkbox-group') {
      const options = field.options || [];
      const selected = new Set(String(val || '').split(',').map((s) => s.trim()).filter(Boolean));
      const toggle = (opt) => {
        const next = new Set(selected);
        if (next.has(opt)) next.delete(opt);
        else next.add(opt);
        updateDynamicField(field.id, Array.from(next).join(', '));
      };
      return (
        <div key={field.id} className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">{g(field.label)}</label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {options.map((opt) => {
              const active = selected.has(opt);
              return (
                <label
                  key={opt}
                  className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all select-none ${active ? 'border-brand-600 bg-brand-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                >
                  <input type="checkbox" checked={active} onChange={() => toggle(opt)} className="h-5 w-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
                  <span className={`flex-1 text-sm font-semibold ${active ? 'text-brand-800' : 'text-gray-700'}`}>{g(opt)}</span>
                  {active && <Check className="h-4 w-4 text-brand-600 shrink-0" strokeWidth={3} />}
                </label>
              );
            })}
          </div>
        </div>
      );
    }

    if (field.type === 'document') {
      return (
        <div key={field.id} className="sm:col-span-2">
          <div className="rounded-xl border border-gray-200 p-4 bg-gray-50/30">
            <DocumentUploader label={g(field.label)} document={val ? { fileName: val.split('/').pop() } : null} onUpload={(file) => onDocumentUpload(field.id, file)} />
          </div>
        </div>
      );
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.id} className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">{g(field.label)}</label>
          <textarea rows={3} value={val} onChange={(e) => updateDynamicField(field.id, e.target.value)} placeholder={field.placeholder ? g(field.placeholder) : `${g('Enter')} ${g(field.label)}`} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/25 focus:outline-none transition-colors" />
        </div>
      );
    }

    if (field.type === 'select') {
      const isApprovalField = /approval/i.test(field.id) && (field.options || []).includes('Other');
      const options = isApprovalField ? (field.options || []).filter((o) => o !== 'Other') : (field.options || []);
      const customMode = isApprovalField && (customActive[field.id] || (val !== '' && !options.includes(val)));
      const selectValue = customMode ? '__custom__' : val;

      return (
        <div key={field.id}>
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">{g(field.label)}</label>
          <select
            value={selectValue}
            onChange={(e) => {
              if (e.target.value === '__custom__') {
                setCustomActive((m) => ({ ...m, [field.id]: true }));
              } else {
                setCustomActive((m) => ({ ...m, [field.id]: false }));
                updateDynamicField(field.id, e.target.value);
              }
            }}
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/25 focus:outline-none transition-colors"
          >
            <option value="">{g('Select...')}</option>
            {options.map((o) => (
              <option key={o} value={o}>{g(o)}</option>
            ))}
            {isApprovalField && <option value="__custom__">{g('Other (type your own)')}</option>}
          </select>
          {customMode && (
            <input
              type="text"
              value={val}
              onChange={(e) => updateDynamicField(field.id, e.target.value)}
              placeholder={`${g('Type your own')} ${g(field.label)}...`}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/25 focus:outline-none transition-colors"
            />
          )}
        </div>
      );
    }

    return (
      <div key={field.id}>
        <label className="mb-1.5 block text-xs font-semibold text-gray-700">{g(field.label)}</label>
        <input type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'} value={val} onChange={(e) => updateDynamicField(field.id, e.target.value)} placeholder={field.placeholder ? g(field.placeholder) : field.type === 'date' ? undefined : `${g('Enter')} ${g(field.label)}`} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/25 focus:outline-none transition-colors" />
      </div>
    );
  }

  return vertical ? (
    <div className="space-y-4">{fields.map(renderField)}</div>
  ) : (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{fields.map(renderField)}</div>
  );
}