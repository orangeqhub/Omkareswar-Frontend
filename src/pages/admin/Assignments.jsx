import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, Search, RefreshCw, CheckCircle, ShieldAlert, Users, CalendarCheck, Inbox, Building2, PhoneCall } from 'lucide-react';
import { assignmentService } from '../../services/assignmentService';
import { userService } from '../../services/userService';
import { propertyService } from '../../services/propertyService';
import { enquiryService } from '../../services/enquiryService';
import { visitService } from '../../services/visitService';
import { followUpService } from '../../services/followUpService';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../store/toastStore';
import EmptyState from '../../components/common/EmptyState';

const TABS = [
  { id: 'enquiry', labelKey: 'nav.enquiries', icon: Inbox },
  { id: 'property', labelKey: 'nav.properties', icon: Building2 },
  { id: 'visit', labelKey: 'nav.visits', icon: CalendarCheck },
  { id: 'followUp', labelKey: 'nav.followUps', icon: PhoneCall },
  { id: 'user', labelKey: 'nav.users', icon: Users }
];

export default function Assignments() {
  const { t } = useTranslation(['dashboard', 'common']);
  const { user: admin } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState('enquiry');
  const [employees, setEmployees] = useState([]);
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filters & Selection
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Assign Target
  const [assignTarget, setAssignTarget] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [reason, setReason] = useState('');
  const [bulkAssigning, setBulkAssigning] = useState(false);

  useEffect(() => {
    userService.getUsers({ role: 'employee' }).then((list) => {
      setEmployees(list.filter((e) => e.status !== 'rejected' && e.status !== 'inactive'));
    });
  }, []);

  async function loadData() {
    setLoading(true);
    setDataList([]);
    setSelectedIds([]);
    try {
      if (activeTab === 'enquiry') {
        const list = await enquiryService.getAllEnquiries();
        setDataList(list || []);
      } else if (activeTab === 'property') {
        const res = await propertyService.getProperties({ includeAllStatuses: true, pageSize: 1000 });
        setDataList(res.items || []);
      } else if (activeTab === 'visit') {
        const list = await visitService.getAllVisits();
        setDataList(list || []);
      } else if (activeTab === 'followUp') {
        const res = await followUpService.listForAdmin({ pageSize: 1000 });
        setDataList(res.items || []);
      } else if (activeTab === 'user') {
        // Load only Buyers/Sellers/Mediators for assignation
        const buyers = await userService.getUsers({ role: 'buyer' });
        const sellers = await userService.getUsers({ role: 'seller' });
        const mediators = await userService.getUsers({ role: 'mediator' });
        setDataList([...buyers, ...sellers, ...mediators]);
      }
    } catch (err) {
      toast.error('Failed to load assignments list.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const filteredData = dataList.filter((item) => {
    // 1. Search filter
    const nameMatch = (item.name || item.buyerName || item.titleEn || item.reason || '').toLowerCase().includes(searchTerm.toLowerCase());
    const codeMatch = (item.enquiryCode || item.propertyCode || item.visitCode || item.memberId || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (searchTerm && !nameMatch && !codeMatch) return false;

    // 2. Employee filter
    if (employeeFilter && item.assignedEmployeeId !== employeeFilter) return false;

    // 3. Unassigned filter
    if (unassignedOnly && item.assignedEmployeeId) return false;

    return true;
  });

  const employeeMap = employees.reduce((acc, emp) => {
    acc[emp.id] = emp.name;
    return acc;
  }, {});

  function handleSelectAll(e) {
    if (e.target.checked) {
      setSelectedIds(filteredData.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  }

  function handleSelectItem(id) {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  async function executeAssignment(e) {
    e.preventDefault();
    if (!selectedEmployee) {
      toast.error('Please select an employee.');
      return;
    }
    setBulkAssigning(true);
    try {
      const targets = assignTarget === 'bulk' ? selectedIds : [assignTarget.id];
      await Promise.all(
        targets.map((id) =>
          assignmentService.assign(admin, activeTab, id, selectedEmployee, {
            reason: reason || undefined,
            assignmentNote: reason || undefined
          })
        )
      );
      toast.success('Assignment updated successfully!');
      setAssignTarget(null);
      setSelectedEmployee('');
      setReason('');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Assignment failed.');
    } finally {
      setBulkAssigning(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-brand-800 flex items-center gap-2">
          <Briefcase className="text-brand-600" />
          Assignment & Reassignment Manager
        </h1>
        <button
          onClick={loadData}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 bg-white"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors pb-3 -mb-[2px] ${
                isActive
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-gray-500 hover:text-brand-600 hover:border-gray-300'
              }`}
            >
              <Icon size={16} />
              {t(tab.labelKey, { ns: 'common' })}
            </button>
          );
        })}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-end gap-3 bg-white p-4 rounded-xl border">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1 block text-xs font-medium text-gray-600">Search Records</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, code or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Filter by Employee</label>
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none"
          >
            <option value="">All Employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 pb-2.5 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={unassignedOnly}
            onChange={(e) => setUnassignedOnly(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-brand-600"
          />
          Unassigned Only
        </label>
      </div>

      {/* Bulk Assignment Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-brand-50 border border-brand-200 px-4 py-3 rounded-xl">
          <span className="text-sm font-semibold text-brand-800">
            {selectedIds.length} item(s) selected
          </span>
          <button
            onClick={() => setAssignTarget('bulk')}
            className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700"
          >
            Assign Selected
          </button>
        </div>
      )}

      {/* Main Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-xl border">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
        </div>
      ) : filteredData.length === 0 ? (
        <EmptyState titleKey="empty.noData" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-100 text-sm text-left">
            <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600"
                  />
                </th>
                <th className="px-4 py-3">Code / ID</th>
                <th className="px-4 py-3">Description / Title</th>
                <th className="px-4 py-3">Type / Role</th>
                <th className="px-4 py-3">Assigned Employee</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600"
                    />
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-brand-700">
                    {item.enquiryCode || item.propertyCode || item.visitCode || item.memberId || 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {item.buyerName || item.name || item.titleEn || item.reason || 'Untitled'}
                      </p>
                      {item.mobile && <p className="text-xs text-gray-400">{item.mobile}</p>}
                      {item.price && <p className="text-xs text-brand-700">₹{new Intl.NumberFormat('en-IN').format(item.price)}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize">
                    <span className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 font-medium">
                      {item.role || activeTab}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {item.assignedEmployeeId ? (
                      <span className="font-medium text-gray-700">
                        {employeeMap[item.assignedEmployeeId] || item.assignedEmployeeId}
                      </span>
                    ) : (
                      <span className="inline-block rounded-full bg-amber-50 px-2.5 py-0.5 text-xs text-amber-700 font-medium">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setAssignTarget(item)}
                      className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                    >
                      {item.assignedEmployeeId ? 'Reassign' : 'Assign'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assignment Dialog Modal */}
      {assignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={executeAssignment} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-semibold text-brand-800">
              {assignTarget === 'bulk'
                ? `Assign ${selectedIds.length} Selected Records`
                : `Assign ${assignTarget.buyerName || assignTarget.name || assignTarget.titleEn || 'Record'}`}
            </h3>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Select Employee</label>
              <select
                required
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none"
              >
                <option value="">-- Choose Employee --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.memberId})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Reason / Notes (Optional)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="e.g. Employee unavailable, customer requested follow-up..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <button
                type="button"
                onClick={() => setAssignTarget(null)}
                className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={bulkAssigning}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {bulkAssigning ? 'Saving...' : 'Confirm Assignment'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
