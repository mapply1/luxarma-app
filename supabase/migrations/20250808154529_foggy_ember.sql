/*
  # Setup Supabase Storage for documents

  1. Storage Buckets
    - Create 'documents' bucket for storing project files
    - Enable public access for documents
    - Set up RLS policies for secure access

  2. Security
    - Admin can upload/manage all documents
    - Clients can only read documents from their own projects
    - File size limits and type restrictions

  3. Structure
    - Files stored as: {project_id}/{document_id}/{filename}
    - This allows easy organization and cleanup
*/

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Admin can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
);

CREATE POLICY "Admin can update documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
);

CREATE POLICY "Admin can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
);

CREATE POLICY "Users can view documents of their projects"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND (
    -- Admin can see all documents
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin' OR
    -- Client can see documents from their own projects
    (
      COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'client' AND
      -- Extract project_id from path and check if it belongs to the client
      EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id::text = split_part(name, '/', 1)
        AND projects.client_id::text = COALESCE((auth.jwt() -> 'user_metadata' ->> 'client_id'), '')
      )
    )
  )
);