"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Ticket } from '@/types';
import { toast } from 'sonner';

export function useTickets(projectId?: string) {
  return useQuery({
    queryKey: ['tickets', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('tickets')
        .select('id, titre, description, statut, priorite, created_by, created_at, updated_at')
        .eq('projet_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!projectId,
    staleTime: 1 * 60 * 1000, // 1 minute - tickets are dynamic
    gcTime: 5 * 60 * 1000,
  });
}

export function useAllTickets() {
  return useQuery({
    queryKey: ['all-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id,
          titre,
          description,
          statut,
          priorite,
          created_by,
          created_at,
          updated_at,
          projet_id,
          project:projects(id, titre, client:clients(prenom, nom))
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (ticketData: Omit<Ticket, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('tickets')
        .insert(ticketData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (newTicket) => {
      queryClient.invalidateQueries({ queryKey: ['tickets', newTicket.projet_id] });
      queryClient.invalidateQueries({ queryKey: ['all-tickets'] });
      toast.success("Ticket créé avec succès");
    },
    onError: (error) => {
      console.error('Erreur lors de la création du ticket:', error);
      toast.error("Erreur lors de la création du ticket");
    }
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Ticket> }) => {
      const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (updatedTicket) => {
      queryClient.invalidateQueries({ queryKey: ['tickets', updatedTicket.projet_id] });
      queryClient.invalidateQueries({ queryKey: ['all-tickets'] });
      toast.success("Ticket mis à jour avec succès");
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour du ticket:', error);
      toast.error("Erreur lors de la mise à jour du ticket");
    }
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (ticketId: string) => {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticketId);
      
      if (error) throw error;
      return ticketId;
    },
    onSuccess: (ticketId) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['all-tickets'] });
      toast.success("Ticket supprimé avec succès");
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression du ticket:', error);
      toast.error("Erreur lors de la suppression du ticket");
    }
  });
}