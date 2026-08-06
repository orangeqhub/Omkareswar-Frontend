import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { enquiryService } from '../../services/enquiryService';
import { userService } from '../../services/userService';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../store/toastStore';
import { exportSingleSheetXlsx } from '../../utils/xlsxExport';
import EmptyState from '../../components/common/EmptyState';

export default function Enquiries() {
  const { t } = useTranslation(['dashboard', 'common']);
  const { user } = useAuthStore();
  const [enquiries, setEnquiries] = useState([]);
  const [mediators, setMediators] = useState([]);
  const [employees, setEmployees] = useState([]);
async function load() {
  try {
    const [
      enquiryList,
      mediatorList,
      employeeList,
    ] = await Promise.all([
      enquiryService.getAllEnquiries(),

      userService.getUsers({
        role: 'mediator',
      }),

      userService.getUsers({
        role: 'employee',
      }),
    ]);

    setMediators(
      Array.isArray(mediatorList)
        ? mediatorList.filter((m) => m.status !== 'rejected' && m.status !== 'inactive')
        : []
    );
    setEmployees(
      Array.isArray(employeeList)
        ? employeeList.filter((e) => e.status !== 'rejected' && e.status !== 'inactive')
        : []
    );

    setEnquiries(
      Array.isArray(enquiryList)
        ? enquiryList
        : []
    );
  } catch (error) {
    console.error(
      'Admin enquiries load failed:',
      error
    );

    setEnquiries([]);
    setMediators([]);
    setEmployees([]);

    toast.error(
      error.message ||
      'Unable to load enquiries'
    );
  }
}

  useEffect(() => {
    load();
  }, []);

  async function handleAssignMediator(id, mediatorId) {
    await enquiryService.assignRecord(id, { assignedMediatorId: mediatorId || null, assignedBy: user.id });
    toast.success(t('toast.assignmentUpdated', { ns: 'dashboard' }));
    load();
  }

  async function handleAssignEmployee(id, employeeId) {
    await enquiryService.assignRecord(id, { assignedEmployeeId: employeeId || null, assignedBy: user.id });
    toast.success(t('toast.assignmentUpdated', { ns: 'dashboard' }));
    load();
  }

  function handleExport() {
    if (enquiries.length === 0) {
      toast.info(t('toast.exportEmpty', { ns: 'dashboard' }));
      return;
    }
    exportSingleSheetXlsx(
      'enquiries-export.xlsx',
      t('export.enquiries', { ns: 'dashboard' }),
      enquiries,
      [
        { header: 'Buyer Name', value: 'buyerName' },
        { header: 'Buyer Phone', value: 'buyerPhone' },
        { header: 'Property ID', value: 'propertyId' },
        { header: 'Message', value: 'message' },
        { header: 'Channel', value: 'channel' },
        { header: 'Status', value: 'status' },
        { header: 'Assigned Mediator', value: 'assignedMediatorId' },
        { header: 'Created At', value: (row) => new Date(row.createdAt).toLocaleString() },
      ]
    );
    toast.success(t('toast.exportSuccess', { ns: 'dashboard' }));
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={handleExport} className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-warm-white">
          <Download size={16} /> {t('export.exportToExcel', { ns: 'dashboard' })}
        </button>
      </div>

      {enquiries.length === 0 ? (
        <EmptyState titleKey="empty.noData" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">{t('table.buyer', { ns: 'dashboard' })}</th>
                <th className="px-4 py-3">{t('table.phone', { ns: 'dashboard' })}</th>
                <th className="px-4 py-3">{t('table.message', { ns: 'dashboard' })}</th>
                <th className="px-4 py-3">{t('table.status', { ns: 'dashboard' })}</th>
                <th className="px-4 py-3">{t('table.assignedMediator', { ns: 'dashboard' })}</th>
                <th className="px-4 py-3">{t('table.assignedEmployee', { ns: 'dashboard' })}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {enquiries.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3">{e.buyerName}</td>
                  <td className="px-4 py-3">{e.buyerPhone}</td>
                  <td className="px-4 py-3">{e.message}</td>
                  <td className="px-4 py-3 capitalize">{e.status}</td>
                  <td className="px-4 py-3">
                    <select
                      aria-label={t('assignment.assignMediator', { ns: 'dashboard' })}
                      value={e.assignedMediatorId || ''}
                      onChange={(ev) => handleAssignMediator(e.id, ev.target.value)}
                      className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
                    >
                      <option value="">{t('assignment.unassigned', { ns: 'dashboard' })}</option>
                      {mediators.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      aria-label={t('assignment.assignEmployee', { ns: 'dashboard' })}
                      value={e.assignedEmployeeId || ''}
                      onChange={(ev) => handleAssignEmployee(e.id, ev.target.value)}
                      className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
                    >
                      <option value="">{t('assignment.unassigned', { ns: 'dashboard' })}</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
