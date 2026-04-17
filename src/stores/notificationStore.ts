import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Notification, NotificationFormData } from '../types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  addNotification: (data: NotificationFormData) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      const notifications = (data || []) as Notification[];
      const unreadCount = notifications.filter(n => !n.is_read).length;
      set({ notifications, unreadCount });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  addNotification: async (data: NotificationFormData) => {
    try {
      const { error } = await supabase.from('notifications').insert([{
        ...data,
        is_read: false,
        created_at: new Date().toISOString(),
      }]);

      if (error) throw error;
      await get().fetchNotifications();
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  },

  markAsRead: async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      await get().fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) throw error;
      await get().fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },
}));
