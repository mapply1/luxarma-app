"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Milestone } from '@/types';
import { toast } from 'sonner';

export function useMilestones(projectId?: string) {
  return useQuery({
    queryKey: ['milestones', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('milestones')
        .select('id, titre, description, statut, date_prevue, date_completee, ordre, created_at, updated_at')
        .eq('projet_id', projectId)
        .order('ordre');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!projectId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 15 * 60 * 1000,
  });
}

export function useMilestone(milestoneId: string) {
  return useQuery({
    queryKey: ['milestones', milestoneId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('milestones')
        .select(`
          id,
          titre,
          description,
          statut,
          date_prevue,
          date_completee,
          ordre,
          projet_id,
          created_at,
          updated_at,
          project:projects(
            id,
            titre,
            client:clients(id, prenom, nom, email)
          )
        `)
        .eq('id', milestoneId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!milestoneId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useMilestoneTasks(milestoneId?: string) {
  return useQuery({
    queryKey: ['milestone-tasks', milestoneId],
    queryFn: async () => {
      if (!milestoneId) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('milestone_id', milestoneId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!milestoneId,
  });
}

export function useCreateMilestone() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (milestoneData: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('milestones')
        .insert(milestoneData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (newMilestone) => {
      queryClient.invalidateQueries({ queryKey: ['milestones', newMilestone.projet_id] });
      toast.success("Jalon créé avec succès");
    },
    onError: (error) => {
      console.error('Erreur lors de la création du jalon:', error);
      toast.error("Erreur lors de la création du jalon");
    }
  });
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Milestone> }) => {
      const { data, error } = await supabase
        .from('milestones')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (updatedMilestone) => {
      queryClient.invalidateQueries({ queryKey: ['milestones', updatedMilestone.projet_id] });
      queryClient.invalidateQueries({ queryKey: ['milestones', updatedMilestone.id] });
      toast.success("Jalon mis à jour avec succès");
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour du jalon:', error);
      toast.error("Erreur lors de la mise à jour du jalon");
    }
  });
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (milestoneId: string) => {
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', milestoneId);
      
      if (error) throw error;
      return milestoneId;
    },
    onSuccess: (milestoneId) => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      toast.success("Jalon supprimé avec succès");
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression du jalon:', error);
      toast.error("Erreur lors de la suppression du jalon");
    }
  });
}