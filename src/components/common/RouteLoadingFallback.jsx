import { useTranslation } from 'react-i18next';

export default function RouteLoadingFallback() {
  const { t } = useTranslation('common');
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600" />
        {t('loading')}
      </div>
    </div>
  );
}
