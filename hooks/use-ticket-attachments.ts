"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { TicketAttachment } from '@/types';
import { getTicketAttachments, deleteTicketAttachment } from '@/lib/ticket-storage';
import { toast } from 'sonner';

// Hook pour récupérer les pièces jointes d'un ticket
export function useTicketAttachments(ticketId?: string) {
  return useQuery({
    queryKey: ['ticket-attachments', ticketId],
    queryFn: async () => {
      if (!ticketId) return [];
      return await getTicketAttachments(ticketId);
    },
    enabled: !!ticketId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
  });
}

// Hook pour supprimer une pièce jointe
export function useDeleteTicketAttachment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (attachmentId: string) => {
      await deleteTicketAttachment(attachmentId);
      return attachmentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-attachments'] });
      toast.success("Pièce jointe supprimée avec succès");
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression de la pièce jointe:', error);
      toast.error("Erreur lors de la suppression de la pièce jointe");
    }
  });
}