import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Artisan, ArtisanFormData } from '../types';
import { useNotificationStore } from './notificationStore';
import { useAuthStore } from './authStore';

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
      set({ artisans: (data || []) as Artisan[] });
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
      return data as Artisan;
    } catch (error) {
      console.error('Error fetching artisan:', error);
      return null;
    }
  },

  createArtisan: async (data) => {
    try {
      const insertData: Record<string, unknown> = {
        ...data,
        documents: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      // Remove undefined values
      Object.keys(insertData).forEach(key => {
        if (insertData[key] === undefined) delete insertData[key];
      });
      const { error } = await supabase.from('artisans').insert([insertData as any]);

      if (error) throw error;
      await get().fetchArtisans();
      // Add notification
      const userName = useAuthStore.getState().user?.full_name || 'النظام';
      useNotificationStore.getState().addNotification({
        type: 'artisan',
        title: 'حرفي جديد',
        description: `تمت إضافة الحرفي ${data.full_name}`,
        created_by_name: userName,
      });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  updateArtisan: async (id, data) => {
    try {
      const updateData: Record<string, unknown> = {
        ...data,
        updated_at: new Date().toISOString(),
      };
      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) delete updateData[key];
      });
      const { error } = await supabase
        .from('artisans')
        .update(updateData as any)
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
