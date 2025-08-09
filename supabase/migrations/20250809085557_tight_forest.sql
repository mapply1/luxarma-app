/*
  # Fix notification logic for client visibility

  1. Changes
    - Update RLS policies so clients can see notifications about their projects
    - Admin notifications are now filtered to only show client-generated actions
    - Client notifications show admin actions on their projects

  2. Security
    - Clients can only see notifications for their own projects
    - Admins can see all notifications but filtered appropriately in the UI
*/

-- Add policy for clients to see their own project notifications
CREATE POLICY "Client can read notifications for own projects"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'client'
    AND client_id::text = COALESCE((auth.jwt() -> 'user_metadata' ->> 'client_id'), '')
  );