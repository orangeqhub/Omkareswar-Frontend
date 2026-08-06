import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { visitService } from '../../services/visitService';
import { assignmentService } from '../../services/assignmentService';
import { userService } from '../../services/userService';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../store/toastStore';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/dashboard/StatusBadge';
import AssignmentModal from '../../components/dashboard/AssignmentModal';

export default function Visits() {
  const { t } = useTranslation(['dashboard', 'common']);
  const { user } = useAuthStore();
  const [visits, setVisits] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const [modalRecord, setModalRecord] = useState(null);

  function load() {
    visitService.getAllVisits().then(setVisits);
    userService.getUsers({ role: 'employee' }).then((list) => {
      setEmployees(list.filter((e) => e.status !== 'rejected' && e.status !== 'inactive'));
    });
  }

  useEffect(load, []);

  const employeeName = (id) => employees.find((e) => e.id === id)?.name;

  const filtered = visits.filter((v) => {
    if (unassignedOnly) return !v.assignedEmployeeId;
    if (employeeFilter) return v.assignedEmployeeId === employeeFilter;
    return true;
  });

  async function handleAssign({ employeeId, note, dueAt }) {
    try {
      await assignmentService.assign(user, 'visit', modalRecord.id, employeeId, {
        assignmentNote: note || undefined,
        assignmentDueAt: dueAt || undefined,
      });
      toast.success(t(modalRecord.assignedEmployeeId ? 'toast.reassignmentSuccess' : 'toast.assignmentSuccess', { ns: 'dashboard' }));
      setModalRecord(null);
      load();
    } catch (err) {
      toast.error(t(err.message, { ns: 'dashboard' }));
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="visit-employee-filter" className="mb-1 block text-xs font-medium text-gray-600">
            {t('filters.employee', { ns: 'dashboard' })}
          </label>
          <select
            id="visit-employee-filter"
            value={employeeFilter}
            onChange={(e) => {
              setEmployeeFilter(e.target.value);
              setUnassignedOnly(false);
            }}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">{t('filters.all', { ns: 'dashboard' })}</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 pb-1.5 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={unassignedOnly}
            onChange={(e) => {
              setUnassignedOnly(e.target.checked);
              if (e.target.checked) setEmployeeFilter('');
            }}
          />
          {t('filters.unassignedOnly', { ns: 'dashboard' })}
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState titleKey="empty.noData" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">{t('table.buyer', { ns: 'dashboard' })}</th>
                <th className="px-4 py-3">{t('table.propertyId', { ns: 'dashboard' })}</th>
                <th className="px-4 py-3">{t('table.scheduledDate', { ns: 'dashboard' }) || 'Scheduled Date'}</th>
                <th className="px-4 py-3">{t('table.status', { ns: 'dashboard' })}</th>
                <th className="px-4 py-3">{t('table.assignedEmployee', { ns: 'dashboard' })}</th>
                <th className="px-4 py-3">{t('assignment.assignmentStatus', { ns: 'dashboard' })}</th>
                <th className="px-4 py-3">{t('assignment.assignedDate', { ns: 'dashboard' })}</th>
                <th className="px-4 py-3">{t('table.actions', { ns: 'dashboard' })}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((v) => (
                <tr key={v.id}>
                  <td className="px-4 py-3 font-medium text-gray-800">{v.buyerName || v.buyerMobile || v.buyerId || 'Buyer'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{v.propertyTitle || v.propertyId}</td>
                  <td className="px-4 py-3 font-semibold text-brand-700">{v.scheduledFor ? new Date(v.scheduledFor).toLocaleString() : '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                  <td className="px-4 py-3">
                    {v.assignedEmployeeId ? employeeName(v.assignedEmployeeId) || v.assignedEmployeeId : t('assignment.unassigned', { ns: 'dashboard' })}
                  </td>
                  <td className="px-4 py-3 capitalize">{v.assignmentStatus || 'unassigned'}</td>
                  <td className="px-4 py-3">{v.assignedAt ? new Date(v.assignedAt).toLocaleString() : '-'}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setModalRecord(v)}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                    >
                      {v.assignedEmployeeId ? t('assignment.reassignEmployee', { ns: 'dashboard' }) : t('assignment.assignEmployee', { ns: 'dashboard' })}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AssignmentModal
        open={Boolean(modalRecord)}
        onClose={() => setModalRecord(null)}
        employees={employees}
        record={modalRecord}
        isReassign={Boolean(modalRecord?.assignedEmployeeId)}
        onSubmit={handleAssign}
      />
    </div>
  );
}
