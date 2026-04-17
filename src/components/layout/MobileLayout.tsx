import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  Wallet,
  Receipt,
  BarChart3,
  Settings,
} from 'lucide-react';
import { NotificationDropdown } from '../ui/NotificationDropdown';

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const allNavItems = [
    { path: '/', icon: LayoutDashboard, label: t('nav.dashboard') },
    { path: '/artisans', icon: Users, label: t('nav.artisans') },
    { path: '/contributions', icon: Wallet, label: t('nav.contributions') },
    { path: '/expenses', icon: Receipt, label: t('nav.expenses') },
    { path: '/reports', icon: BarChart3, label: t('nav.reports') },
    { path: '/settings', icon: Settings, label: t('nav.settings') },
  ];

  const navItems = allNavItems;

  const getPageTitle = () => {
    const item = navItems.find(item => item.path === location.pathname);
    return item?.label || t('app.name');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-[var(--card)] border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/settings')}
          className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
          aria-label={t('nav.settings')}
        >
          <Settings className="w-6 h-6 text-[var(--text)]" />
        </button>
        <h1 className="text-lg font-bold text-[var(--text-h)]">{getPageTitle()}</h1>
        <NotificationDropdown />
      </header>

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
