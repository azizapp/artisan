import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          // التحقق من المستخدم مباشرة من جدول users
          const { data: userData, error } = await (supabase as any)
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('password', password)
            .eq('is_active', true)
            .single();

          if (error || !userData) {
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
          }

          set({ user: userData as User, isAuthenticated: true });
          return { error: null };
        } catch (error) {
          return { error: error as Error };
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        set({ user: null, isAuthenticated: false });
      },

      checkAuth: async () => {
        // التحقق من الجلسة المحفوظة
        const currentUser = get().user;
        if (currentUser) {
          // التحقق أن المستخدم لا يزال موجوداً ونشطاً
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .eq('is_active', true)
            .single();

          if (userData) {
            set({ user: userData as User, isAuthenticated: true });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
