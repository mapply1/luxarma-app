/*
  # Fix RLS policies for admin access

  1. Changes
    - Drop all existing conflicting policies
    - Create new policies that properly check admin role from JWT
    - Ensure admin users can manage all data

  2. Security
    - Only users with 'admin' role in JWT can manage clients, prospects, projects
    - Client users can only read their own project data
*/

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage all clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can manage all clients" ON clients;
DROP POLICY IF EXISTS "Clients can read their own data" ON clients;

DROP POLICY IF EXISTS "Admins can manage all projects" ON projects;
DROP POLICY IF EXISTS "Clients can read their own projects" ON projects;

DROP POLICY IF EXISTS "Admins can manage all prospects" ON prospects;
DROP POLICY IF EXISTS "Authenticated users can manage all prospects" ON prospects;
DROP POLICY IF EXISTS "Admins can manage all prospect interactions" ON interactions_prospects;

DROP POLICY IF EXISTS "Admins can manage all milestones" ON milestones;
DROP POLICY IF EXISTS "Clients can read milestones of their projects" ON milestones;

DROP POLICY IF EXISTS "Admins can manage all tasks" ON tasks;
DROP POLICY IF EXISTS "Clients can read tasks of their projects" ON tasks;

DROP POLICY IF EXISTS "Admins can manage all tickets" ON tickets;
DROP POLICY IF EXISTS "Clients can manage tickets of their projects" ON tickets;

DROP POLICY IF EXISTS "Admins can manage all documents" ON documents;
DROP POLICY IF EXISTS "Clients can read documents of their projects" ON documents;

DROP POLICY IF EXISTS "Admins can read all reviews" ON reviews;
DROP POLICY IF EXISTS "Clients can manage reviews of their projects" ON reviews;

-- Create new policies for clients table
CREATE POLICY "Admin can manage all clients"
  ON clients
  FOR ALL
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
  );

CREATE POLICY "Client can read own data"
  ON clients
  FOR SELECT
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'client'
    AND id::text = COALESCE((auth.jwt() -> 'user_metadata' ->> 'client_id'), '')
  );

-- Create new policies for projects table
CREATE POLICY "Admin can manage all projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
  );

CREATE POLICY "Client can read own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'client'
    AND client_id::text = COALESCE((auth.jwt() -> 'user_metadata' ->> 'client_id'), '')
  );

-- Create new policies for prospects table
CREATE POLICY "Admin can manage all prospects"
  ON prospects
  FOR ALL
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
  );

-- Create new policies for interactions_prospects table
CREATE POLICY "Admin can manage all prospect interactions"
  ON interactions_prospects
  FOR ALL
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
  );

-- Create new policies for milestones table
CREATE POLICY "Admin can manage all milestones"
  ON milestones
  FOR ALL
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
  );

CREATE POLICY "Client can read milestones of own projects"
  ON milestones
  FOR SELECT
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'client'
    AND EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = milestones.projet_id 
      AND projects.client_id::text = COALESCE((auth.jwt() -> 'user_metadata' ->> 'client_id'), '')
    )
  );

-- Create new policies for tasks table
CREATE POLICY "Admin can manage all tasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
  );

CREATE POLICY "Client can read tasks of own projects"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'client'
    AND EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = tasks.projet_id 
      AND projects.client_id::text = COALESCE((auth.jwt() -> 'user_metadata' ->> 'client_id'), '')
    )
  );

-- Create new policies for tickets table
CREATE POLICY "Admin can manage all tickets"
  ON tickets
  FOR ALL
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
  );

CREATE POLICY "Client can manage tickets of own projects"
  ON tickets
  FOR ALL
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'client'
    AND EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = tickets.projet_id 
      AND projects.client_id::text = COALESCE((auth.jwt() -> 'user_metadata' ->> 'client_id'), '')
    )
  );

-- Create new policies for documents table
CREATE POLICY "Admin can manage all documents"
  ON documents
  FOR ALL
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
  );

CREATE POLICY "Client can read documents of own projects"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'client'
    AND EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = documents.projet_id 
      AND projects.client_id::text = COALESCE((auth.jwt() -> 'user_metadata' ->> 'client_id'), '')
    )
  );

-- Create new policies for reviews table
CREATE POLICY "Admin can read all reviews"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
  );

CREATE POLICY "Client can manage reviews of own projects"
  ON reviews
  FOR ALL
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'client'
    AND EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = reviews.projet_id 
      AND projects.client_id::text = COALESCE((auth.jwt() -> 'user_metadata' ->> 'client_id'), '')
    )
  );