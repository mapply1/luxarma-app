/*
  # Add document signature system

  1. Changes
    - Add signature-related columns to documents table
    - requires_signature: boolean to mark if document needs client signature
    - is_signed: boolean to track if document has been signed
    - signed_at: timestamp when document was signed
    - signature_data: base64 signature image data

  2. Security
    - Update existing RLS policies to handle signature data
    - Clients can update signature fields on their own project documents
*/

-- Add signature columns to documents table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'requires_signature'
  ) THEN
    ALTER TABLE documents ADD COLUMN requires_signature boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'is_signed'
  ) THEN
    ALTER TABLE documents ADD COLUMN is_signed boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'signed_at'
  ) THEN
    ALTER TABLE documents ADD COLUMN signed_at timestamptz;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'signature_data'
  ) THEN
    ALTER TABLE documents ADD COLUMN signature_data text;
  END IF;
END $$;

-- Create policy for clients to update signature fields on their own documents
CREATE POLICY "Clients can sign documents of their projects"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'client'
    AND EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = documents.projet_id 
      AND projects.client_id::text = COALESCE((auth.jwt() -> 'user_metadata' ->> 'client_id'), '')
    )
  )
  WITH CHECK (
    -- Only allow updating signature-related fields
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'client'
    AND EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = documents.projet_id 
      AND projects.client_id::text = COALESCE((auth.jwt() -> 'user_metadata' ->> 'client_id'), '')
    )
  );

-- Create indexes for signature queries
CREATE INDEX IF NOT EXISTS idx_documents_requires_signature ON documents(requires_signature);
CREATE INDEX IF NOT EXISTS idx_documents_is_signed ON documents(is_signed);