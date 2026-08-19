import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { enquiryService } from '../../services/enquiryService';
import { useAuthStore } from '../../store/authStore';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { matchesSearch } from '../../utils/search';
import SearchBox from '../../components/common/SearchBox';
import EmptyState from '../../components/common/EmptyState';

function isOverdue(e) {
  return e.nextFollowUpAt && new Date(e.nextFollowUpAt) < new Date() && e.status !== 'closed';
}

export default function Enquiries() {
  const { t } = useTranslation('dashboard');
  const { user } = useAuthStore();
  const [records, setRecords] = useState(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    if (user) enquiryService.getAssignedEnquiries(user).then(setRecords);
  }, [user]);

  const filtered = useMemo(() => {
    if (!records) return [];
    return records.filter((e) => matchesSearch(e, debouncedSearch, ['id', 'buyerPhone', 'propertyId', 'buyerName']));
  }, [records, debouncedSearch]);

  if (records === null) return null;

  return (
    <div>
      <h1 className="mb-4 font-semibold text-brand-800">{t('nav.enquiries', { ns: 'common' })}</h1>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="w-full max-w-xs">
          <SearchBox value={search} onChange={setSearch} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState titleKey="empty.noData" />
      ) : (
        <div className="space-y-3">
          {filtered.map((e) => (
            <div key={e.id} className="rounded-xl border border-gray-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-800">{e.buyerName} &middot; {e.buyerPhone}</p>
                  <p className="text-sm text-gray-500">{e.message}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">{t(`enquiryStatus.${e.status}`)}</span>
                  {isOverdue(e) && <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">{t('filters.overdue')}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
