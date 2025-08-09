import { supabase } from './supabase';

export interface UploadResult {
  path: string;
  url: string;
}

export interface UploadError {
  message: string;
  details?: any;
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  projectId: string
): Promise<UploadResult> {
  try {
    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error(`Le fichier ${file.name} est trop volumineux (max 10MB)`);
    }

    // Allowed file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Type de fichier non supporté: ${file.type}`);
    }

    // Generate file path: projectId/documentId/filename
    const documentId = generateDocumentId();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${documentId}.${fileExtension}`;
    const filePath = `${projectId}/${documentId}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Erreur d'upload: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
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
 * Delete a file from Supabase Storage
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from('documents')
      .remove([filePath]);

    if (error) {
      throw new Error(`Erreur de suppression: ${error.message}`);
    }
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
}

/**
 * Get download URL for a file
 */
export function getDownloadUrl(filePath: string): string {
  const { data } = supabase.storage
    .from('documents')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}

/**
 * Create a download link for a file
 */
export async function createDownloadLink(filePath: string, fileName: string): Promise<void> {
  try {
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) throw error;

    // Create download link
    const link = document.createElement('a');
    link.href = data.signedUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
}

/**
 * Generate unique document ID
 */
export function generateDocumentId(): string {
  // Generate a shorter unique ID for file paths
  return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}