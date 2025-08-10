"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Notification } from '@/types';
import { toast } from 'sonner';

// Hook pour récupérer les notifications du client connecté
export function useClientNotifications() {
  return useQuery({
    queryKey: ['client-notifications'],
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user?.client_id) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          type,
          title,
          message,
          projet_id,
          is_read,
          created_at,
          read_at,
          project:projects(titre)
        `)
        .eq('client_id', user.client_id)
        .in('type', ['task_created', 'task_updated', 'milestone_created', 'milestone_updated', 'document_uploaded'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute - fresh but not too aggressive
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook pour récupérer le nombre de notifications non lues du client
export function useClientUnreadNotificationsCount() {
  return useQuery({
    queryKey: ['client-notifications', 'unread-count'],
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user?.client_id) return 0;
      
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('client_id', user.client_id)
        .eq('is_read', false);
      
      if (error) throw error;
      return count || 0;
    },
    staleTime: 30 * 1000, // 30 seconds - count should be fresh
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook pour marquer une notification client comme lue
export function useMarkClientNotificationAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      // Get current user to ensure we're only updating their notifications
      const user = await getCurrentUser();
      if (!user?.client_id) {
        throw new Error('Client not authenticated');
      }

      const { data, error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('client_id', user.client_id) // Additional security: only update own notifications
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['client-notifications', 'unread-count'] });
      toast.success("Notification marquée comme lue");
    },
    onError: (error) => {
      console.error('Erreur lors du marquage de la notification:', error);
      toast.error("Erreur lors du marquage de la notification");
    }
  });
}

// Hook pour marquer toutes les notifications client comme lues
export function useMarkAllClientNotificationsAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const user = await getCurrentUser();
      if (!user?.client_id) throw new Error('Client not found');
      
      const { data, error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('client_id', user.client_id)
        .eq('is_read', false)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['client-notifications', 'unread-count'] });
      toast.success("Toutes les notifications ont été marquées comme lues");
    },
    onError: (error) => {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
      toast.error("Erreur lors du marquage des notifications");
    }
  });
}