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
      theme: 'dark',
      language: 'ar',
      fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
      fontSize: 'small',
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
        
        // Apply language-specific defaults
        const isArabic = language === 'ar';
        const newFontFamily = isArabic 
          ? '"Cairo", "Noto Sans Arabic", sans-serif' 
          : 'Arial, Helvetica, sans-serif';
        const newFontSize: 'small' | 'medium' | 'large' = 'small';
        const newTheme: 'light' | 'dark' = 'dark';
        
        // Apply font family
        document.body.style.fontFamily = newFontFamily;
        
        // Apply font size
        const sizes = { small: '14px', medium: '16px', large: '18px' };
        document.documentElement.style.fontSize = sizes[newFontSize];
        
        // Apply theme
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        
        set({ 
          language, 
          direction, 
          fontFamily: newFontFamily, 
          fontSize: newFontSize,
          theme: newTheme 
        });
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
        const currentLanguage = get().language;
        const newLanguage = currentLanguage === 'ar' ? 'fr' : 'ar';
        get().setLanguage(newLanguage);
      },
    }),
    {
      name: 'settings-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply language-specific defaults
          const isArabic = state.language === 'ar';
          const defaultFontFamily = isArabic 
            ? '"Cairo", "Noto Sans Arabic", sans-serif' 
            : 'Arial, Helvetica, sans-serif';
          const defaultFontSize: 'small' | 'medium' | 'large' = 'small';
          const defaultTheme: 'light' | 'dark' = 'dark';
          
          // Apply theme
          document.documentElement.classList.toggle('dark', defaultTheme === 'dark');
          // Apply language
          i18n.changeLanguage(state.language);
          document.documentElement.dir = state.direction;
          document.documentElement.lang = state.language;
          // Apply font settings
          document.body.style.fontFamily = defaultFontFamily;
          const sizes = { small: '14px', medium: '16px', large: '18px' };
          document.documentElement.style.fontSize = sizes[defaultFontSize];
          
          // Update state with defaults
          state.fontFamily = defaultFontFamily;
          state.fontSize = defaultFontSize;
          state.theme = defaultTheme;
        }
      },
    }
  )
);
