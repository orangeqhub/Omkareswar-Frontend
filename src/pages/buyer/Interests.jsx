import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { enquiryService } from '../../services/enquiryService';
import { propertyService } from '../../services/propertyService';
import { useAuthStore } from '../../store/authStore';
import EmptyState from '../../components/common/EmptyState';

export default function Interests() {
  const { user } = useAuthStore();
  const [interests, setInterests] = useState([]);
  const [properties, setProperties] = useState({});

  useEffect(() => {
    if (!user) return;
    enquiryService.getForBuyer(user.mobile).then(async (list) => {
      setInterests(list);
      const map = {};
      for (const e of list) {
        const p = await propertyService.getPropertyById(e.propertyId);
        if (p) map[e.propertyId] = p;
      }
      setProperties(map);
    }).catch(() => {});
  }, [user]);

  if (interests.length === 0) return <EmptyState titleKey="empty.noData" />;

  return (
    <div className="space-y-3">
      {interests.map((e) => {
        const p = properties[e.propertyId];
        return (
          <div key={e.id} className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
            <div>
              {e.propertyId ? (
                <Link to={`/properties/${e.propertyId}`} className="font-medium text-brand-800 hover:underline">
                  {p?.titleEn || e.propertyId}
                </Link>
              ) : (
                <span className="font-medium text-gray-800">General Contact Enquiry</span>
              )}
              <p className="text-xs text-gray-600 mt-0.5">{e.message || 'Just Enquired'}</p>
              <p className="text-xs text-gray-400 mt-0.5">{e.createdAt ? new Date(e.createdAt).toLocaleDateString() : 'Recent'}</p>
            </div>
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold capitalize text-brand-700">
              {e.status === 'new' ? 'Just Enquired' : e.status}
            </span>
          </div>
        );
      })}
    </div>
  );
}
