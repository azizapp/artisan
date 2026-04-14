import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Artisan, ArtisanFormData } from '../types';

interface ArtisanState {
  artisans: Artisan[];
  isLoading: boolean;
  error: string | null;
  fetchArtisans: () => Promise<void>;
  getArtisan: (id: string) => Promise<Artisan | null>;
  createArtisan: (data: ArtisanFormData) => Promise<{ error: Error | null }>;
  updateArtisan: (id: string, data: Partial<ArtisanFormData>) => Promise<{ error: Error | null }>;
  deleteArtisan: (id: string) => Promise<{ error: Error | null }>;
  toggleArtisanStatus: (id: string, isActive: boolean) => Promise<{ error: Error | null }>;
}

export const useArtisanStore = create<ArtisanState>((set, get) => ({
  artisans: [],
  isLoading: false,
  error: null,

  fetchArtisans: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('artisans')
        .select(`
          *,
          trade:trades(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ artisans: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  getArtisan: async (id) => {
    try {
      const { data, error } = await supabase
        .from('artisans')
        .select(`
          *,
          trade:trades(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching artisan:', error);
      return null;
    }
  },

  createArtisan: async (data) => {
    try {
      const { error } = await supabase.from('artisans').insert([{
        ...data,
        documents: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }]);

      if (error) throw error;
      await get().fetchArtisans();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  updateArtisan: async (id, data) => {
    try {
      const { error } = await supabase
        .from('artisans')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      await get().fetchArtisans();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  deleteArtisan: async (id) => {
    try {
      const { error } = await supabase.from('artisans').delete().eq('id', id);
      if (error) throw error;
      await get().fetchArtisans();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  toggleArtisanStatus: async (id, isActive) => {
    try {
      const { error } = await supabase
        .from('artisans')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      await get().fetchArtisans();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },
}));
