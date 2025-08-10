"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Prospect } from '@/types';
import { toast } from 'sonner';

export function useProspects() {
  return useQuery({
    queryKey: ['prospects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prospects')
        .select(`
          id,
          nom,
          prenom,
          email,
          telephone,
          entreprise,
          ville,
          type_demande,
          budget_range,
          echeance_souhaitee,
          description_projet,
          statut,
          source,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
  });
}

export function useProspect(prospectId: string) {
  return useQuery({
    queryKey: ['prospects', prospectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prospects')
        .select(`
          id,
          nom,
          prenom,
          email,
          telephone,
          entreprise,
          ville,
          type_demande,
          budget_range,
          echeance_souhaitee,
          description_projet,
          statut,
          source,
          resume_auto,
          notes_internes,
          discovery_call_resume,
          proposal_doc_url,
          quote_doc_url,
          created_at,
          updated_at
        `)
        .eq('id', prospectId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!prospectId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useCreateProspect() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (prospectData: Omit<Prospect, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('prospects')
        .insert([prospectData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
      toast.success("Prospect créé avec succès");
    },
    onError: (error) => {
      console.error('Erreur lors de la création du prospect:', error);
      toast.error("Erreur lors de la création du prospect");
    }
  });
}

export function useDeleteProspect() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (prospectId: string) => {
      const { error } = await supabase
        .from('prospects')
        .delete()
        .eq('id', prospectId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
      toast.success("Prospect supprimé avec succès");
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression du prospect:', error);
      toast.error("Erreur lors de la suppression du prospect");
    }
  });
}

export function useUpdateProspectStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, statut }: { id: string; statut: Prospect['statut'] }) => {
      const { data, error } = await supabase
        .from('prospects')
        .update({ statut })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  });
}

export function useUpdateProspect() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Prospect> }) => {
      const { data, error } = await supabase
        .from('prospects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
      toast.success("Prospect mis à jour avec succès");
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour du prospect:', error);
      toast.error("Erreur lors de la mise à jour du prospect");
    }
  });
}