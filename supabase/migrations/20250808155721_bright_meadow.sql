/*
  # Add missing storage_path column to documents table

  1. Changes
    - Add storage_path column to documents table to track file location in Supabase Storage
    - This column stores the path used in the storage bucket for easy file management

  2. Structure
    - storage_path will contain: "projectId/documentId/filename"
    - Allows proper file organization and cleanup
*/

-- Add storage_path column to documents table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'storage_path'
  ) THEN
    ALTER TABLE documents ADD COLUMN storage_path text;
  END IF;
END $$;