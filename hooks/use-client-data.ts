"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Project, Milestone, Task, Document, Ticket, Review } from '@/types';
import { toast } from 'sonner';

// Hook pour récupérer le client connecté
export function useCurrentClient() {
  return useQuery({
    queryKey: ['current-client'],
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user?.client_id) return null;
      
      const { data, error } = await supabase
        .from('clients')
        .select('id, prenom, nom, email, entreprise, telephone, ville')
        .eq('id', user.client_id)
        .single();
      
      if (error) throw error;
      return data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - client info rarely changes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

// Hook pour récupérer tous les projets du client connecté
export function useCurrentClientProjects() {
  return useQuery({
    queryKey: ['current-client-projects'],
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user?.client_id) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('id, titre, description, statut, date_debut, date_fin_prevue, created_at')
        .eq('client_id', user.client_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

// Hook pour récupérer le projet du client connecté
export function useClientProject(projectId?: string) {
  return useQuery({
    queryKey: ['client-project', projectId],
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user?.client_id) return null;
      
      // If a specific project ID is provided, get that project
      if (projectId) {
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
            client:clients(id, prenom, nom, email, entreprise)
          `)
          .eq('id', projectId)
          .eq('client_id', user.client_id)
          .single();
        
        if (error) throw error;
        return data;
      }
      
      // Otherwise get the most recent project
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
          client:clients(id, prenom, nom, email, entreprise)
        `)
        .eq('client_id', user.client_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook pour récupérer les jalons du projet client
export function useClientMilestones(projectId?: string) {
  return useQuery({
    queryKey: ['client-milestones', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('milestones')
        .select('id, titre, description, statut, date_prevue, date_completee, ordre')
        .eq('projet_id', projectId)
        .order('ordre');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,
  });
}

// Hook pour récupérer les tâches du projet client
export function useClientTasks(projectId?: string) {
  return useQuery({
    queryKey: ['client-tasks', projectId],
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

// Hook pour récupérer les documents du projet client
export function useClientDocuments(projectId?: string) {
  return useQuery({
    queryKey: ['client-documents', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('documents')
        .select('id, nom, type, url, taille, uploaded_by, requires_signature, is_signed, signed_at, created_at')
        .eq('projet_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes (documents change less frequently)
    gcTime: 15 * 60 * 1000,
  });
}

// Hook pour récupérer les tickets du projet client
export function useClientTickets(projectId?: string) {
  return useQuery({
    queryKey: ['client-tickets', projectId],
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
    staleTime: 1 * 60 * 1000, // 1 minute (tickets are more dynamic)
    gcTime: 5 * 60 * 1000,
  });
}

// Hook pour récupérer les reviews du projet client
export function useClientReviews(projectId?: string) {
  return useQuery({
    queryKey: ['client-reviews', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('reviews')
        .select('id, note, commentaire, created_at')
        .eq('projet_id', projectId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!projectId,
    staleTime: 10 * 60 * 1000, // 10 minutes (reviews rarely change)
    gcTime: 30 * 60 * 1000,
  });
}

// Hook pour créer un ticket
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
      // Invalide et met à jour le cache des tickets
      queryClient.invalidateQueries({ queryKey: ['client-tickets', newTicket.projet_id] });
      toast.success("Ticket créé avec succès !");
    },
    onError: (error) => {
      console.error('Erreur lors de la création du ticket:', error);
      toast.error("Erreur lors de la création du ticket");
    }
  });
}

// Hook pour créer une review
export function useCreateReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reviewData: Omit<Review, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('reviews')
        .insert(reviewData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (newReview) => {
      // Invalide et met à jour le cache des reviews
      queryClient.invalidateQueries({ queryKey: ['client-reviews', newReview.projet_id] });
      toast.success("Votre évaluation a été envoyée avec succès !");
    },
    onError: (error) => {
      console.error('Erreur lors de l\'envoi de l\'évaluation:', error);
      toast.error("Erreur lors de l'envoi de votre évaluation");
    }
  });
}

// Hook pour récupérer un jalon spécifique
export function useClientMilestone(milestoneId?: string) {
  return useQuery({
    queryKey: ['client-milestone', milestoneId],
    queryFn: async () => {
      if (!milestoneId) return null;
      
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('id', milestoneId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!milestoneId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook pour récupérer les tâches d'un jalon spécifique
export function useClientMilestoneTasks(milestoneId?: string) {
  return useQuery({
    queryKey: ['client-milestone-tasks', milestoneId],
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
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook pour récupérer les documents qui nécessitent une signature
export function useDocumentsToSign(projectId?: string) {
  return useQuery({
    queryKey: ['client-documents-to-sign', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('projet_id', projectId)
          .eq('requires_signature', true)
          .eq('is_signed', false)
          .order('created_at', { ascending: false });
        
        if (error) {
          // If columns don't exist yet, return empty array
          console.log('Documents signature columns not available yet:', error.message);
          return [];
        }
        return data || [];
      } catch (error) {
        // Fallback: return empty array if signature features not available
        console.log('Signature feature not available yet:', error);
        return [];
      }
    },
    enabled: !!projectId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
  });
}

// Hook pour signer un document
export function useSignDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ documentId, signatureData }: { documentId: string; signatureData: string }) => {
      const { data, error } = await supabase
        .from('documents')
        .update({
          is_signed: true,
          signed_at: new Date().toISOString(),
          signature_data: signatureData
        })
        .eq('id', documentId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalide plusieurs caches
      queryClient.invalidateQueries({ queryKey: ['client-documents'] });
      queryClient.invalidateQueries({ queryKey: ['client-documents-to-sign'] });
      toast.success("Document signé avec succès !");
    },
    onError: (error) => {
      console.error('Erreur lors de la signature:', error);
      toast.error("Erreur lors de la signature du document");
    }
  });
}