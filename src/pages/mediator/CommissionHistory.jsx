import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { propertyService } from '../../services/propertyService';
import { useAuthStore } from '../../store/authStore';
import EmptyState from '../../components/common/EmptyState';

const COMMISSION_RATE = 2;

export default function CommissionHistory() {
  const { t } = useTranslation('dashboard');
  const { user } = useAuthStore();
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    if (!user) return;
    propertyService
      .getProperties({ includeAllStatuses: true, pageSize: 1000, viewer: user, scopeMode: 'mediator', status: 'sold' })
      .then((r) => setProperties(r.items));
  }, [user]);

  const rows = useMemo(
    () => properties.map((p) => ({ ...p, commission: Math.round((p.price || 0) * (COMMISSION_RATE / 100)) })),
    [properties]
  );

  const totalCommission = rows.reduce((sum, r) => sum + r.commission, 0);

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-brand-800">{t('commission.title')}</h1>
      <p className="mb-4 text-sm text-gray-500">{t('commission.note', { rate: COMMISSION_RATE })}</p>

      {rows.length === 0 ? (
        <EmptyState titleKey="commission.empty" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2.5">{t('commission.property')}</th>
                <th className="px-4 py-2.5">{t('commission.salePrice')}</th>
                <th className="px-4 py-2.5">{t('commission.rate')}</th>
                <th className="px-4 py-2.5">{t('commission.amount')}</th>
                <th className="px-4 py-2.5">{t('commission.soldOn')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2.5">{p.titleEn}</td>
                  <td className="px-4 py-2.5">₹{Number(p.price || 0).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-2.5">{COMMISSION_RATE}%</td>
                  <td className="px-4 py-2.5 font-semibold text-brand-700">₹{p.commission.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-2.5">{new Date(p.updatedDate || p.postedDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 bg-gray-50 font-semibold text-brand-800">
                <td className="px-4 py-2.5" colSpan={3}>{t('commission.amount')}</td>
                <td className="px-4 py-2.5">₹{totalCommission.toLocaleString('en-IN')}</td>
                <td className="px-4 py-2.5" />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
