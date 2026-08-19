import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight, User, Phone } from 'lucide-react';
import { followUpService, isOverdue } from '../../services/followUpService';
import { enquiryService } from '../../services/enquiryService';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../store/toastStore';
import EmptyState from '../../components/common/EmptyState';
import CallNoteTimeline from '../../components/employee/CallNoteTimeline';

const TABS = ['upcoming', 'following', 'completed', 'cancelled', 'callNotes'];

const ENQ_ASSIGNED = ['new'];
const ENQ_FOLLOWING = ['contacted', 'followup_required'];

function enqDisplayStatus(enq) {
  if (ENQ_ASSIGNED.includes(enq.status)) return 'assigned';
  if (ENQ_FOLLOWING.includes(enq.status)) return 'in_progress';
  if (enq.status === 'closed' && enq.completedAt) return 'completed';
  if (enq.status === 'closed') return 'cancelled';
  return enq.status;
}

function dueDateTime(f) {
  return new Date(`${f.dueDate.slice(0, 10)}T${f.dueTime || '00:00'}:00`);
}

function StatusBadges({ status }) {
  const statusMap = {
    in_progress: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Following' },
    completed: { bg: 'bg-green-50', text: 'text-green-700', label: 'Completed' },
    cancelled: { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelled' },
  };
  const s = statusMap[status];
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">Assigned</span>
      {s && (
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${s.bg} ${s.text}`}>
          {s.label}
        </span>
      )}
    </div>
  );
}

function EnqStatusBadges({ display }) {
  const statusMap = {
    in_progress: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Following' },
    completed: { bg: 'bg-green-50', text: 'text-green-700', label: 'Completed' },
    cancelled: { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelled' },
  };
  const s = statusMap[display];
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">Assigned</span>
      {s && (
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${s.bg} ${s.text}`}>
          {s.label}
        </span>
      )}
    </div>
  );
}

