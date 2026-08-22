import { Suspense, useState } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { Menu, X, LogOut, ChevronRight, Tag } from 'lucide-react';
import LanguageToggle from '../common/LanguageToggle';
import NotificationBell from '../dashboard/NotificationBell';
import RouteLoadingFallback from '../common/RouteLoadingFallback';
import { useAuthStore } from '../../store/authStore';
import { DASHBOARD_NAV, ROLE_HOME } from '../../config/navigation';
import { hasPermission } from '../../utils/permissions';
import { getLogoutRedirectPath } from '../../utils/logoutRedirect';

function NavIcon({ name, ...props }) {
  const Icon = Icons[name] || Icons.Circle;
  return <Icon {...props} />;
}

export default function DashboardLayout({ role }) {
  const { t } = useTranslation(['common', 'dashboard']);
  const [logoError, setLogoError] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const items = (DASHBOARD_NAV[role] || []).filter((item) => !item.permission || hasPermission(user, item.permission));

  const sidebarLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive ? 'bg-brand-100 text-brand-800' : 'text-gray-600 hover:bg-gray-50'
    }`;

  const SidebarContent = (
    <div className="flex-1 overflow-y-auto min-h-0" style={{ maxHeight: 'calc(100vh - 70px)' }}>
      <nav className="flex flex-col gap-1 px-3 py-4" aria-label="Dashboard navigation">
        {items.map((item) => (
          <NavLink key={item.key} to={item.path} className={sidebarLinkClass} onClick={() => setDrawerOpen(false)}>
            <NavIcon name={item.icon} size={18} />
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-64 shrink-0 border-r border-gray-100 bg-warm-white lg:block h-screen sticky top-0 flex flex-col overflow-hidden">
        <Link to={role === 'employee' ? ROLE_HOME[role] : '/'} className="flex items-center gap-2 border-b border-gray-100 px-4 py-4 shrink-0">
          {logoError ? (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-warm-white font-bold text-sm">
              OR
            </span>
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-warm-white ring-1 ring-gray-100">
              <img
                src="/logo.png"
                alt={t('brand.logoAlt', { ns: 'common' })}
                onError={() => setLogoError(true)}
                className="h-full w-full object-contain"
              />
            </span>
          )}
          <span className="text-sm font-bold text-brand-800">{t('brand.name', { ns: 'common' })}</span>
        </Link>
        {SidebarContent}
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-warm-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 shrink-0">
              <div className="flex items-center gap-2">
                {logoError ? (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-warm-white font-bold text-sm">OR</span>
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-warm-white ring-1 ring-gray-100">
                    <img src="/logo.png" alt={t('brand.logoAlt', { ns: 'common' })} onError={() => setLogoError(true)} className="h-full w-full object-contain" />
                  </span>
                )}
                <span className="text-sm font-bold text-brand-800">{t('brand.name', { ns: 'common' })}</span>
              </div>
              <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            {SidebarContent}
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-gray-100 bg-warm-white px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="hidden items-center gap-1 text-sm text-gray-500 sm:flex">
              <span>{t('common.breadcrumbHome', { ns: 'dashboard' })}</span>
              <ChevronRight size={14} />
              <span className="font-medium text-brand-800 capitalize">{role}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {(role === 'admin' || role === 'employee') && (
              <button
                type="button"
                onClick={() => navigate(`/${role}/post-property`)}
                aria-label={t('nav.sell', { ns: 'common' })}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-brand-600 px-3 py-1.5 text-sm font-bold text-warm-white transition-colors hover:bg-brand-700"
              >
                <Tag size={15} />
                <span className="hidden min-[360px]:inline">{t('nav.sell', { ns: 'common' })}</span>
              </button>
            )}
            <LanguageToggle />
            <NotificationBell />
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            </div>
            <button
              type="button"
              onClick={async () => {
                const redirectTo = getLogoutRedirectPath(user?.role);
                await logout();
                navigate(redirectTo);
              }}
              aria-label={t('nav.logout', { ns: 'common' })}
              className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6">
          <Suspense fallback={<RouteLoadingFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
