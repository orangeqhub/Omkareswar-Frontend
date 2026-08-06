import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Power } from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import { propertyService } from '../../services/propertyService';
import { toast } from '../../store/toastStore';
import EmptyState from '../../components/common/EmptyState';

const AREA_UNITS = ['sqft', 'sqyd', 'acre', 'cent'];
const TRANSACTION_TYPES = ['sale'];

function emptyForm() {
  return {
    slug: '',
    nameEn: '',
    nameTe: '',
    descriptionEn: '',
    descriptionTe: '',
    image: '',
    icon: 'Home',
    transactionTypes: ['sale'],
    areaUnits: ['sqft'],
    propertyFields: '',
    active: true,
    visible: true,
  };
}

export default function Categories() {
  const { t } = useTranslation(['dashboard', 'common']);
  const [categories, setCategories] = useState(null);
  const [counts, setCounts] = useState({});
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState(null);

  function load() {
    categoryService.getCategories().then(setCategories);
    propertyService.getProperties({ includeAllStatuses: true, pageSize: 1000 }).then((r) => {
      const tally = {};
      for (const p of r.items) tally[p.categorySlug] = (tally[p.categorySlug] || 0) + 1;
      setCounts(tally);
    });
  }

  useEffect(load, []);

  function openCreate() {
    setForm(emptyForm());
    setEditing('new');
  }

  function openEdit(c) {
    setForm({ ...c });
    setEditing(c.slug);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editing === 'new') {
        await categoryService.createCategory(form);
        toast.success(t('toast.categoryCreated'));
      } else {
        await categoryService.updateCategory(editing, form);
        toast.success(t('toast.categoryUpdated'));
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(t(err.message));
    }
  }

  async function handleToggle(c, field) {
    await categoryService.updateCategory(c.slug, { [field]: !c[field] });
    load();
  }

  async function handleReorder(c, direction) {
    await categoryService.reorder(c.slug, direction);
    load();
  }

  async function handleDelete() {
    try {
      await categoryService.deleteCategory(deleteTarget.slug);
      toast.success(t('toast.categoryDeleted'));
    } catch (err) {
      toast.error(t(err.message));
    }
    setDeleteTarget(null);
    load();
  }

  function toggleListValue(key, value) {
    setForm((f) => {
      const has = f[key].includes(value);
      return { ...f, [key]: has ? f[key].filter((v) => v !== value) : [...f[key], value] };
    });
  }

  if (categories === null) return null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-semibold text-brand-800">{t('category.title')}</h1>
        <button type="button" onClick={openCreate} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-warm-white">
          <Plus size={16} /> {t('category.addCategory')}
        </button>
      </div>

      {categories.length === 0 ? (
        <EmptyState titleKey="empty.noData" />
      ) : (
        <div className="space-y-3">
          {categories.map((c, i) => (
            <div key={c.slug} className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center">
              {c.image && <img src={c.image} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />}
              <div className="flex-1">
                <p className="font-medium text-gray-800">
                  {c.nameEn} <span className="lang-te ml-1 text-gray-500">/ {c.nameTe}</span>
                </p>
                <p className="text-xs text-gray-400">{c.slug}</p>
                <p className="mt-1 text-xs text-gray-500">{t('category.propertyCount', { count: counts[c.slug] || 0 })}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.active ? t('category.active') : t('category.inactive')}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.visible ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.visible ? t('category.visible') : t('category.hidden')}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button type="button" onClick={() => handleReorder(c, 'up')} disabled={i === 0} aria-label={t('category.moveUp')} className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 disabled:opacity-30">
                  <ArrowUp size={15} />
                </button>
                <button type="button" onClick={() => handleReorder(c, 'down')} disabled={i === categories.length - 1} aria-label={t('category.moveDown')} className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 disabled:opacity-30">
                  <ArrowDown size={15} />
                </button>
                <button type="button" onClick={() => handleToggle(c, 'visible')} aria-label={c.visible ? t('category.hide') : t('category.show')} className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50">
                  {c.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button type="button" onClick={() => handleToggle(c, 'active')} aria-label={c.active ? t('category.deactivate') : t('category.activate')} className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50">
                  <Power size={15} className={c.active ? 'text-green-600' : 'text-gray-400'} />
                </button>
                <button type="button" onClick={() => openEdit(c)} aria-label={t('category.edit')} className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50">
                  <Pencil size={15} />
                </button>
                <button type="button" onClick={() => setDeleteTarget(c)} aria-label={t('category.delete')} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-4 py-8">
          <form onSubmit={handleSubmit} className="max-h-full w-full max-w-lg overflow-y-auto rounded-xl bg-warm-white p-6 shadow-xl">
            <h2 className="mb-4 font-semibold text-brand-800">
              {editing === 'new' ? t('category.addCategory') : t('category.editCategory')}
            </h2>

            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="cat-nameEn" className="mb-1 block text-xs font-medium text-gray-600">{t('category.nameEn')}</label>
                  <input id="cat-nameEn" required value={form.nameEn} onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label htmlFor="cat-nameTe" className="mb-1 block text-xs font-medium text-gray-600">{t('category.nameTe')}</label>
                  <input id="cat-nameTe" value={form.nameTe} onChange={(e) => setForm((f) => ({ ...f, nameTe: e.target.value }))} className="lang-te w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="cat-descEn" className="mb-1 block text-xs font-medium text-gray-600">{t('category.descriptionEn')}</label>
                  <textarea id="cat-descEn" rows={2} value={form.descriptionEn} onChange={(e) => setForm((f) => ({ ...f, descriptionEn: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label htmlFor="cat-descTe" className="mb-1 block text-xs font-medium text-gray-600">{t('category.descriptionTe')}</label>
                  <textarea id="cat-descTe" rows={2} value={form.descriptionTe} onChange={(e) => setForm((f) => ({ ...f, descriptionTe: e.target.value }))} className="lang-te w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </div>
              </div>

              <div>
                <label htmlFor="cat-slug" className="mb-1 block text-xs font-medium text-gray-600">{t('category.slug')}</label>
                <input id="cat-slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder={editing === 'new' ? 'auto-generated-from-name' : ''} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                <p className="mt-1 text-xs text-gray-400">{t('category.slugHint')}</p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="cat-image" className="mb-1 block text-xs font-medium text-gray-600">{t('category.image')}</label>
                  <input id="cat-image" value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label htmlFor="cat-icon" className="mb-1 block text-xs font-medium text-gray-600">{t('category.icon')}</label>
                  <input id="cat-icon" value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="Home, Building2, LandPlot..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </div>
              </div>

              <div>
                <span className="mb-1 block text-xs font-medium text-gray-600">{t('category.transactionTypes')}</span>
                <div className="flex gap-3">
                  {TRANSACTION_TYPES.map((tt) => (
                    <label key={tt} className="flex items-center gap-1.5 text-sm text-gray-700">
                      <input type="checkbox" checked={form.transactionTypes.includes(tt)} onChange={() => toggleListValue('transactionTypes', tt)} className="h-4 w-4 rounded border-gray-300 text-brand-600" />
                      {tt}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <span className="mb-1 block text-xs font-medium text-gray-600">{t('category.areaUnits')}</span>
                <div className="flex flex-wrap gap-3">
                  {AREA_UNITS.map((unit) => (
                    <label key={unit} className="flex items-center gap-1.5 text-sm text-gray-700">
                      <input type="checkbox" checked={form.areaUnits.includes(unit)} onChange={() => toggleListValue('areaUnits', unit)} className="h-4 w-4 rounded border-gray-300 text-brand-600" />
                      {unit}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="cat-fields" className="mb-1 block text-xs font-medium text-gray-600">{t('category.propertyFields')}</label>
                <input id="cat-fields" value={form.propertyFields} onChange={(e) => setForm((f) => ({ ...f, propertyFields: e.target.value }))} placeholder="bedrooms, bathrooms, facing" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                <p className="mt-1 text-xs text-gray-400">{t('category.propertyFieldsHint')}</p>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-sm text-gray-700">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-brand-600" />
                  {t('category.active')}
                </label>
                <label className="flex items-center gap-1.5 text-sm text-gray-700">
                  <input type="checkbox" checked={form.visible} onChange={(e) => setForm((f) => ({ ...f, visible: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-brand-600" />
                  {t('category.visible')}
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">
                {t('category.cancel')}
              </button>
              <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-warm-white">
                {editing === 'new' ? t('category.create') : t('category.save')}
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-xl bg-warm-white p-6 shadow-xl">
            <h2 className="font-semibold text-brand-800">{t('modal.confirmDeleteTitle')}</h2>
            <p className="mt-2 text-sm text-gray-600">{t('modal.confirmDeleteBody')}</p>
            <div className="mt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">
                {t('category.cancel')}
              </button>
              <button type="button" onClick={handleDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-warm-white">
                {t('category.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
