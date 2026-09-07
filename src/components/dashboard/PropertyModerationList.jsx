import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, UserRound, ShieldCheck } from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import { userService } from '../../services/userService';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../store/toastStore';
import EmptyState from '../common/EmptyState';
import StatusBadge from './StatusBadge';
import CompletionBadge from './CompletionBadge';
import CompletionScoreCard from './CompletionScoreCard';

export default function PropertyModerationList({ statusFilter = 'pending', scoped = false, categorySlug, location, propertyId }) {
  const { t } = useTranslation(['common', 'dashboard', 'properties']);
  const { user } = useAuthStore();
  const [properties, setProperties] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [noteFor, setNoteFor] = useState(null);
  const [note, setNote] = useState('');
  const [expanded, setExpanded] = useState({});

  function load() {
    const params = { includeAllStatuses: true, pageSize: 100 };
    if (propertyId && propertyId.trim()) {
      params.propertyId = propertyId.trim();
    } else {
      params.status = statusFilter;
    }
    if (categorySlug) params.categorySlug = categorySlug;
    if (location && location.trim()) params.city = location.trim();
    if (scoped) {
      params.viewer = user;
      params.scopeMode = 'employee';
    }
    if (user?.role === 'admin' || user?.role === 'manager') {
      propertyService.getAdminProperties(params).then(setProperties);
    } else {
      propertyService.getProperties(params).then((r) => setProperties(r.items));
    }
    if (user?.role === 'admin') {
      userService.getUsers({ role: 'employee' }).then((list) => {
        setEmployees(list.filter((e) => e.status !== 'rejected' && e.status !== 'inactive'));
      });
    }
  }

  useEffect(load, [statusFilter, scoped, user, categorySlug, location, propertyId]);

  async function handleAction(id, action, actionNote) {
    await propertyService.moderate(id, action, actionNote);
    toast.success(t('toast.propertyUpdated', { ns: 'dashboard' }));
    setNoteFor(null);
    setNote('');
    load();
  }

  async function handleAssign(id, employeeId) {
    await propertyService.assignRecord(id, { assignedEmployeeId: employeeId || null, assignedBy: user.id });
    toast.success(t('toast.assignmentUpdated', { ns: 'dashboard' }));
    load();
  }

  async function handleDelete(id) {
    try {
      await propertyService.deleteProperty(id);
      toast.success(t('toast.propertyDeleted', { ns: 'dashboard', defaultValue: 'Property deleted successfully' }));
      load();
    } catch (err) {
      console.error('Failed to delete property:', err);
      toast.error(err.message || 'Failed to delete property');
    }
  }

  async function handleToggleFeatured(id, featured) {
    try {
      await propertyService.toggleFeatured(id, featured);
      toast.success(t('toast.propertyUpdated', { ns: 'dashboard' }));
      load();
    } catch (err) {
      console.error('Failed to toggle featured status:', err);
      toast.error(err.message || 'Failed to update featured status');
    }
  }

  async function handleToggleVerified(id, verified) {
    try {
      await propertyService.toggleVerified(id, verified);
      toast.success(t('toast.propertyUpdated', { ns: 'dashboard' }));
      load();
    } catch (err) {
      console.error('Failed to toggle verified status:', err);
      toast.error(err.message || 'Failed to update verified status');
    }
  }

  if (properties === null) return null;
  if (properties.length === 0) return <EmptyState titleKey="empty.noData" />;

  return (
    <div className="space-y-3">
      {properties.map((p) => {
        const assignedEmployee = employees.find((e) => e.id === p.assignedEmployeeId);
        return (
          <div key={p.id} className="rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link to={`/properties/${p.id}`} className="font-medium text-brand-800 hover:underline">{p.titleEn}</Link>
              <p className="text-xs font-semibold text-brand-700">{p.propertyCode}</p>
              <p className="text-sm text-gray-500">{p.locationEn} &middot; ₹{Number(p.price || 0).toLocaleString('en-IN')} &middot; {t('detail.views', { count: p.views || 0, ns: 'properties' })}</p>
              <p className="text-xs text-gray-400">Uploaded: {p.postedDate || p.createdAt ? new Date(p.postedDate || p.createdAt).toLocaleString() : '-'}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <StatusBadge status={p.status} />
                <CompletionBadge score={p.completionScore} />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <span className="inline-flex items-center gap-1 font-medium text-gray-700">
                  <UserRound size={13} className="text-brand-600" />
                  {p.seller?.name || p.contactName || '—'}
                  {p.seller?.mobile ? ` · ${p.seller.mobile}` : p.contactPhone ? ` · ${p.contactPhone}` : ''}
                  {p.seller?.role ? (
                    <span className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-gray-500">
                      <ShieldCheck size={10} /> {p.seller.role}
                    </span>
                  ) : null}
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-brand-700">
                  {p.assignedEmployeeId
                    ? t('assignment.assignedTo', { ns: 'dashboard', name: assignedEmployee?.name || p.assignedEmployeeId })
                    : t('assignment.unassigned', { ns: 'dashboard' })}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setExpanded((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                {expanded[p.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {expanded[p.id] ? t('scorecard.hide', { ns: 'common', defaultValue: 'Hide Scorecard' }) : t('scorecard.view', { ns: 'common', defaultValue: 'View Scorecard' })}
              </button>
              {user?.role === 'admin' && (
                <>
                  <select
                    aria-label={t('assignment.assignEmployee', { ns: 'dashboard' })}
                    value={p.assignedEmployeeId || ''}
                    onChange={(e) => handleAssign(p.id, e.target.value)}
                    className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
                  >
                    <option value="">{t('assignment.unassigned', { ns: 'dashboard' })}</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleToggleFeatured(p.id, !p.featured)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all ${
                      p.featured
                        ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p.featured ? '★ Featured' : '☆ Feature'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleVerified(p.id, !p.verified)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all ${
                      p.verified
                        ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p.verified ? '✓ Verified' : '○ Verify'}
                  </button>
                </>
              )}
               <a
                href={`/properties/${p.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 text-center"
              >
                View
              </a>
              {user?.role === 'admin' && (
                <Link
                  to={`/admin/properties/${p.id}/edit`}
                  className="rounded-lg border border-brand-300 bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-100 text-center"
                >
                  Edit
                </Link>
              )}
              {statusFilter !== 'active' && (
                <button type="button" onClick={() => handleAction(p.id, 'approve')} className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-warm-white">
                  {t('buttons.approve')}
                </button>
              )}
              <button type="button" onClick={() => setNoteFor({ id: p.id, action: 'requestChanges' })} className="rounded-lg border border-blue-300 px-3 py-1.5 text-sm font-semibold text-blue-700">
                {t('modal.requestedChanges', { ns: 'dashboard' })}
              </button>
              <button type="button" onClick={() => setNoteFor({ id: p.id, action: 'reject' })} className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-600">
                {t('buttons.reject')}
              </button>
              {user?.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(t('confirm.deleteProperty', { ns: 'dashboard', defaultValue: 'Are you sure you want to delete this property?' }))) {
                      handleDelete(p.id);
                    }
                  }}
                  className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
                >
                  {t('buttons.delete', { ns: 'common', defaultValue: 'Delete' })}
                </button>
              )}
            </div>
          </div>

          {expanded[p.id] && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <CompletionScoreCard
                score={p.completionScore}
                sections={p.completionSections}
                title={`${t('scorecard.title', { ns: 'common', defaultValue: 'Property Completion Score' })} – ${p.titleEn || p.propertyCode}`}
              />
            </div>
          )}
        </div>
        );
      })}

      {noteFor && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-xl bg-warm-white p-6 shadow-xl">
            <h2 className="font-semibold text-brand-800">
              {noteFor.action === 'reject' ? t('modal.rejectionReason', { ns: 'dashboard' }) : t('modal.requestedChanges', { ns: 'dashboard' })}
            </h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder={noteFor.action === 'reject' ? t('modal.rejectionReasonPlaceholder', { ns: 'dashboard' }) : t('modal.requestedChangesPlaceholder', { ns: 'dashboard' })}
              className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setNoteFor(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">
                {t('buttons.cancel')}
              </button>
              <button type="button" onClick={() => handleAction(noteFor.id, noteFor.action, note)} disabled={!note} className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-warm-white disabled:opacity-50">
                {t('modal.submit', { ns: 'dashboard' })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
