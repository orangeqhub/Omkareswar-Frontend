import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, ShoppingBag, Building2, PhoneCall } from 'lucide-react';
import { enquiryService } from '../../services/enquiryService';
import { userService } from '../../services/userService';
import { propertyService } from '../../services/propertyService';
import { useAuthStore } from '../../store/authStore';
import StatCard from '../../components/dashboard/StatCard';

export default function MediatorDashboard() {
  const { t } = useTranslation(['dashboard', 'common']);
  const { user } = useAuthStore();
  const [counts, setCounts] = useState({ leads: 0, buyers: 0, sellers: 0, properties: 0 });

  useEffect(() => {
    if (!user) return;
    enquiryService.getAllEnquiries(user, 'mediator').then((list) => setCounts((c) => ({ ...c, leads: list.length })));
    userService.getUsers({ role: 'buyer' }, user).then((list) => setCounts((c) => ({ ...c, buyers: list.length })));
    userService.getUsers({ role: 'seller' }, user).then((list) => setCounts((c) => ({ ...c, sellers: list.length })));
    propertyService
      .getProperties({ includeAllStatuses: true, pageSize: 1000, viewer: user, scopeMode: 'mediator' })
      .then((r) => setCounts((c) => ({ ...c, properties: r.total })));
  }, [user]);

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-800">{t('greeting', { name: user?.name })}</h1>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={PhoneCall} label={t('mediator.assignedLeads')} value={counts.leads} accent="amber" />
        <StatCard icon={ShoppingBag} label={t('mediator.buyers')} value={counts.buyers} />
        <StatCard icon={Users} label={t('mediator.sellers')} value={counts.sellers} accent="blue" />
        <StatCard icon={Building2} label={t('mediator.properties')} value={counts.properties} />
      </div>
    </div>
  );
}
