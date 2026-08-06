import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { Download, Building2, Users, TrendingUp, Star } from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import { userService } from '../../services/userService';
import { CATEGORIES } from '../../config/categories';
import { exportSingleSheetXlsx } from '../../utils/xlsxExport';
import { toast } from '../../store/toastStore';
import StatCard from '../../components/dashboard/StatCard';

const COLORS = ['#556936', '#90a955', '#748a42', '#3f5b25', '#b3c885'];
const ROLES = ['buyer', 'seller', 'mediator', 'employee'];

export default function Reports() {
  const { t } = useTranslation('dashboard');
  const [categoryData, setCategoryData] = useState([]);
  const [roleData, setRoleData] = useState([]);
  const [properties, setProperties] = useState([]);
  const [widgets, setWidgets] = useState({ totalProperties: 0, activeProperties: 0, featuredProperties: 0, totalUsers: 0 });

  useEffect(() => {
    propertyService.getProperties({ includeAllStatuses: true, pageSize: 1000 }).then((r) => {
      setProperties(r.items);
      const tally = {};
      for (const p of r.items) tally[p.categorySlug] = (tally[p.categorySlug] || 0) + 1;
      setCategoryData(CATEGORIES.map((c) => ({ name: c.nameEn, value: tally[c.slug] || 0 })));
      setWidgets((w) => ({
        ...w,
        totalProperties: r.total,
        activeProperties: r.items.filter((p) => p.status === 'active').length,
        featuredProperties: r.items.filter((p) => p.featured).length,
      }));
    });
    Promise.all(ROLES.map((role) => userService.getUsers({ role }))).then((results) => {
      setRoleData(ROLES.map((role, i) => ({ name: role, value: results[i].length })));
      setWidgets((w) => ({ ...w, totalUsers: results.reduce((sum, list) => sum + list.length, 0) }));
    });
  }, []);

  function handleExport() {
    if (properties.length === 0) {
      toast.info(t('toast.exportEmpty'));
      return;
    }
    exportSingleSheetXlsx(
      'properties-report.xlsx',
      t('export.properties'),
      properties,
      [
        { header: 'Property Code', value: 'propertyCode' },
        { header: 'Title', value: 'titleEn' },
        { header: 'Category', value: 'categorySlug' },
        { header: 'Status', value: 'status' },
        { header: 'Price', value: 'price' },
        { header: 'Views', value: 'views' },
        { header: 'City', value: 'city' },
      ]
    );
    toast.success(t('toast.exportSuccess'));
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button type="button" onClick={handleExport} className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-warm-white hover:bg-brand-700">
          <Download size={16} /> {t('export.exportToExcel')}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Building2} label={t('admin.totalProperties')} value={widgets.totalProperties} accent="green" />
        <StatCard icon={TrendingUp} label={t('status.active', { ns: 'common' })} value={widgets.activeProperties} accent="cyan" />
        <StatCard icon={Star} label={t('card.featured', { ns: 'properties' })} value={widgets.featuredProperties} accent="orange" />
        <StatCard icon={Users} label={t('admin.totalUsers')} value={widgets.totalUsers} accent="indigo" />
      </div>

      <div className="rounded-xl border border-gray-200/70 bg-warm-white/80 p-4 shadow-sm backdrop-blur">
        <h2 className="mb-4 font-semibold text-brand-800">{t('admin.propertiesByCategory')}</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} margin={{ left: -20 }}>
              <defs>
                <linearGradient id="reportsBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#90a955" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#556936" stopOpacity={0.85} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={70} />
              <YAxis allowDecimals={false} />
              <Tooltip cursor={{ fill: 'rgba(144,169,85,0.08)' }} />
              <Bar dataKey="value" fill="url(#reportsBarGradient)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200/70 bg-warm-white/80 p-4 shadow-sm backdrop-blur">
        <h2 className="mb-4 font-semibold text-brand-800">{t('admin.usersByRole')}</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={roleData} dataKey="value" nameKey="name" outerRadius={90} label>
                {roleData.map((entry, i) => <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200/70 bg-warm-white/80 p-4 shadow-sm backdrop-blur">
        <h2 className="mb-4 font-semibold text-brand-800">{t('admin.totalProperties')}</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-3 py-2">{t('table.title')}</th>
                <th className="px-3 py-2">{t('table.category')}</th>
                <th className="px-3 py-2">{t('table.status')}</th>
                <th className="px-3 py-2">{t('table.price')}</th>
                <th className="px-3 py-2">{t('table.views')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {properties.slice(0, 8).map((p) => (
                <tr key={p.id}>
                  <td className="px-3 py-2">{p.titleEn}</td>
                  <td className="px-3 py-2 capitalize">{p.categorySlug?.replace(/-/g, ' ')}</td>
                  <td className="px-3 py-2 capitalize">{p.status}</td>
                  <td className="px-3 py-2">₹{new Intl.NumberFormat('en-IN').format(p.price || 0)}</td>
                  <td className="px-3 py-2">{p.views || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
