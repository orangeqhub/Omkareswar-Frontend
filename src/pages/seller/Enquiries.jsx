import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { enquiryService } from '../../services/enquiryService';
import { propertyService } from '../../services/propertyService';
import { useAuthStore } from '../../store/authStore';
import EmptyState from '../../components/common/EmptyState';

export default function Enquiries() {
  const { t } = useTranslation(['common', 'dashboard']);
  const { user } = useAuthStore();
  const [enquiries, setEnquiries] = useState([]);
  const [titles, setTitles] = useState({});

  useEffect(() => {
    if (!user) return;
    enquiryService.getForSeller(user.id).then(async (list) => {
      setEnquiries(list);
      const map = {};
      for (const e of list) {
        const p = await propertyService.getPropertyById(e.propertyId);
        if (p) map[e.propertyId] = p.titleEn;
      }
      setTitles(map);
    });
  }, [user]);

  if (enquiries.length === 0) return <EmptyState titleKey="empty.noData" />;

  return (
    <div className="space-y-3">
      {enquiries.map((e) => (
        <div key={e.id} className="flex flex-col gap-2 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-gray-800">{e.propertyId ? (titles[e.propertyId] || e.propertyId) : 'General Contact Enquiry'}</p>
            <p className="text-sm text-gray-500">
              {e.buyerName?.startsWith('enquiries.') ? t(e.buyerName) : (e.buyerName || e.fullName || 'Guest User')}
              {' · '}
              <span className="text-[11px] text-gray-400 font-medium italic bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                Protected
              </span>
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {e.message?.startsWith('enquiries.') ? t(e.message) : (e.message || 'Just Enquired')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${e.status === 'new' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
              {e.status === 'new' ? 'Just Enquired' : e.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
