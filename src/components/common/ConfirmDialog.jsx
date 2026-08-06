import { useTranslation } from 'react-i18next';

export default function ConfirmDialog({
  open,
  titleKey = 'confirmDialog.unsavedTitle',
  bodyKey = 'confirmDialog.unsavedBody',
  confirmKey = 'confirmDialog.leave',
  cancelKey = 'confirmDialog.stay',
  onConfirm,
  onCancel,
}) {
  const { t } = useTranslation('common');
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-4">
      <div role="alertdialog" aria-modal="true" className="w-full max-w-sm rounded-xl bg-warm-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-brand-800">{t(titleKey)}</h2>
        <p className="mt-2 text-sm text-gray-600">{t(bodyKey)}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            {t(cancelKey)}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-warm-white hover:bg-red-700"
          >
            {t(confirmKey)}
          </button>
        </div>
      </div>
    </div>
  );
}
