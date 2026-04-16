import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  Wallet,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { logout, user } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const allNavItems = [
    { path: '/', icon: LayoutDashboard, label: t('nav.dashboard') },
    { path: '/artisans', icon: Users, label: t('nav.artisans') },
    { path: '/contributions', icon: Wallet, label: t('nav.contributions') },
    { path: '/expenses', icon: Receipt, label: t('nav.expenses') },
    { path: '/reports', icon: BarChart3, label: t('nav.reports') },
    { path: '/settings', icon: Settings, label: t('nav.settings'), adminOnly: true },
  ];

  const navItems = allNavItems.filter(item => !item.adminOnly || user?.role === 'admin');

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const getPageTitle = () => {
    const item = navItems.find(item => item.path === location.pathname);
    return item?.label || t('app.name');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-[var(--card)] border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
        <button
          onClick={toggleMenu}
          className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
          aria-label={isMenuOpen ? t('common.close') : t('common.menu')}
        >
          {isMenuOpen ? (
            <X className="w-6 h-6 text-[var(--text)]" />
          ) : (
            <Menu className="w-6 h-6 text-[var(--text)]" />
          )}
        </button>
        <h1 className="text-lg font-bold text-[var(--text-h)]">{getPageTitle()}</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Menu Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[var(--card)] border-e border-[var(--border)] transform transition-transform duration-300 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[var(--primary)]">{t('app.name')}</h1>
            <p className="text-xs text-[var(--muted-foreground)]">{t('app.tagline')}</p>
          </div>
          <button
            onClick={closeMenu}
            className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[var(--text)]" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMenu}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                    : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[var(--border)]">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">{t('nav.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="sticky bottom-0 z-40 bg-[var(--card)] border-t border-[var(--border)] px-2 py-2 lg:hidden">
        <div className="flex items-center justify-around">
          {navItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'text-[var(--primary)]'
                    : 'text-[var(--muted-foreground)]'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
