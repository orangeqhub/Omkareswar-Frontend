import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { enquiryService } from '../../services/enquiryService';
import { propertyService } from '../../services/propertyService';
import { useAuthStore } from '../../store/authStore';
import EmptyState from '../../components/common/EmptyState';

export default function Leads() {
  const { t } = useTranslation('common');
  const { user } = useAuthStore();
  const [leads, setLeads] = useState([]);
  const [titles, setTitles] = useState({});

  useEffect(() => {
    if (!user) return;
    enquiryService.getAllEnquiries(user, 'mediator').then(async (list) => {
      setLeads(list);
      const map = {};
      for (const e of list) {
        const p = await propertyService.getPropertyById(e.propertyId);
        if (p) map[e.propertyId] = p.titleEn;
      }
      setTitles(map);
    });
  }, [user]);

  if (leads.length === 0) return <EmptyState titleKey="empty.noData" />;

  return (
    <div className="space-y-3">
      {leads.map((e) => (
        <div key={e.id} className="rounded-xl border border-gray-200 p-4">
          <p className="font-medium text-gray-800">
            {e.buyerName}
            <span className="ml-2 text-[10px] text-gray-400 font-medium italic bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 font-normal">
              Protected
            </span>
          </p>
          <p className="text-sm text-gray-500">{titles[e.propertyId] || e.propertyId}</p>
          <p className="mt-1 text-sm text-gray-600">{e.message}</p>
          <span className="mt-2 inline-block rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">{t(`status.${e.status}`, e.status)}</span>
        </div>
      ))}
    </div>
  );
}
