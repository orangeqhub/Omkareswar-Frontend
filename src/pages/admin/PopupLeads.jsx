import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { landingLeadService } from '../../services/landingLeadService';
import EmptyState from '../../components/common/EmptyState';
import { toast } from '../../store/toastStore';

const PAGE_SIZE = 50;
const FETCH_BATCH = 200;

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'buyer', label: 'Buyer' },
  { value: 'seller', label: 'Seller' },
  { value: 'mediator', label: 'Mediator' },
];

const ROLE_LABELS = { buyer: 'Buyer', seller: 'Seller', mediator: 'Mediator' };

export default function PopupLeads() {
  const { t } = useTranslation(['dashboard', 'common']);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const collected = [];
      let current = 1;
      let res;
      do {
        res = await landingLeadService.getLeads({ page: current, pageSize: FETCH_BATCH });
        collected.push(...(res.items || []));
        current += 1;
      } while (res.items?.length && collected.length < (res.total || 0));
      setItems(collected);
      setTotal(res.total || 0);
    } catch (err) {
      toast.error(err.message || 'Failed to load popup page leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [category]);

  const filtered = useMemo(() => {
    if (category === 'all') return items;
    return items.filter((lead) => lead.role === category);
  }, [items, category]);

  const countFor = (value) => {
    if (value === 'all') return total;
    return items.filter((lead) => lead.role === value).length;
  };

  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-semibold text-brand-800">{t('admin.popupPage', { defaultValue: 'Popup Page' })}</h1>
          <p className="text-sm text-gray-500">Visitors who submitted the popup form ({total} total)</p>
        </div>
        <button
          type="button"
          onClick={() => load()}
          className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const active = category === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-brand-400 hover:text-brand-700'
              }`}
            >
              {cat.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  active ? 'bg-white/20 text-white' : 'bg-brand-50 text-brand-700'
                }`}
              >
                {countFor(cat.value)}
              </span>
            </button>
          );
        })}
      </div>

      {loading && items.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-gray-400">Loading submissions…</div>
      ) : pageItems.length === 0 ? (
        <EmptyState titleKey="empty.noData" />
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">City / Village</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 font-medium text-gray-800">{lead.name}</td>
                    <td className="px-4 py-3 text-gray-600">{lead.contact}</td>
                    <td className="px-4 py-3 text-gray-600">{lead.cityVillage || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-brand-700">
                        {ROLE_LABELS[lead.role] || lead.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(lead.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Page {page} of {totalPages} &middot; {filtered.length} submissions
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => p - 1)}
                  className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft size={15} /> Prev
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}