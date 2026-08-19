import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, Award, Calendar, Users, Phone, CheckCircle2, AlertTriangle, UserCheck } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { userService } from '../../services/userService';
import { toast } from '../../store/toastStore';
import StatCard from '../../components/dashboard/StatCard';
import EmptyState from '../../components/common/EmptyState';

const RANGE_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'custom', label: 'Custom Range' }
];

export default function Performance() {
  const { t } = useTranslation(['dashboard', 'common']);
  const [employees, setEmployees] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [rangeType, setRangeType] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    userService.getUsers({ role: 'employee' }).then((list) => {
      setEmployees(list.filter((e) => e.status !== 'rejected' && e.status !== 'inactive'));
    });
  }, []);

  // Compute dates based on range selection
  function getDateParams() {
    if (rangeType === 'custom') {
      return { startDate, endDate };
    }
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    if (rangeType === 'week') {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
      start.setDate(diff);
    } else if (rangeType === 'month') {
      start.setDate(1);
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  }

  async function loadPerformance() {
    setLoading(true);
    try {
      const dates = getDateParams();
      const params = {
        ...dates,
        employeeId: selectedEmployeeId || undefined
      };
      const response = await apiClient.get('/admin/dashboard/performance', { params });
      setPerformanceData(response.data?.data || []);
    } catch (err) {
      toast.error('Failed to load performance metrics.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPerformance();
  }, [selectedEmployeeId, rangeType, startDate, endDate]);

  // Aggregate stats across all loaded employee rows
  const aggregates = performanceData.reduce(
    (acc, item) => {
      acc.totalAssigned += item.metrics.totalAssigned;
      acc.completedFollowUps += item.metrics.completedFollowUps;
      acc.pendingFollowUps += item.metrics.pendingFollowUps;
      acc.overdueFollowUps += item.metrics.overdueFollowUps;
      acc.calls += item.metrics.calls;
      acc.siteVisits += item.metrics.siteVisits;
      acc.interested += item.metrics.interestedCustomers;
      acc.notInterested += item.metrics.notInterestedCustomers;
      return acc;
    },
    { totalAssigned: 0, completedFollowUps: 0, pendingFollowUps: 0, overdueFollowUps: 0, calls: 0, siteVisits: 0, interested: 0, notInterested: 0 }
  );

  const completionRate = aggregates.totalAssigned > 0 
    ? Math.round((aggregates.completedFollowUps / aggregates.totalAssigned) * 100) 
    : 0;

  const chartData = performanceData.map((item) => ({
    name: item.name,
    Completed: item.metrics.completedFollowUps,
    Pending: item.metrics.pendingFollowUps,
    Overdue: item.metrics.overdueFollowUps,
    Calls: item.metrics.calls,
    Visits: item.metrics.siteVisits
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-brand-800 flex items-center gap-2">
          <Award className="text-brand-600" />
          Employee Performance Insights
        </h1>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-xl border">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Select Employee</label>
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none"
          >
            <option value="">All Employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Time Range</label>
          <select
            value={rangeType}
            onChange={(e) => setRangeType(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none"
          >
            {RANGE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
        </div>

        {rangeType === 'custom' && (
          <div className="md:col-span-2 flex gap-2">
            <div className="w-1/2">
              <label className="mb-1 block text-xs font-medium text-gray-600">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none"
              />
            </div>
            <div className="w-1/2">
              <label className="mb-1 block text-xs font-medium text-gray-600">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Aggregate Widgets */}
      {performanceData.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={TrendingUp} label="Total Tasks Assigned" value={aggregates.totalAssigned} accent="blue" />
          <StatCard icon={CheckCircle2} label="Task Completion Rate" value={`${completionRate}%`} accent="green" />
          <StatCard icon={Phone} label="Total Calls Logged" value={aggregates.calls} accent="indigo" />
          <StatCard icon={AlertTriangle} label="Overdue Reminders" value={aggregates.overdueFollowUps} accent="red" />
        </div>
      )}

      {/* Recharts Bar Chart */}
      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-xl border">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
        </div>
      ) : performanceData.length === 0 ? (
        <EmptyState titleKey="empty.noData" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 rounded-xl border bg-white p-4 shadow-sm">
            <h2 className="mb-4 font-semibold text-brand-800">Task Actions By Employee</h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Completed" fill="#90a955" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Pending" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Overdue" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Customer Interest Breakdown Card */}
          <div className="rounded-xl border bg-white p-4 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="mb-4 font-semibold text-brand-800">Client Interest Signals</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 font-medium">Interested / Converted</span>
                    <span className="font-semibold text-green-700">{aggregates.interested}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all" 
                      style={{ width: `${aggregates.interested + aggregates.notInterested > 0 ? (aggregates.interested / (aggregates.interested + aggregates.notInterested)) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 font-medium">Not Interested / Closed</span>
                    <span className="font-semibold text-red-700">{aggregates.notInterested}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 transition-all" 
                      style={{ width: `${aggregates.interested + aggregates.notInterested > 0 ? (aggregates.notInterested / (aggregates.interested + aggregates.notInterested)) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-4 space-y-2.5 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Site Visits Conducted</span>
                <span className="font-semibold text-gray-700">{aggregates.siteVisits}</span>
              </div>
              <div className="flex justify-between">
                <span>Completed Tasks</span>
                <span className="font-semibold text-gray-700">{aggregates.completedFollowUps}</span>
              </div>
            </div>
          </div>

          {/* Performance Summary Comparison Table */}
          <div className="lg:col-span-3 rounded-xl border bg-white overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-brand-800">Employee Productivity Scorecard</h2>
            </div>
            <table className="min-w-full divide-y divide-gray-100 text-sm text-left">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Assigned Tasks</th>
                  <th className="px-4 py-3">Completed</th>
                  <th className="px-4 py-3">Overdue</th>
                  <th className="px-4 py-3">Calls Made</th>
                  <th className="px-4 py-3">Visits Done</th>
                  <th className="px-4 py-3">Completion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {performanceData.map((item) => {
                  const rate = item.metrics.totalAssigned > 0 
                    ? Math.round((item.metrics.completedFollowUps / item.metrics.totalAssigned) * 100) 
                    : 0;
                  return (
                    <tr key={item.employeeId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-800">{item.name}</td>
                      <td className="px-4 py-3">{item.metrics.totalAssigned}</td>
                      <td className="px-4 py-3 text-green-700 font-semibold">{item.metrics.completedFollowUps}</td>
                      <td className="px-4 py-3 text-red-600">{item.metrics.overdueFollowUps}</td>
                      <td className="px-4 py-3">{item.metrics.calls}</td>
                      <td className="px-4 py-3">{item.metrics.siteVisits}</td>
                      <td className="px-4 py-3 font-semibold">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          rate >= 80 ? 'bg-green-50 text-green-700' : rate >= 50 ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
