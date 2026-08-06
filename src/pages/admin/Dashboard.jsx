import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { UserPlus, Building2, Users, LayoutList, IndianRupee, FileBarChart, CalendarCheck, Bell, Inbox } from 'lucide-react';
import { registrationService } from '../../services/registrationService';
import { propertyService } from '../../services/propertyService';
import { userService } from '../../services/userService';
import { visitService } from '../../services/visitService';
import { enquiryService } from '../../services/enquiryService';
import { notificationService } from '../../services/notificationService';
import { useAuthStore } from '../../store/authStore';
import { CATEGORIES } from '../../config/categories';
import StatCard from '../../components/dashboard/StatCard';

function formatCompactInr(value) {
  const num = Number(value || 0);
  if (isNaN(num) || num === 0) return '₹0';
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(num));
}

export default function Dashboard() {
  const { t } = useTranslation(['dashboard', 'common']);
  const { user } = useAuthStore();
  const [counts, setCounts] = useState({
    pendingRegistrations: 0,
    pendingProperties: 0,
    totalUsers: 0,
    totalProperties: 0,
    totalRevenue: 0,
    totalRevenueFull: '',
    totalVisits: 0,
    totalEnquiries: 0,
    totalNotifications: 0,
    reportCategories: 0,
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    registrationService.listPending().then((list) => setCounts((c) => ({ ...c, pendingRegistrations: list.length })));
    propertyService.getProperties({ status: 'pending', includeAllStatuses: true, pageSize: 1000 }).then((r) =>
      setCounts((c) => ({ ...c, pendingProperties: r.total }))
    );
    userService.getUsers().then((list) => setCounts((c) => ({ ...c, totalUsers: list.length })));
    
    // Fetch Active Listings Value (sum of prices of active/approved properties only)
    propertyService.getActiveListingsValue().then((res) => {
      setCounts((c) => ({
        ...c,
        totalRevenue: res.activeListingsValue,
        totalRevenueFull: res.formattedFull,
      }));
    });

    propertyService.getProperties({ includeAllStatuses: true, pageSize: 1000 }).then((r) => {
      setCounts((c) => ({ ...c, totalProperties: r.total }));
      const tally = {};
      for (const p of r.items) tally[p.categorySlug] = (tally[p.categorySlug] || 0) + 1;
      setChartData(CATEGORIES.map((cat) => ({ name: cat.nameEn, count: tally[cat.slug] || 0 })));
      setCounts((c) => ({ ...c, reportCategories: CATEGORIES.length }));
    });
    visitService.getAllVisits().then((list) => setCounts((c) => ({ ...c, totalVisits: list.length })));
    enquiryService.getAllEnquiries().then((list) => setCounts((c) => ({ ...c, totalEnquiries: list.length })));
    if (user) {
      notificationService.getForUser({ role: user.role, userId: user.id }).then((list) =>
        setCounts((c) => ({ ...c, totalNotifications: list.length }))
      );
    }
  }, [user]);

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-800">{t('greeting', { name: user?.name })}</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard icon={UserPlus} label={t('admin.pendingRegistrations')} value={counts.pendingRegistrations} accent="amber" />
        <StatCard icon={LayoutList} label={t('admin.pendingProperties')} value={counts.pendingProperties} accent="amber" />
        <StatCard icon={Users} label={t('admin.totalUsers')} value={counts.totalUsers} accent="blue" />
        <StatCard icon={Building2} label={t('admin.totalProperties')} value={counts.totalProperties} accent="green" />
        <StatCard
          icon={IndianRupee}
          label={t('admin.totalRevenue')}
          value={formatCompactInr(counts.totalRevenue)}
          tooltip={counts.totalRevenueFull ? `Active Listings Value: ${counts.totalRevenueFull}` : undefined}
          accent="orange"
        />
        <StatCard icon={FileBarChart} label={t('admin.reportCategories')} value={counts.reportCategories} accent="purple" />
        <StatCard icon={CalendarCheck} label={t('admin.totalVisits')} value={counts.totalVisits} accent="cyan" />
        <StatCard icon={Inbox} label={t('admin.totalEnquiries')} value={counts.totalEnquiries} accent="indigo" />
        <StatCard icon={Bell} label={t('admin.totalNotifications')} value={counts.totalNotifications} accent="red" />
      </div>

      <div className="mt-8 rounded-xl border border-gray-200/70 bg-warm-white/80 p-4 shadow-sm backdrop-blur">
        <h2 className="mb-4 font-semibold text-brand-800">{t('admin.propertiesByCategory')}</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: -20 }}>
              <defs>
                <linearGradient id="adminDashboardBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#90A955" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#556936" stopOpacity={0.85} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={70} />
              <YAxis allowDecimals={false} />
              <Tooltip cursor={{ fill: 'rgba(144,169,85,0.08)' }} />
              <Bar dataKey="count" fill="url(#adminDashboardBarGradient)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
