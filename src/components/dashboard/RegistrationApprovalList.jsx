import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { registrationService } from '../../services/registrationService';
import { userService } from '../../services/userService';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../store/toastStore';
import EmptyState from '../common/EmptyState';

export default function RegistrationApprovalList({ scoped = false }) {
  const { t } = useTranslation(['common', 'dashboard']);
  const { user } = useAuthStore();
  const [pending, setPending] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [reasonFor, setReasonFor] = useState(null);
  const [reason, setReason] = useState('');

  function load() {
    registrationService.listPending(scoped ? user : undefined).then(setPending);
    if (user?.role === 'admin') {
      userService.getUsers({ role: 'employee' }).then((list) => {
        setEmployees(list.filter((e) => e.status !== 'rejected' && e.status !== 'inactive'));
      });
    }
  }

  useEffect(load, [scoped, user]);

  async function handleApprove(id) {
    const updated = await registrationService.approve(id);
    toast.success(t('toast.registrationApproved', { ns: 'dashboard', memberId: updated.memberId }));
    load();
  }

  async function handleReject() {
    await registrationService.reject(reasonFor, reason);
    toast.success(t('toast.registrationRejected', { ns: 'dashboard' }));
    setReasonFor(null);
    setReason('');
    load();
  }

  async function handleAssign(userId, employeeId) {
    await registrationService.assignEmployee(userId, employeeId || null, user.id);
    toast.success(t('toast.assignmentUpdated', { ns: 'dashboard' }));
    load();
  }

  if (pending === null) return null;
  if (pending.length === 0) return <EmptyState titleKey="empty.noData" />;

  return (
    <div className="space-y-3">
      {pending.map((u) => {
        const assignedEmployee = employees.find((e) => e.id === u.assignedEmployeeId);
        return (
          <div key={u.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-gray-800">{u.name} <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-600">{u.role}</span></p>
              <p className="text-sm text-gray-500">{u.mobile} &middot; {u.email}</p>
              <p className="text-sm text-gray-500">{u.city}, {u.district}</p>
              <p className="mt-1 text-xs font-medium text-brand-700">
                {u.assignedEmployeeId
                  ? t('assignment.assignedTo', { ns: 'dashboard', name: assignedEmployee?.name || u.assignedEmployeeId })
                  : t('assignment.unassigned', { ns: 'dashboard' })}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {user?.role === 'admin' && (
                <select
                  aria-label={t('assignment.assignEmployee', { ns: 'dashboard' })}
                  value={u.assignedEmployeeId || ''}
                  onChange={(e) => handleAssign(u.id, e.target.value)}
                  className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
                >
                  <option value="">{t('assignment.unassigned', { ns: 'dashboard' })}</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              )}
              <button type="button" onClick={() => handleApprove(u.id)} className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-warm-white">
                {t('buttons.approve')}
              </button>
              <button type="button" onClick={() => setReasonFor(u.id)} className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-600">
                {t('buttons.reject')}
              </button>
            </div>
          </div>
        );
      })}

      {reasonFor && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-xl bg-warm-white p-6 shadow-xl">
            <h2 className="font-semibold text-brand-800">{t('modal.rejectionReason', { ns: 'dashboard' })}</h2>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder={t('modal.rejectionReasonPlaceholder', { ns: 'dashboard' })}
            />
            <div className="mt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setReasonFor(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">
                {t('buttons.cancel')}
              </button>
              <button type="button" onClick={handleReject} disabled={!reason} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-warm-white disabled:opacity-50">
                {t('buttons.reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
