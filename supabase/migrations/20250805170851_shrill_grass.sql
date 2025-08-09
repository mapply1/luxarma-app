/*
  # Create support and CRM tables

  1. New Tables
    - `tickets`
      - `id` (uuid, primary key)
      - `projet_id` (uuid, foreign key to projects)
      - `milestone_id` (uuid, optional foreign key to milestones)
      - `titre` (text)
      - `description` (text)
      - `statut` (enum: ouvert, en_cours, resolu, ferme)
      - `priorite` (enum: basse, moyenne, haute)
      - `created_by` (enum: admin, client)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `documents`
      - `id` (uuid, primary key)
      - `projet_id` (uuid, foreign key to projects)
      - `nom` (text)
      - `type` (text)
      - `url` (text)
      - `taille` (bigint)
      - `uploaded_by` (enum: admin, client)
      - `created_at` (timestamptz)

    - `reviews`
      - `id` (uuid, primary key)
      - `projet_id` (uuid, foreign key to projects)
      - `milestone_id` (uuid, optional foreign key to milestones)
      - `note` (integer, 1-5)
      - `commentaire` (text, optional)
      - `created_at` (timestamptz)

    - `prospects`
      - `id` (uuid, primary key)
      - `nom` (text)
      - `prenom` (text)
      - `email` (text)
      - `telephone` (text, optional)
      - `entreprise` (text, optional)
      - `ville` (text, optional)
      - `type_demande` (enum: site, formation, partenariat, autre)
      - `budget_min` (numeric, optional)
      - `budget_max` (numeric, optional)
      - `echeance_souhaitee` (date, optional)
      - `description_projet` (text)
      - `statut` (enum: nouveau, contacte, qualifie, negocie, converti, perdu, archive)
      - `source` (text)
      - `resume_auto` (text, optional)
      - `notes_internes` (text, optional)
      - `converted_client_id` (uuid, optional foreign key to clients)
      - `converted_project_id` (uuid, optional foreign key to projects)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `interactions_prospects`
      - `id` (uuid, primary key)
      - `prospect_id` (uuid, foreign key to prospects)
      - `type` (enum: email, appel, meeting, note)
      - `titre` (text)
      - `description` (text)
      - `created_at` (timestamptz)
      - `created_by` (text)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for admin and client access
*/

-- Create custom types
CREATE TYPE ticket_status AS ENUM ('ouvert', 'en_cours', 'resolu', 'ferme');
CREATE TYPE user_role AS ENUM ('admin', 'client');
CREATE TYPE demande_type AS ENUM ('site', 'formation', 'partenariat', 'autre');
CREATE TYPE prospect_status AS ENUM ('nouveau', 'contacte', 'qualifie', 'negocie', 'converti', 'perdu', 'archive');
CREATE TYPE interaction_type AS ENUM ('email', 'appel', 'meeting', 'note');

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projet_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id uuid REFERENCES milestones(id) ON DELETE SET NULL,
  titre text NOT NULL,
  description text NOT NULL,
  statut ticket_status DEFAULT 'ouvert',
  priorite task_priority DEFAULT 'moyenne',
  created_by user_role DEFAULT 'client',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projet_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  nom text NOT NULL,
  type text NOT NULL,
  url text NOT NULL,
  taille bigint NOT NULL DEFAULT 0,
  uploaded_by user_role DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projet_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id uuid REFERENCES milestones(id) ON DELETE SET NULL,
  note integer NOT NULL CHECK (note >= 1 AND note <= 5),
  commentaire text,
  created_at timestamptz DEFAULT now()
);

-- Create prospects table
CREATE TABLE IF NOT EXISTS prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  prenom text NOT NULL,
  email text NOT NULL,
  telephone text,
  entreprise text,
  ville text,
  type_demande demande_type NOT NULL,
  budget_min numeric,
  budget_max numeric,
  echeance_souhaitee date,
  description_projet text NOT NULL,
  statut prospect_status DEFAULT 'nouveau',
  source text NOT NULL DEFAULT 'Manuel',
  resume_auto text,
  notes_internes text,
  converted_client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  converted_project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create interactions_prospects table
CREATE TABLE IF NOT EXISTS interactions_prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid REFERENCES prospects(id) ON DELETE CASCADE,
  type interaction_type NOT NULL,
  titre text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by text NOT NULL DEFAULT 'admin'
);

-- Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions_prospects ENABLE ROW LEVEL SECURITY;

-- Create policies for tickets table
CREATE POLICY "Admins can manage all tickets"
  ON tickets
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Clients can manage tickets of their projects"
  ON tickets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = tickets.projet_id 
      AND projects.client_id::text = auth.uid()::text
    )
  );

-- Create policies for documents table
CREATE POLICY "Admins can manage all documents"
  ON documents
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Clients can read documents of their projects"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = documents.projet_id 
      AND projects.client_id::text = auth.uid()::text
    )
  );

-- Create policies for reviews table
CREATE POLICY "Admins can read all reviews"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Clients can manage reviews of their projects"
  ON reviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = reviews.projet_id 
      AND projects.client_id::text = auth.uid()::text
    )
  );

-- Create policies for prospects table (admin only)
CREATE POLICY "Admins can manage all prospects"
  ON prospects
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for interactions_prospects table (admin only)
CREATE POLICY "Admins can manage all prospect interactions"
  ON interactions_prospects
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_projet_id ON tickets(projet_id);
CREATE INDEX IF NOT EXISTS idx_tickets_milestone_id ON tickets(milestone_id);
CREATE INDEX IF NOT EXISTS idx_documents_projet_id ON documents(projet_id);
CREATE INDEX IF NOT EXISTS idx_reviews_projet_id ON reviews(projet_id);
CREATE INDEX IF NOT EXISTS idx_prospects_statut ON prospects(statut);
CREATE INDEX IF NOT EXISTS idx_prospects_type_demande ON prospects(type_demande);
CREATE INDEX IF NOT EXISTS idx_interactions_prospect_id ON interactions_prospects(prospect_id);

-- Create triggers for updated_at
CREATE TRIGGER update_tickets_updated_at 
  BEFORE UPDATE ON tickets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prospects_updated_at 
  BEFORE UPDATE ON prospects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();