import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, Search, Calendar, User, Clock, Info, ShieldCheck } from 'lucide-react';
import { auditLogService } from '../../services/auditLogService';
import { userService } from '../../services/userService';
import { toast } from '../../store/toastStore';
import EmptyState from '../../components/common/EmptyState';
import { formatActivityDetails, displayEntityValue, useEntityMaps } from '../../utils/entityIdLabels';

const ACTIONS = [
  { id: '', label: 'All Actions' },
  { id: 'user.assignEmployee', label: 'Client Assignment' },
  { id: 'enquiry.assignEmployee', label: 'Enquiry Assignment' },
  { id: 'property.assign', label: 'Property Assignment' },
  { id: 'visit.assign', label: 'Visit Assignment' },
  { id: 'followup.assign', label: 'Follow-up Assignment' },
  { id: 'followUp.create', label: 'Follow-up Created' },
  { id: 'followUp.statusChange', label: 'Follow-up Completed/Modified' }
];

export default function Activities() {
  const { t } = useTranslation(['dashboard', 'common']);
  const maps = useEntityMaps();
  const [logs, setLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [actorId, setActorId] = useState('');
  const [action, setAction] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    userService.getUsers({ role: 'employee' }).then((list) => {
      setEmployees(list.filter((e) => e.status !== 'rejected' && e.status !== 'inactive'));
    });
  }, []);

  async function loadLogs() {
    setLoading(true);
    try {
      const params = {};
      if (actorId) params.actorId = actorId;
      if (action) params.action = action;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const data = await auditLogService.getLogs(params);
      setLogs(data || []);
    } catch (err) {
      toast.error('Failed to fetch employee activities.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, [actorId, action, startDate, endDate]);

  const employeeMap = employees.reduce((acc, emp) => {
    acc[emp.id] = emp.name;
    return acc;
  }, {});

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const actorName = (employeeMap[log.actorId] || log.actorRole || 'System').toLowerCase();
    const detailsStr = JSON.stringify(log.details || {}).toLowerCase();
    const query = searchQuery.toLowerCase();
    return actorName.includes(query) || detailsStr.includes(query) || log.action.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-brand-800 flex items-center gap-2">
          <Activity className="text-brand-600 animate-pulse" />
          Centralized Employee Activities Monitor
        </h1>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-white p-4 rounded-xl border">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-600">Search Activities</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by keyword, name, details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Employee</label>
          <select
            value={actorId}
            onChange={(e) => setActorId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none"
          >
            <option value="">All Employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Action Type</label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none"
          >
            {ACTIONS.map((act) => (
              <option key={act.id} value={act.id}>{act.label}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <div className="w-1/2">
            <label className="mb-1 block text-xs font-medium text-gray-600">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:outline-none"
            />
          </div>
          <div className="w-1/2">
            <label className="mb-1 block text-xs font-medium text-gray-600">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main activities list */}
      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-xl border">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <EmptyState titleKey="empty.noData" />
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const actorName = employeeMap[log.actorId] || log.actorRole || 'System';
            return (
              <div key={log.id} className="bg-white border rounded-xl p-4 flex gap-3 hover:shadow-sm transition-shadow">
                <div className="rounded-full bg-brand-50 p-2 text-brand-600 h-10 w-10 flex items-center justify-center shrink-0">
                  <Activity size={18} />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                      <User size={14} className="text-gray-400" />
                      {actorName}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-brand-700 capitalize">
                    {log.action.replace(/\./g, ' ➔ ')}
                  </p>

                  {/* Render details context dynamically */}
                  <div className="bg-gray-50 rounded-lg p-2.5 text-xs text-gray-600 border border-gray-100">
                    <div className="flex items-start gap-1.5">
                      <Info size={14} className="text-brand-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-800">
                          {formatActivityDetails(log.action, log.details, maps)}
                        </p>
                        {Object.keys(log.details || {}).length > 0 && (
                          <div className="mt-1.5 pt-1.5 border-t border-gray-200/50 break-all font-mono text-[10px] text-gray-400 space-y-0.5">
                            {Object.entries(log.details || {}).map(([key, val]) => (
                              <div key={key}>
                                <span className="font-medium text-gray-500">{key}:</span> {displayEntityValue(key, val, maps)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
