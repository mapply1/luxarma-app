"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Notification } from '@/types';
import { toast } from 'sonner';

// Hook pour récupérer toutes les notifications
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          type,
          title,
          message,
          projet_id,
          client_id,
          related_id,
          is_read,
          created_at,
          read_at,
          client:clients(*),
          project:projects(titre)
        `)
        .in('type', ['comment', 'ticket', 'review'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute - notifications should be fresh but not too aggressive
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook pour récupérer le nombre de notifications non lues
export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('is_read', false);
      
      if (error) throw error;
      return count || 0;
    },
    staleTime: 30 * 1000, // 30 seconds - count should be fresh
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook pour marquer une notification comme lue
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data, error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
    onError: (error) => {
      console.error('Erreur lors du marquage de la notification:', error);
      toast.error("Erreur lors du marquage de la notification");
    }
  });
}

// Hook pour marquer toutes les notifications comme lues
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('is_read', false)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      toast.success("Toutes les notifications ont été marquées comme lues");
    },
    onError: (error) => {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
      toast.error("Erreur lors du marquage des notifications");
    }
  });
}