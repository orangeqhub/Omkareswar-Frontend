import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { getLocalizedField } from '../../utils/localize';

export default function NotificationBell() {
  const { t } = useTranslation('common');
  const { user } = useAuthStore();
  const language = useLanguageStore((s) => s.language);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    if (!user) return;
    notificationService.getForUser({ role: user.role, userId: user.id }).then(setNotifications);
  }, [user]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleOpen() {
    setOpen((o) => !o);
  }

  async function handleMarkRead(id) {
    await notificationService.markRead(id);
    setNotifications((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Notifications"
        className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-warm-white">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 max-h-96 w-80 overflow-auto rounded-lg border border-gray-100 bg-warm-white shadow-lg z-50">
          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-gray-500">{t('empty.noNotifications')}</p>
          ) : (
            <ul>
              {notifications.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => handleMarkRead(n.id)}
                    className={`block w-full border-b border-gray-50 px-4 py-3 text-left text-sm last:border-0 ${
                      n.read ? 'text-gray-500' : 'font-medium text-gray-800 bg-brand-50/50'
                    }`}
                  >
                    {getLocalizedField(n, 'title', language)}
                    <span className="mt-1 block text-xs text-gray-400">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