export default function FollowUps() {
  const { t } = useTranslation('dashboard');
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab');
  const [tab, setTab] = useState(TABS.includes(initialTab) ? initialTab : 'upcoming');
  const [followUps, setFollowUps] = useState(null);
  const [enquiries, setEnquiries] = useState(null);
  const [expandedBuyers, setExpandedBuyers] = useState({});

  function load() {
    if (!user) return;
    followUpService.getAssignedFollowUps(user).then(setFollowUps).catch(() => {});
    enquiryService.getAssignedEnquiries().then(setEnquiries).catch(() => {});
  }

  useEffect(load, [user]);

  async function handleFollowUpAction(action, ...args) {
    try {
      await action(user, ...args);
      toast.success(t('toast.assignmentUpdated'));
      load();
    } catch (err) {
      toast.error(err.message || 'Action failed');
    }
  }

  async function handleEnqAction(action, ...args) {
    try {
      await action(...args);
      toast.success(t('toast.assignmentUpdated'));
      load();
    } catch (err) {
      toast.error(err.message || 'Action failed');
    }
  }

  const followUpItems = useMemo(() => {
    if (!followUps) return [];
    let items;
    if (tab === 'upcoming') {
      items = followUps.filter((f) => f.status === 'assigned');
    } else if (tab === 'following') {
      items = followUps.filter((f) => f.status === 'in_progress');
    } else if (tab === 'completed') {
      items = followUps.filter((f) => f.status === 'completed');
    } else if (tab === 'cancelled') {
      items = followUps.filter((f) => f.status === 'cancelled');
    } else {
      items = [];
    }
    return [...items].sort((a, b) => dueDateTime(a) - dueDateTime(b));
  }, [followUps, tab]);

  const enqItems = useMemo(() => {
    if (!enquiries) return [];
    if (tab === 'upcoming') return enquiries.filter((e) => ENQ_ASSIGNED.includes(e.status));
    if (tab === 'following') return enquiries.filter((e) => ENQ_FOLLOWING.includes(e.status));
    if (tab === 'completed') return enquiries.filter((e) => e.status === 'closed' && e.completedAt);
    if (tab === 'cancelled') return enquiries.filter((e) => e.status === 'closed' && !e.completedAt);
    return [];
  }, [enquiries, tab]);

  const buyerGroups = useMemo(() => {
    if (!enquiries) return [];
    const map = new Map();
    for (const e of enquiries) {
      const key = e.buyerName || 'Unknown';
      if (!map.has(key)) {
        map.set(key, { name: key, phone: e.buyerPhone, enquiries: [] });
      }
      map.get(key).enquiries.push(e);
    }
    return [...map.values()];
  }, [enquiries]);

  function toggleBuyer(name) {
    setExpandedBuyers((prev) => ({ ...prev, [name]: !prev[name] }));
  }

  if (followUps === null) return null;

  const hasItems = tab === 'callNotes' ? true : (followUpItems.length + enqItems.length > 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((tabKey) => (
          <button
            key={tabKey}
            type="button"
            onClick={() => setTab(tabKey)}
            className={`rounded-full border px-3 py-1.5 text-sm ${tab === tabKey ? 'border-brand-600 bg-brand-600 text-warm-white' : 'border-gray-300 text-gray-600'}`}
          >
            {t(`followUpTabs.${tabKey}`)}
          </button>
        ))}
      </div>

      {tab === 'callNotes' ? (
        <CallNotesTab buyerGroups={buyerGroups} expandedBuyers={expandedBuyers} toggleBuyer={toggleBuyer} />
      ) : (
        <>
          {!hasItems ? (
            <EmptyState titleKey="empty.noData" />
          ) : (
            <div className="space-y-3">
              {followUpItems.map((f) => (
                <div key={`fu-${f.id}`} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-800">{f.reason}</p>
                      <p className="text-xs text-gray-400">
                        Follow-up &middot; {f.dueDate.slice(0, 10)} {f.dueTime}
                      </p>
                      {f.nextAction && <p className="mt-1 text-xs text-gray-500">{f.nextAction}</p>}
                    </div>
                    <StatusBadges status={f.status} />
                  </div>

                  {isOverdue(f) && <span className="mt-2 inline-block rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">{t('filters.overdue')}</span>}

                  {f.status === 'assigned' && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => handleFollowUpAction(followUpService.start, f.id)} className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100">Mark Following</button>
                      <button type="button" onClick={() => handleFollowUpAction(followUpService.cancel, f.id, '')} className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100">Mark Cancelled</button>
                    </div>
                  )}

                  {f.completionNote && <p className="mt-2 text-xs text-gray-500">{f.completionNote}</p>}
                </div>
              ))}

              {enqItems.map((enq) => {
                const display = enqDisplayStatus(enq);
                return (
                  <div key={`enq-${enq.id}`} className="rounded-xl border border-gray-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-800">{enq.buyerName}</p>
                        <p className="text-xs text-gray-400">
                          Enquiry &middot; {enq.enquiryCode || enq.id.slice(0, 8)}
                          {enq.buyerPhone && ` · ${enq.buyerPhone}`}
                        </p>
                        {enq.message && <p className="mt-1 text-xs text-gray-500">{enq.message.slice(0, 80)}{enq.message.length > 80 ? '...' : ''}</p>}
                      </div>
                      <EnqStatusBadges display={display} />
                    </div>

                    {display === 'assigned' && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" onClick={() => handleEnqAction(enquiryService.markStatus, enq.id, 'contacted')} className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100">Mark Following</button>
                        <button type="button" onClick={() => handleEnqAction(enquiryService.markStatus, enq.id, 'closed')} className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100">Mark Cancelled</button>
                      </div>
                    )}

                    {display === 'in_progress' && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" onClick={() => handleEnqAction(enquiryService.markComplete, user, enq.id)} className="rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100">Complete</button>
                        <button type="button" onClick={() => handleEnqAction(enquiryService.markStatus, enq.id, 'closed')} className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100">Cancel</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CallNotesTab({ buyerGroups, expandedBuyers, toggleBuyer }) {
  if (buyerGroups.length === 0) return <EmptyState titleKey="empty.noData" />;

  return (
    <div className="space-y-3">
      {buyerGroups.map((group) => {
        const isOpen = expandedBuyers[group.name];
        return (
          <div key={group.name} className="rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => toggleBuyer(group.name)}
              className="flex w-full items-center gap-3 p-4 text-left hover:bg-gray-50"
            >
              {isOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100">
                <User size={14} className="text-brand-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-800">{group.name}</p>
                {group.phone && (
                  <p className="flex items-center gap-1 text-xs text-gray-400">
                    <Phone size={11} /> {group.phone}
                  </p>
                )}
              </div>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                {group.enquiries.length} enquiry{group.enquiries.length !== 1 ? 's' : ''}
              </span>
            </button>

            {isOpen && (
              <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                {group.enquiries.map((enq) => (
                  <div key={enq.id} className="mb-3 rounded-lg border border-gray-100 p-3 last:mb-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">{enq.enquiryCode || enq.id.slice(0, 8)}</span>
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">{enq.status}</span>
                      {enq.message && <span className="text-xs text-gray-400">{enq.message.slice(0, 60)}{enq.message.length > 60 ? '...' : ''}</span>}
                    </div>
                    <CallNoteTimeline enquiryId={enq.id} />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
