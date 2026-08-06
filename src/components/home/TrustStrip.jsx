import { useTranslation } from 'react-i18next';
import { ShieldCheck, Lock, Scale, BadgeIndianRupee } from 'lucide-react';

const ITEMS = [
  { icon: ShieldCheck, key: 'trust.verified' },
  { icon: Lock, key: 'trust.safeProcess' },
  { icon: Scale, key: 'trust.legalSupport' },
  { icon: BadgeIndianRupee, key: 'trust.transparentPricing' },
];

export default function TrustStrip() {
  const { t } = useTranslation('common');
  return (
    <section className="border-b border-gray-100 bg-brand-50">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 sm:px-6 md:grid-cols-4">
        {ITEMS.map(({ icon: Icon, key }) => (
          <div key={key} className="flex items-center gap-2.5">
            <Icon size={22} className="shrink-0 text-brand-700" />
            <span className="text-sm font-medium text-brand-800">{t(key)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
