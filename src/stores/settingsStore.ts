import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../lib/i18n';
import { getDirection } from '../lib/i18n';
// import type { Settings } from '../types';

interface SettingsState {
  theme: 'light' | 'dark';
  language: 'ar' | 'fr';
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
  direction: 'rtl' | 'ltr';
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'ar' | 'fr') => void;
  setFontFamily: (fontFamily: string) => void;
  setFontSize: (fontSize: 'small' | 'medium' | 'large') => void;
  toggleTheme: () => void;
  toggleLanguage: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      language: 'ar',
      fontFamily: 'system-ui',
      fontSize: 'medium',
      direction: 'rtl',

      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },

      setLanguage: (language) => {
        i18n.changeLanguage(language);
        const direction = getDirection(language);
        document.documentElement.dir = direction;
        document.documentElement.lang = language;
        set({ language, direction });
      },

      setFontFamily: (fontFamily) => {
        set({ fontFamily });
        document.body.style.fontFamily = fontFamily;
      },

      setFontSize: (fontSize) => {
        set({ fontSize });
        const sizes = { small: '14px', medium: '16px', large: '18px' };
        document.documentElement.style.fontSize = sizes[fontSize];
      },

      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },

      toggleLanguage: () => {
        const newLanguage = get().language === 'ar' ? 'fr' : 'ar';
        get().setLanguage(newLanguage);
      },
    }),
    {
      name: 'settings-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply theme
          document.documentElement.classList.toggle('dark', state.theme === 'dark');
          // Apply language
          i18n.changeLanguage(state.language);
          document.documentElement.dir = state.direction;
          document.documentElement.lang = state.language;
          // Apply font settings
          document.body.style.fontFamily = state.fontFamily;
          const sizes = { small: '14px', medium: '16px', large: '18px' };
          document.documentElement.style.fontSize = sizes[state.fontSize];
        }
      },
    }
  )
);
