import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { getLocalizedField } from '../../utils/localize';
import StatusBadge from '../../components/dashboard/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { toast } from '../../store/toastStore';

export default function MyProperties({ basePath = '/seller/properties' }) {
  const { t } = useTranslation('common');
  const { user } = useAuthStore();
  const language = useLanguageStore((s) => s.language);
  const [properties, setProperties] = useState([]);

  function load() {
    if (user) propertyService.getBySeller(user.id).then(setProperties);
  }

  useEffect(load, [user]);

  async function handleDelete(id) {
    await propertyService.deleteProperty(id);
    toast.success('Property removed.');
    load();
  }

  if (properties.length === 0) {
    return <EmptyState titleKey="empty.noData" />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-100 text-sm">
        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Views</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {properties.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-3 font-medium text-gray-800">{getLocalizedField(p, 'title', language)}</td>
              <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
              <td className="px-4 py-3">₹{Number(p.price || 0).toLocaleString('en-IN')}</td>
              <td className="px-4 py-3">{p.views || 0}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Link to={`/properties/${p.id}`} aria-label="View" className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50"><Eye size={15} /></Link>
                  <Link to={`${basePath}/${p.id}/edit`} aria-label="Edit" className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50"><Pencil size={15} /></Link>
                  <button type="button" onClick={() => handleDelete(p.id)} aria-label={t('buttons.delete')} className="rounded-lg border border-gray-200 p-1.5 text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
