/*
  # Create core tables for Luxarma project management platform

  1. New Tables
    - `clients`
      - `id` (uuid, primary key)
      - `prenom` (text)
      - `nom` (text)
      - `email` (text, unique)
      - `entreprise` (text, optional)
      - `telephone` (text, optional)
      - `ville` (text, optional)
      - `linkedin_url` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `projects`
      - `id` (uuid, primary key)
      - `titre` (text)
      - `description` (text)
      - `client_id` (uuid, foreign key to clients)
      - `statut` (enum: en_attente, en_cours, en_revision, termine, suspendu)
      - `date_debut` (date)
      - `date_fin_prevue` (date)
      - `date_fin_reelle` (date, optional)
      - `budget` (numeric, optional)
      - `liens_admin` (text array, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `milestones`
      - `id` (uuid, primary key)
      - `projet_id` (uuid, foreign key to projects)
      - `titre` (text)
      - `description` (text)
      - `statut` (enum: a_faire, en_cours, termine)
      - `date_prevue` (date)
      - `date_completee` (date, optional)
      - `ordre` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `tasks`
      - `id` (uuid, primary key)
      - `projet_id` (uuid, foreign key to projects)
      - `milestone_id` (uuid, optional foreign key to milestones)
      - `titre` (text)
      - `description` (text, optional)
      - `statut` (enum: a_faire, en_cours, termine)
      - `priorite` (enum: basse, moyenne, haute)
      - `assignee` (text, optional)
      - `date_echeance` (date, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated admin users to manage all data
    - Add policies for authenticated client users to read their own project data
*/

-- Create custom types
CREATE TYPE project_status AS ENUM ('en_attente', 'en_cours', 'en_revision', 'termine', 'suspendu');
CREATE TYPE milestone_status AS ENUM ('a_faire', 'en_cours', 'termine');
CREATE TYPE task_status AS ENUM ('a_faire', 'en_cours', 'termine');
CREATE TYPE task_priority AS ENUM ('basse', 'moyenne', 'haute');

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prenom text NOT NULL,
  nom text NOT NULL,
  email text UNIQUE NOT NULL,
  entreprise text,
  telephone text,
  ville text,
  linkedin_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titre text NOT NULL,
  description text NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  statut project_status DEFAULT 'en_attente',
  date_debut date NOT NULL,
  date_fin_prevue date NOT NULL,
  date_fin_reelle date,
  budget numeric,
  liens_admin text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create milestones table
CREATE TABLE IF NOT EXISTS milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projet_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  titre text NOT NULL,
  description text NOT NULL,
  statut milestone_status DEFAULT 'a_faire',
  date_prevue date NOT NULL,
  date_completee date,
  ordre integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projet_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id uuid REFERENCES milestones(id) ON DELETE SET NULL,
  titre text NOT NULL,
  description text,
  statut task_status DEFAULT 'a_faire',
  priorite task_priority DEFAULT 'moyenne',
  assignee text,
  date_echeance date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for clients table
CREATE POLICY "Admins can manage all clients"
  ON clients
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Clients can read their own data"
  ON clients
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Create policies for projects table
CREATE POLICY "Admins can manage all projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Clients can read their own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (client_id::text = auth.uid()::text);

-- Create policies for milestones table
CREATE POLICY "Admins can manage all milestones"
  ON milestones
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Clients can read milestones of their projects"
  ON milestones
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = milestones.projet_id 
      AND projects.client_id::text = auth.uid()::text
    )
  );

-- Create policies for tasks table
CREATE POLICY "Admins can manage all tasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Clients can read tasks of their projects"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = tasks.projet_id 
      AND projects.client_id::text = auth.uid()::text
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_milestones_projet_id ON milestones(projet_id);
CREATE INDEX IF NOT EXISTS idx_tasks_projet_id ON tasks(projet_id);
CREATE INDEX IF NOT EXISTS idx_tasks_milestone_id ON tasks(milestone_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_clients_updated_at 
  BEFORE UPDATE ON clients 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at 
  BEFORE UPDATE ON milestones 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON tasks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();