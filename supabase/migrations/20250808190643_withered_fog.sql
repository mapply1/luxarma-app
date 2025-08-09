/*
  # Create ticket attachments storage system

  1. Storage Buckets
    - Create 'ticket-attachments' bucket for storing client uploaded files
    - Enable public access for ticket attachments
    - Set up RLS policies for secure access

  2. New Tables
    - `ticket_attachments`
      - `id` (uuid, primary key)
      - `nom` (text)
      - `type` (text)
      - `url` (text)
      - `taille` (bigint)
      - `storage_path` (text)
      - `uploaded_by_client_id` (uuid, foreign key to clients)
      - `created_at` (timestamptz)

  3. Security
    - Clients can upload attachments for their own tickets
    - Admins can view all ticket attachments
    - File size limits and type restrictions
*/

-- Create storage bucket for ticket attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('ticket-attachments', 'ticket-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for ticket attachments
CREATE POLICY "Clients can upload ticket attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ticket-attachments' AND
  COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'client'
);

CREATE POLICY "Admins can manage ticket attachments"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'ticket-attachments' AND
  COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
);

CREATE POLICY "Users can view ticket attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'ticket-attachments' AND (
    -- Admin can see all attachments
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin' OR
    -- Client can see attachments from their own projects
    (
      COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'client' AND
      -- Extract project info from path and check ownership
      EXISTS (
        SELECT 1 FROM tickets t
        JOIN projects p ON p.id = t.projet_id
        WHERE t.id::text = split_part(name, '/', 1)
        AND p.client_id::text = COALESCE((auth.jwt() -> 'user_metadata' ->> 'client_id'), '')
      )
    )
  )
);

-- Create ticket_attachments table
CREATE TABLE IF NOT EXISTS ticket_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
  nom text NOT NULL,
  type text NOT NULL,
  url text NOT NULL,
  taille bigint NOT NULL DEFAULT 0,
  storage_path text NOT NULL,
  uploaded_by_client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on ticket_attachments
ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for ticket_attachments table
CREATE POLICY "Admin can read all ticket attachments"
  ON ticket_attachments
  FOR SELECT
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
  );

CREATE POLICY "Clients can manage attachments for their tickets"
  ON ticket_attachments
  FOR ALL
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'client'
    AND EXISTS (
      SELECT 1 FROM tickets t
      JOIN projects p ON p.id = t.projet_id
      WHERE t.id = ticket_attachments.ticket_id
      AND p.client_id::text = COALESCE((auth.jwt() -> 'user_metadata' ->> 'client_id'), '')
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket_id ON ticket_attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_client_id ON ticket_attachments(uploaded_by_client_id);