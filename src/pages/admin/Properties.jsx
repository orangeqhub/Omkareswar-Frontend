import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropertyModerationList from '../../components/dashboard/PropertyModerationList';

const TABS = ['pending', 'active', 'changes_requested', 'rejected', 'draft'];

export default function Properties() {
  const { t } = useTranslation('common');
  const [tab, setTab] = useState('pending');

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((tabKey) => (
          <button
            key={tabKey}
            type="button"
            onClick={() => setTab(tabKey)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              tab === tabKey ? 'border-brand-600 bg-brand-600 text-warm-white' : 'border-gray-300 text-gray-600'
            }`}
          >
            {t(`status.${tabKey}`)}
          </button>
        ))}
      </div>
      <PropertyModerationList statusFilter={tab} />
    </div>
  );
}
