import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Contribution, ContributionFormData } from '../types';

interface ContributionState {
  contributions: Contribution[];
  isLoading: boolean;
  error: string | null;
  fetchContributions: () => Promise<void>;
  fetchContributionsByArtisan: (artisanId: string) => Promise<void>;
  createContribution: (data: ContributionFormData) => Promise<{ error: Error | null }>;
  updateContribution: (id: string, data: Partial<ContributionFormData>) => Promise<{ error: Error | null }>;
  deleteContribution: (id: string) => Promise<{ error: Error | null }>;
  getMonthlyTotal: (year: number, month: number) => Promise<number>;
}

export const useContributionStore = create<ContributionState>((set, get) => ({
  contributions: [],
  isLoading: false,
  error: null,

  fetchContributions: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('contributions')
        .select(`
          *,
          artisan:artisans(id, full_name, national_id)
        `)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      set({ contributions: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchContributionsByArtisan: async (artisanId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('contributions')
        .select(`
          *,
          artisan:artisans(id, full_name, national_id)
        `)
        .eq('artisan_id', artisanId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      set({ contributions: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  createContribution: async (data) => {
    try {
      const { error } = await supabase.from('contributions').insert([{
        ...data,
        created_at: new Date().toISOString(),
      }]);

      if (error) throw error;
      await get().fetchContributions();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  updateContribution: async (id, data) => {
    try {
      const { error } = await supabase
        .from('contributions')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      await get().fetchContributions();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  deleteContribution: async (id) => {
    try {
      const { error } = await supabase.from('contributions').delete().eq('id', id);
      if (error) throw error;
      await get().fetchContributions();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  getMonthlyTotal: async (year, month) => {
    try {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
      
      const { data, error } = await supabase
        .from('contributions')
        .select('amount')
        .gte('payment_date', startDate)
        .lte('payment_date', endDate);

      if (error) throw error;
      return data?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    } catch (error) {
      console.error('Error getting monthly total:', error);
      return 0;
    }
  },
}));
