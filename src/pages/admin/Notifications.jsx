import { useEffect, useState } from 'react';
import { notificationService } from '../../services/notificationService';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { getLocalizedField } from '../../utils/localize';
import EmptyState from '../../components/common/EmptyState';

export default function Notifications() {
  const { user } = useAuthStore();
  const language = useLanguageStore((s) => s.language);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) notificationService.getForUser({ role: user.role, userId: user.id }).then(setNotifications);
  }, [user]);

  async function handleMarkRead(id) {
    await notificationService.markRead(id);
    setNotifications((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  if (notifications.length === 0) return <EmptyState titleKey="empty.noNotifications" />;

  return (
    <div className="space-y-2">
      {notifications.map((n) => (
        <button
          key={n.id}
          type="button"
          onClick={() => handleMarkRead(n.id)}
          className={`block w-full rounded-xl border px-4 py-3 text-left text-sm ${n.read ? 'border-gray-200 text-gray-500' : 'border-brand-200 bg-brand-50 font-medium text-gray-800'}`}
        >
          {getLocalizedField(n, 'title', language)}
          <span className="mt-1 block text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</span>
        </button>
      ))}
    </div>
  );
}
