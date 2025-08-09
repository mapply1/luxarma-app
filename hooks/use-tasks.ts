"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Task } from '@/types';
import { toast } from 'sonner';

export function useTasks(projectId?: string) {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('id, titre, description, statut, priorite, milestone_id, assignee, date_echeance, created_at, updated_at')
        .eq('projet_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
  });
}

export function useAllTasks() {
  return useQuery({
    queryKey: ['all-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          id,
          titre,
          description,
          statut,
          priorite,
          assignee,
          date_echeance,
          created_at,
          updated_at,
          projet_id,
          milestone_id,
          project:projects(id, titre, client:clients(prenom, nom)),
          milestone:milestones(titre)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', newTask.projet_id] });
      queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
      toast.success("Tâche créée avec succès");
    },
    onError: (error) => {
      console.error('Erreur lors de la création de la tâche:', error);
      toast.error("Erreur lors de la création de la tâche");
    }
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', updatedTask.projet_id] });
      queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
      toast.success("Tâche mise à jour avec succès");
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
      toast.error("Erreur lors de la mise à jour de la tâche");
    }
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      return taskId;
    },
    onSuccess: (taskId) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
      toast.success("Tâche supprimée avec succès");
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression de la tâche:', error);
      toast.error("Erreur lors de la suppression de la tâche");
    }
  });
}