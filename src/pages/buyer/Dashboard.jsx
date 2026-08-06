import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, MessageSquareHeart, CalendarCheck, Search } from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import { enquiryService } from '../../services/enquiryService';
import { visitService } from '../../services/visitService';
import { useAuthStore } from '../../store/authStore';
import { CATEGORIES } from '../../config/categories';
import { useLanguageStore } from '../../store/languageStore';
import StatCard from '../../components/dashboard/StatCard';

export default function BuyerDashboard() {
  const { t } = useTranslation(['dashboard', 'common']);
  const { user } = useAuthStore();
  const language = useLanguageStore((s) => s.language);
  const [counts, setCounts] = useState({ favourites: 0, interests: 0, visits: 0 });

  useEffect(() => {
    if (!user) return;
    propertyService.getFavourites(user.id).then((list) => setCounts((c) => ({ ...c, favourites: list.length })));
    enquiryService.getForBuyer(user.mobile).then((list) => setCounts((c) => ({ ...c, interests: list.length })));
    visitService.getForBuyer(user.id).then((list) => setCounts((c) => ({ ...c, visits: list.length })));
  }, [user]);

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-800">{t('greeting', { name: user?.name })}</h1>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard icon={Heart} label={t('buyer.savedProperties')} value={counts.favourites} />
        <StatCard icon={MessageSquareHeart} label={t('buyer.myInterests')} value={counts.interests} accent="amber" />
        <StatCard icon={CalendarCheck} label={t('buyer.visitRequests')} value={counts.visits} accent="blue" />
      </div>

      <Link to="/buyer/properties" className="mt-6 flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-warm-white w-fit">
        <Search size={16} /> {t('buyer.searchProperties')}
      </Link>

      <div className="mt-8">
        <h2 className="mb-3 font-semibold text-brand-800">{t('nav.categories', { ns: 'common' })}</h2>
        <div className="flex gap-3 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} to={`/properties/category/${c.slug}`} className="shrink-0 rounded-full border border-gray-200 px-4 py-2 text-sm hover:bg-brand-50">
              {language === 'te' ? c.nameTe : c.nameEn}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
