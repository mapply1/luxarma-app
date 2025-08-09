"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Project } from '@/types';
import { toast } from 'sonner';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          titre,
          description,
          statut,
          date_debut,
          date_fin_prevue,
          budget,
          created_at,
          updated_at,
          client:clients(id, prenom, nom, email, entreprise)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 3 * 60 * 1000, // 3 minutes - projects don't change that often
    gcTime: 15 * 60 * 1000,
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          titre,
          description,
          statut,
          date_debut,
          date_fin_prevue,
          date_fin_reelle,
          budget,
          liens_admin,
          client_id,
          created_at,
          updated_at,
          client:clients(id, prenom, nom, email, entreprise, telephone, ville)
        `)
        .eq('id', projectId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success("Projet supprimé avec succès");
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression du projet:', error);
      toast.error("Erreur lors de la suppression du projet");
    }
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Project> }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select('*, client:clients(*)')
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.setQueryData(['projects', data.id], data);
      toast.success("Projet mis à jour avec succès");
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error("Erreur lors de la mise à jour du projet");
    }
  });
}