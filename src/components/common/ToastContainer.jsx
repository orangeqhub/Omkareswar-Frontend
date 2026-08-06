import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const STYLES = {
  success: 'bg-brand-700 text-warm-white',
  error: 'bg-red-600 text-warm-white',
  info: 'bg-gray-800 text-warm-white',
};

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
      {toasts.map((t) => {
        const Icon = ICONS[t.type] || Info;
        return (
          <div
            key={t.id}
            role="status"
            className={`flex items-start gap-2 rounded-lg shadow-lg px-4 py-3 text-sm ${STYLES[t.type] || STYLES.info}`}
          >
            <Icon size={18} className="shrink-0 mt-0.5" />
            <p className="flex-1">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
