import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { auditLogService } from '../../services/auditLogService';
import EmptyState from '../../components/common/EmptyState';

export default function AuditLogs() {
  const { t } = useTranslation('dashboard');
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    auditLogService.getLogs().then(setLogs);
  }, []);

  if (logs.length === 0) return <EmptyState titleKey="empty.noData" />;

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-100 text-sm">
        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3">{t('table.action')}</th>
            <th className="px-4 py-3">{t('table.details')}</th>
            <th className="px-4 py-3">{t('table.when')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="px-4 py-3 font-medium text-gray-800">{log.action}</td>
              <td className="px-4 py-3 text-gray-600">
                {log.details ? (typeof log.details === 'object' ? JSON.stringify(log.details) : log.details) : '-'}
              </td>
              <td className="px-4 py-3 text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
