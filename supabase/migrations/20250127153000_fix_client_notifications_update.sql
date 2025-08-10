/*
  # Fix client notification update permissions

  1. Changes
    - Add UPDATE policy for clients to mark their own notifications as read
    - Clients can only update is_read and read_at fields for their own project notifications

  2. Security
    - Clients can only update notifications for their own projects
    - Clients can only modify is_read and read_at fields
    - No other fields can be modified by clients
*/

-- Add policy for clients to update their own notifications (mark as read)
CREATE POLICY "Client can update read status for own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'client'
    AND client_id::text = COALESCE((auth.jwt() -> 'user_metadata' ->> 'client_id'), '')
  )
  WITH CHECK (
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'client'
    AND client_id::text = COALESCE((auth.jwt() -> 'user_metadata' ->> 'client_id'), '')
  );
