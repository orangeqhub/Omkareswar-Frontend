import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClipboardList, Clock, Loader2, CheckCircle2, AlertTriangle, Inbox, PhoneCall, CalendarCheck } from 'lucide-react';
import { employeeTaskService } from '../../services/employeeTaskService';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { getLocalizedField } from '../../utils/localize';
import StatCard from '../../components/dashboard/StatCard';

export default function EmployeeDashboard() {
  const { t } = useTranslation('dashboard');
  const { user } = useAuthStore();
  const language = useLanguageStore((s) => s.language);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (user) employeeTaskService.getDashboardSummary(user).then(setSummary);
  }, [user]);

  if (!summary) return null;

  const { counts, sections, workCompletion } = summary;

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-800">{t('greeting', { name: user?.name })}</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link to="/employee/verifications"><StatCard icon={ClipboardList} label={t('employeeDashboard.totalAssigned')} value={counts.totalAssigned} /></Link>
        <Link to="/employee/verifications?status=pending_review"><StatCard icon={Clock} label={t('employeeDashboard.pending')} value={counts.pending} accent="amber" /></Link>
        <Link to="/employee/verifications?status=in_review"><StatCard icon={Loader2} label={t('employeeDashboard.inProgress')} value={counts.inProgress} accent="blue" /></Link>
        <Link to="/employee/verifications?status=completed"><StatCard icon={CheckCircle2} label={t('employeeDashboard.completed')} value={counts.completed} /></Link>
        <Link to="/employee/follow-ups?tab=overdue"><StatCard icon={AlertTriangle} label={t('employeeDashboard.overdue')} value={counts.overdue} accent="red" /></Link>
        <Link to="/employee/enquiries"><StatCard icon={Inbox} label={t('employeeDashboard.assignedEnquiries')} value={counts.assignedEnquiries} accent="blue" /></Link>
        <Link to="/employee/follow-ups?tab=today"><StatCard icon={PhoneCall} label={t('employeeDashboard.todaysFollowUps')} value={counts.todaysFollowUps} accent="amber" /></Link>
        <Link to="/employee/visits"><StatCard icon={CalendarCheck} label={t('employeeDashboard.upcomingVisits')} value={counts.upcomingVisits} /></Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 p-4">
          <h2 className="mb-3 text-sm font-semibold text-brand-800">{t('employeeDashboard.todaysTasks')}</h2>
          {sections.todaysTasks.length === 0 ? (
            <p className="text-xs text-gray-400">{t('common.noItems')}</p>
          ) : (
            <ul className="space-y-2">
              {sections.todaysTasks.map((f) => (
                <li key={f.id} className="rounded-lg bg-gray-50 p-2.5 text-sm">
                  <p className="text-gray-700">{f.reason}</p>
                  <p className="text-xs text-gray-400">{f.dueDate.slice(0, 10)} {f.dueTime}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-red-100 bg-red-50/40 p-4">
          <h2 className="mb-3 text-sm font-semibold text-red-700">{t('employeeDashboard.overdueTasks')}</h2>
          {sections.overdueTasks.length === 0 ? (
            <p className="text-xs text-gray-400">{t('common.noItems')}</p>
          ) : (
            <ul className="space-y-2">
              {sections.overdueTasks.map((item) => (
                <li key={item.id} className="rounded-lg bg-warm-white p-2.5 text-sm">
                  <p className="text-gray-700">{item.name || item.titleEn || item.reason}</p>
                  <p className="text-xs text-red-500">{(item.dueDate || '').slice(0, 10)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 p-4">
          <h2 className="mb-3 text-sm font-semibold text-brand-800">{t('employeeDashboard.recentAssignments')}</h2>
          {sections.recentAssignments.length === 0 ? (
            <p className="text-xs text-gray-400">{t('common.noItems')}</p>
          ) : (
            <ul className="space-y-2">
              {sections.recentAssignments.map((item) => (
                <li key={item.id} className="rounded-lg bg-gray-50 p-2.5 text-sm">
                  <p className="text-gray-700">{item.name || getLocalizedField(item, 'title', language) || item.buyerName}</p>
                  <p className="text-xs text-gray-400">{new Date(item.assignedAt).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 p-4">
          <h2 className="mb-3 text-sm font-semibold text-brand-800">{t('employeeDashboard.upcomingFollowUps')}</h2>
          {sections.upcomingFollowUps.length === 0 ? (
            <p className="text-xs text-gray-400">{t('common.noItems')}</p>
          ) : (
            <ul className="space-y-2">
              {sections.upcomingFollowUps.map((f) => (
                <li key={f.id} className="rounded-lg bg-gray-50 p-2.5 text-sm">
                  <p className="text-gray-700">{f.reason}</p>
                  <p className="text-xs text-gray-400">{f.dueDate.slice(0, 10)} {f.dueTime}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 p-4">
          <h2 className="mb-3 text-sm font-semibold text-brand-800">{t('employeeDashboard.upcomingVisitsSection')}</h2>
          {sections.upcomingVisits.length === 0 ? (
            <p className="text-xs text-gray-400">{t('common.noItems')}</p>
          ) : (
            <ul className="space-y-2">
              {sections.upcomingVisits.map((v) => (
                <li key={v.id} className="rounded-lg bg-gray-50 p-2.5 text-sm">
                  <p className="text-gray-700">{v.buyerName}</p>
                  <p className="text-xs text-gray-400">{new Date(v.scheduledFor).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 p-4">
          <h2 className="mb-3 text-sm font-semibold text-brand-800">{t('employeeDashboard.recentNotifications')}</h2>
          {sections.recentNotifications.length === 0 ? (
            <p className="text-xs text-gray-400">{t('empty.noNotifications')}</p>
          ) : (
            <ul className="space-y-2">
              {sections.recentNotifications.map((n) => (
                <li key={n.id} className="rounded-lg bg-gray-50 p-2.5 text-sm">
                  <p className="text-gray-700">{getLocalizedField(n, 'title', language)}</p>
                  <p className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-gray-200 p-4">
        <h2 className="mb-2 text-sm font-semibold text-brand-800">{t('employeeDashboard.workCompletionSummary')}</h2>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-brand-500" style={{ width: `${workCompletion.rate}%` }} />
        </div>
        <p className="mt-2 text-sm text-gray-600">{t('reports.completedOfTotal', { completed: workCompletion.completed, total: workCompletion.total })}</p>
      </section>
    </div>
  );
}
