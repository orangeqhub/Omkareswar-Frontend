import { useEffect, useState } from 'react';
import { visitService } from '../../services/visitService';
import { propertyService } from '../../services/propertyService';
import { useAuthStore } from '../../store/authStore';
import EmptyState from '../../components/common/EmptyState';

export default function Visits() {
  const { user } = useAuthStore();
  const [visits, setVisits] = useState([]);
  const [titles, setTitles] = useState({});

  useEffect(() => {
    if (!user) return;
    visitService.getForSeller(user.id).then(async (list) => {
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
        <div key={v.id} className="flex flex-col gap-1 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-gray-800">{titles[v.propertyId] || v.propertyId}</p>
            {v.buyerName && (
              <p className="text-xs text-gray-600">
                {v.buyerName}
                <span className="ml-2 text-[10px] text-gray-400 font-medium italic bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 font-normal">
                  Protected
                </span>
              </p>
            )}
            <p className="text-sm text-gray-500">{new Date(v.scheduledFor).toLocaleString()}</p>
          </div>
          <span className="w-fit rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 capitalize">
            {v.status === 'scheduled' || v.status === 'requested' || v.status === 'new' ? 'Just Requested' : v.status}
          </span>
        </div>
      ))}
    </div>
  );
}
