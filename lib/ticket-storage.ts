import { supabase } from './supabase';

export interface TicketUploadResult {
  path: string;
  url: string;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  nom: string;
  type: string;
  url: string;
  taille: number;
  storage_path: string;
  uploaded_by_client_id: string;
  created_at: string;
}

/**
 * Upload a file for ticket attachment
 */
export async function uploadTicketAttachment(
  file: File,
  ticketId: string,
  clientId: string
): Promise<TicketUploadResult> {
  try {
    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error(`Le fichier ${file.name} est trop volumineux (max 10MB)`);
    }

    // Allowed file types for ticket attachments
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Type de fichier non supporté: ${file.type}`);
    }

    // Generate file path: ticketId/attachmentId/filename
    const attachmentId = generateAttachmentId();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${attachmentId}.${fileExtension}`;
    const filePath = `${ticketId}/${attachmentId}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('ticket-attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Erreur d'upload: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('ticket-attachments')
      .getPublicUrl(filePath);

    return {
      path: filePath,
      url: urlData.publicUrl
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

/**
 * Save ticket attachment metadata to database
 */
export async function saveTicketAttachment(
  ticketId: string,
  file: File,
  uploadResult: TicketUploadResult,
  clientId: string
): Promise<TicketAttachment> {
  try {
    const { data, error } = await supabase
      .from('ticket_attachments')
      .insert({
        ticket_id: ticketId,
        nom: file.name,
        type: file.type,
        url: uploadResult.url,
        taille: file.size,
        storage_path: uploadResult.path,
        uploaded_by_client_id: clientId
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur de sauvegarde: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Save attachment error:', error);
    throw error;
  }
}

/**
 * Delete a ticket attachment
 */
export async function deleteTicketAttachment(attachmentId: string): Promise<void> {
  try {
    // Get attachment info first
    const { data: attachment, error: fetchError } = await supabase
      .from('ticket_attachments')
      .select('storage_path')
      .eq('id', attachmentId)
      .single();

    if (fetchError) throw fetchError;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('ticket-attachments')
      .remove([attachment.storage_path]);

    if (storageError) {
      throw new Error(`Erreur de suppression storage: ${storageError.message}`);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('ticket_attachments')
      .delete()
      .eq('id', attachmentId);

    if (dbError) {
      throw new Error(`Erreur de suppression DB: ${dbError.message}`);
    }
  } catch (error) {
    console.error('Delete attachment error:', error);
    throw error;
  }
}

/**
 * Get ticket attachments
 */
export async function getTicketAttachments(ticketId: string): Promise<TicketAttachment[]> {
  try {
    const { data, error } = await supabase
      .from('ticket_attachments')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get attachments error:', error);
    throw error;
  }
}

/**
 * Generate unique attachment ID
 */
export function generateAttachmentId(): string {
  return `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}