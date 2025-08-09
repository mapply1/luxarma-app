"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Client } from '@/types';
import { toast } from 'sonner';

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, prenom, nom, email, entreprise, telephone, ville, created_at, updated_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,
  });
}

export function useClient(clientId: string) {
  return useQuery({
    queryKey: ['clients', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, prenom, nom, email, entreprise, telephone, ville, linkedin_url, created_at, updated_at')
        .eq('id', clientId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
    staleTime: 10 * 60 * 1000, // 10 minutes - client info rarely changes
    gcTime: 60 * 60 * 1000,
  });
}

export function useClientProjects(clientId: string) {
  return useQuery({
    queryKey: ['clients', clientId, 'projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, titre, statut, date_debut, date_fin_prevue, budget, created_at, updated_at')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!clientId,
    staleTime: 3 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success("Client supprimé avec succès");
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression du client:', error);
      toast.error("Erreur lors de la suppression du client");
    }
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success("Client créé avec succès");
    },
    onError: (error) => {
      console.error('Erreur lors de la création du client:', error);
      toast.error("Erreur lors de la création du client");
    }
  });
}