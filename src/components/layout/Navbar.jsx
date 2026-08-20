import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Heart, MapPin, Tag } from 'lucide-react';
import LanguageToggle from '../common/LanguageToggle';
import ProfileDropdown from './ProfileDropdown';
import LocationPickerModal from './LocationPickerModal';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';
import { useLocationStore } from '../../store/locationStore';
import { toast } from '../../store/toastStore';
import { resolvePostPropertyAction } from '../../utils/postPropertyAccess';
const logoImage = '/logo.png';

const NAV_LINKS = [
  { to: '/', labelKey: 'nav.home' },
  { to: '/properties', labelKey: 'nav.properties' },
  { to: '/about', labelKey: 'nav.about' },
];

export default function Navbar() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const wishlistCount = useWishlistStore((s) => s.ids.length);
  const user = useAuthStore((s) => s.user);
  const selectedLocation = useLocationStore((s) => s.selectedLocation);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `whitespace-nowrap text-sm font-medium transition-colors hover:text-brand-700 ${isActive ? 'text-brand-800' : 'text-gray-700'}`;

  function handleSell() {
    const action = resolvePostPropertyAction(user);
    if (action.messageKey) {
      (action.toastType === 'error' ? toast.error : toast.info)(t(action.messageKey));
    }
    if (action.type === 'route') navigate(action.to);
  }

  return (
    <header className="sticky-header border-b border-gray-100 bg-warm-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2 sm:px-6 sm:py-2.5">
        <Link to="/" className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {logoError ? (
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 font-bold text-warm-white sm:h-14 sm:w-14 text-base sm:text-lg">
              OR
            </span>
          ) : (
            <span className="flex aspect-square h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-warm-white ring-1 ring-gray-100 sm:h-14 sm:w-14">
              <img
                src={logoImage}
                alt={t('brand.logoAlt')}
                onError={() => setLogoError(true)}
                className="h-full w-full object-contain"
              />
            </span>
          )}
          <span className="hidden truncate text-base font-bold text-brand-800 sm:inline sm:text-lg">
            {t('brand.name')}
          </span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className={linkClass}>
              {t(link.labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <div className="relative" onMouseLeave={() => setLocationOpen(false)}>
            <button
              type="button"
              onClick={() => setLocationOpen((o) => !o)}
              className="flex max-w-[9rem] items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              <MapPin size={16} className="shrink-0" />
              <span className="truncate">{selectedLocation || t('nav.selectLocation')}</span>
            </button>
            <LocationPickerModal open={locationOpen} onClose={() => setLocationOpen(false)} />
          </div>

          <Link
            to="/wishlist"
            aria-label={t('nav.wishlist')}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-brand-50 hover:text-red-500"
          >
            <Heart size={19} />
            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-warm-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={handleSell}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-brand-600 px-4 py-1.5 text-sm font-bold text-warm-white transition-colors hover:bg-brand-700"
          >
            <Tag size={15} /> {t('nav.sell')}
          </button>

          {user ? (
            <ProfileDropdown />
          ) : (
            <Link
              to="/login"
              className="whitespace-nowrap rounded-full border border-brand-500 px-3.5 py-1.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
            >
              {t('nav.login')}
            </Link>
          )}

          <LanguageToggle className="shrink-0" />
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 lg:hidden">
          <button
            type="button"
            onClick={handleSell}
            className="flex items-center gap-1 whitespace-nowrap rounded-full bg-brand-600 px-2.5 py-1.5 text-xs font-bold text-warm-white hover:bg-brand-700 sm:px-3"
          >
            <Tag size={13} />
            <span className="hidden min-[360px]:inline">{t('nav.sell')}</span>
          </button>
          <Link
            to="/wishlist"
            aria-label={t('nav.wishlist')}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-700 hover:bg-brand-50 hover:text-red-500"
          >
            <Heart size={19} />
            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-warm-white">
                {wishlistCount}
              </span>
            )}
          </Link>
          <LanguageToggle />
          {user && <ProfileDropdown />}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="rounded-lg p-2 text-gray-700 hover:bg-gray-100"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-gray-100 bg-warm-white px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-3" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={linkClass}
              >
                {t(link.labelKey)}
              </NavLink>
            ))}
            <div className="relative" onMouseLeave={() => setLocationOpen(false)}>
              <button
                type="button"
                onClick={() => setLocationOpen((o) => !o)}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-brand-700"
              >
                <MapPin size={16} className="shrink-0" />
                <span className="truncate">{selectedLocation || t('nav.selectLocation')}</span>
              </button>
              <LocationPickerModal open={locationOpen} onClose={() => setLocationOpen(false)} />
            </div>
            {!user && (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg border border-brand-500 px-4 py-2 text-center text-sm font-semibold text-brand-700"
              >
                {t('nav.login')}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
