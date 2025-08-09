@@ .. @@
-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projet_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  nom text NOT NULL,
  type text NOT NULL,
  url text NOT NULL,
+  storage_path text,
  taille bigint NOT NULL DEFAULT 0,
  uploaded_by user_role DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);