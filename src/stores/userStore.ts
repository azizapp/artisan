import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface UserFormData {
  email: string;
  full_name: string;
  password: string;
  role: 'admin' | 'writer' | 'treasurer' | 'secretary' | 'consultant';
  is_active: boolean;
}

interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  createUser: (data: UserFormData) => Promise<{ error: Error | null }>;
  updateUser: (id: string, data: Partial<UserFormData>) => Promise<{ error: Error | null }>;
  deleteUser: (id: string) => Promise<{ error: Error | null }>;
  toggleUserStatus: (id: string, isActive: boolean) => Promise<{ error: Error | null }>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ users: (data || []) as User[] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  createUser: async (data) => {
    try {
      // استخدام دالة RPC لتجاوز مشاكل auth.signUp
      const { data: userId, error: rpcError } = await (supabase as any).rpc('create_new_user', {
        p_email: data.email,
        p_full_name: data.full_name,
        p_password: data.password,
        p_role: data.role,
        p_is_active: data.is_active,
      });

      if (rpcError) throw rpcError;

      await get().fetchUsers();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  updateUser: async (id, data) => {
    try {
      const updateData: any = {};
      if (data.full_name) updateData.full_name = data.full_name;
      if (data.role) updateData.role = data.role;
      if (data.is_active !== undefined) updateData.is_active = data.is_active;

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      await get().fetchUsers();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  deleteUser: async (id) => {
    try {
      // Delete from auth (this will cascade to users table via trigger)
      const { error } = await supabase.auth.admin.deleteUser(id);
      if (error) {
        // If admin delete fails, try deleting from users table only
        const { error: tableError } = await supabase
          .from('users')
          .delete()
          .eq('id', id);
        if (tableError) throw tableError;
      }
      await get().fetchUsers();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  toggleUserStatus: async (id, isActive) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      await get().fetchUsers();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },
}));
