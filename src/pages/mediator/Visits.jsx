import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { visitService } from '../../services/visitService';
import { propertyService } from '../../services/propertyService';
import { useAuthStore } from '../../store/authStore';
import EmptyState from '../../components/common/EmptyState';

export default function Visits() {
  const { t } = useTranslation('common');
  const { user } = useAuthStore();
  const [visits, setVisits] = useState([]);
  const [titles, setTitles] = useState({});

  useEffect(() => {
    if (!user) return;
    visitService.getAllVisits(user, 'mediator').then(async (list) => {
      setVisits(list);
      const map = {};
      for (const v of list) {
        const p = await propertyService.getPropertyById(v.propertyId);
        if (p) map[v.propertyId] = p.titleEn;
      }
      setTitles(map);
    });
  }, [user]);

  if (visits.length === 0) return <EmptyState titleKey="empty.noData" />;

  return (
    <div className="space-y-3">
      {visits.map((v) => (
        <div key={v.id} className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
          <div>
            <p className="font-medium text-gray-800">{titles[v.propertyId] || v.propertyId}</p>
            <p className="text-sm text-gray-500">{new Date(v.scheduledFor).toLocaleString()}</p>
          </div>
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">{t(`status.${v.status}`, v.status)}</span>
        </div>
      ))}
    </div>
  );
}
