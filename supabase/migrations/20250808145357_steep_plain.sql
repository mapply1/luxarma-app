/*
  # Add comments system for tasks and milestones

  1. New Tables
    - `comments`
      - `id` (uuid, primary key)
      - `projet_id` (uuid, foreign key to projects)
      - `task_id` (uuid, optional foreign key to tasks)
      - `milestone_id` (uuid, optional foreign key to milestones)
      - `content` (text)
      - `created_by_client_id` (uuid, foreign key to clients)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on comments table
    - Clients can create and read comments on their own projects
    - Admins can read all comments

  3. Constraints
    - Either task_id or milestone_id must be set (not both, not neither)
*/

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projet_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  milestone_id uuid REFERENCES milestones(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_by_client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraint: exactly one of task_id or milestone_id must be set
  CONSTRAINT comments_target_check CHECK (
    (task_id IS NOT NULL AND milestone_id IS NULL) OR 
    (task_id IS NULL AND milestone_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies for comments table
CREATE POLICY "Admin can read all comments"
  ON comments
  FOR SELECT
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
  );

CREATE POLICY "Client can manage comments on own projects"
  ON comments
  FOR ALL
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'client'
    AND EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = comments.projet_id 
      AND projects.client_id::text = COALESCE((auth.jwt() -> 'user_metadata' ->> 'client_id'), '')
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_comments_task_id ON comments(task_id);
CREATE INDEX IF NOT EXISTS idx_comments_milestone_id ON comments(milestone_id);
CREATE INDEX IF NOT EXISTS idx_comments_projet_id ON comments(projet_id);
CREATE INDEX IF NOT EXISTS idx_comments_client_id ON comments(created_by_client_id);

-- Create trigger for updated_at
CREATE TRIGGER update_comments_updated_at 
  BEFORE UPDATE ON comments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();