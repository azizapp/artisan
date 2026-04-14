import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Expense, ExpenseFormData } from '../types';

interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  fetchExpenses: () => Promise<void>;
  createExpense: (data: ExpenseFormData) => Promise<{ error: Error | null }>;
  updateExpense: (id: string, data: Partial<ExpenseFormData>) => Promise<{ error: Error | null }>;
  deleteExpense: (id: string) => Promise<{ error: Error | null }>;
  getMonthlyTotal: (year: number, month: number) => Promise<number>;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  isLoading: false,
  error: null,

  fetchExpenses: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });

      if (error) throw error;
      set({ expenses: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  createExpense: async (data) => {
    try {
      const { error } = await supabase.from('expenses').insert([{
        ...data,
        created_at: new Date().toISOString(),
      }]);

      if (error) throw error;
      await get().fetchExpenses();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  updateExpense: async (id, data) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      await get().fetchExpenses();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  deleteExpense: async (id) => {
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
      await get().fetchExpenses();
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
        .from('expenses')
        .select('amount')
        .gte('expense_date', startDate)
        .lte('expense_date', endDate);

      if (error) throw error;
      return data?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    } catch (error) {
      console.error('Error getting monthly total:', error);
      return 0;
    }
  },
}));
