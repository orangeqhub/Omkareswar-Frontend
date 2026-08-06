import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { enquiryService } from '../../services/enquiryService';
import { useAuthStore } from '../../store/authStore';
import EmptyState from '../../components/common/EmptyState';

export default function FollowUps() {
  const { t } = useTranslation('common');
  const { user } = useAuthStore();
  const [followUps, setFollowUps] = useState([]);

  useEffect(() => {
    if (!user) return;
    enquiryService.getAllEnquiries(user, 'mediator').then((list) => setFollowUps(list.filter((e) => e.status !== 'closed')));
  }, [user]);

  if (followUps.length === 0) return <EmptyState titleKey="empty.noData" />;

  return (
    <div className="space-y-3">
      {followUps.map((e) => (
        <div key={e.id} className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
          <div>
            <p className="font-medium text-gray-800">
              {e.buyerName}
              <span className="ml-2 text-[10px] text-gray-400 font-medium italic bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 font-normal">
                Protected
              </span>
            </p>
            <p className="text-sm text-gray-500">{e.message}</p>
          </div>
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">{t(`status.${e.status}`, e.status)}</span>
        </div>
      ))}
    </div>
  );
}
