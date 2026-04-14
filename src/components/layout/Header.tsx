import { useTranslation } from 'react-i18next';
import { Moon, Sun, Globe, Bell } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAuthStore } from '../../stores/authStore';

export function Header() {
  const { t } = useTranslation();
  const { theme, language, toggleTheme, toggleLanguage } = useSettingsStore();
  const { user } = useAuthStore();

  return (
    <header className="h-16 bg-[var(--bg)] border-b border-[var(--border)] flex items-center justify-between px-6">
      {/* Left side - could be used for breadcrumbs */}
      <div />

      {/* Right side - actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-[var(--border)] transition-colors"
          title={theme === 'light' ? t('settings.dark') : t('settings.light')}
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-[var(--text)]" />
          ) : (
            <Sun className="w-5 h-5 text-[var(--text)]" />
          )}
        </button>

        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="p-2 rounded-lg hover:bg-[var(--border)] transition-colors"
          title={language === 'ar' ? t('settings.french') : t('settings.arabic')}
        >
          <Globe className="w-5 h-5 text-[var(--text)]" />
          <span className="sr-only">
            {language === 'ar' ? 'Français' : 'العربية'}
          </span>
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-[var(--border)] transition-colors relative">
          <Bell className="w-5 h-5 text-[var(--text)]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3 ps-4 border-s border-[var(--border)]">
          <div className="text-right">
            <p className="text-sm font-medium text-[var(--text-h)]">
              {user?.full_name || user?.email}
            </p>
            <p className="text-xs text-[var(--text)]">
              {user?.role === 'admin' ? 'Administrator' : 'User'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-semibold">
            {(user?.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
