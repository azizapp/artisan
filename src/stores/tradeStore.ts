import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Trade, TradeFormData } from '../types';
import { useNotificationStore } from './notificationStore';
import { useAuthStore } from './authStore';

interface TradeState {
  trades: Trade[];
  isLoading: boolean;
  error: string | null;
  fetchTrades: () => Promise<void>;
  createTrade: (data: TradeFormData) => Promise<{ error: Error | null }>;
  updateTrade: (id: string, data: Partial<TradeFormData>) => Promise<{ error: Error | null }>;
  deleteTrade: (id: string) => Promise<{ error: Error | null }>;
}

export const useTradeStore = create<TradeState>((set, get) => ({
  trades: [],
  isLoading: false,
  error: null,

  fetchTrades: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('name_ar', { ascending: true });

      if (error) throw error;
      set({ trades: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  createTrade: async (data) => {
    try {
      const { error } = await supabase.from('trades').insert([{
        ...data,
        created_at: new Date().toISOString(),
      }]);

      if (error) throw error;
      await get().fetchTrades();
      // Add notification
      const userName = useAuthStore.getState().user?.full_name || 'النظام';
      useNotificationStore.getState().addNotification({
        type: 'trade',
        title: 'مهنة جديدة',
        description: `تمت إضافة المهنة: ${data.name_ar}`,
        created_by_name: userName,
      });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  updateTrade: async (id, data) => {
    try {
      const { error } = await supabase
        .from('trades')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      await get().fetchTrades();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  deleteTrade: async (id) => {
    try {
      const { error } = await supabase.from('trades').delete().eq('id', id);
      if (error) throw error;
      await get().fetchTrades();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },
}));
