"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Comment } from '@/types';
import { toast } from 'sonner';

// Hook pour récupérer les commentaires d'une tâche
export function useTaskComments(taskId?: string) {
  return useQuery({
    queryKey: ['comments', 'task', taskId],
    queryFn: async () => {
      if (!taskId) return [];
      
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          updated_at,
          client:clients(id, prenom, nom)
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!taskId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
  });
}

// Hook pour récupérer les commentaires d'un jalon
export function useMilestoneComments(milestoneId?: string) {
  return useQuery({
    queryKey: ['comments', 'milestone', milestoneId],
    queryFn: async () => {
      if (!milestoneId) return [];
      
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          updated_at,
          client:clients(id, prenom, nom)
        `)
        .eq('milestone_id', milestoneId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!milestoneId,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

// Hook pour créer un commentaire
export function useCreateComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (commentData: Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'client'>) => {
      const { data, error } = await supabase
        .from('comments')
        .insert(commentData)
        .select('*, client:clients(*)')
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (newComment) => {
      // Invalide les caches appropriés
      if (newComment.task_id) {
        queryClient.invalidateQueries({ queryKey: ['comments', 'task', newComment.task_id] });
      }
      if (newComment.milestone_id) {
        queryClient.invalidateQueries({ queryKey: ['comments', 'milestone', newComment.milestone_id] });
      }
      toast.success("Commentaire ajouté avec succès !");
    },
    onError: (error) => {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      toast.error("Erreur lors de l'ajout du commentaire");
    }
  });
}

// Hook pour récupérer tous les commentaires d'un projet (pour l'admin)
export function useProjectComments(projectId?: string) {
  return useQuery({
    queryKey: ['comments', 'project', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          task_id,
          milestone_id,
          created_at,
          updated_at,
          client:clients(*),
          task:tasks(titre),
          milestone:milestones(titre)
        `)
        .eq('projet_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}