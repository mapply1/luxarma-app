/*
  # Create notifications system for admin dashboard

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `type` (enum: comment, ticket, review)
      - `title` (text)
      - `message` (text)
      - `projet_id` (uuid, foreign key to projects)
      - `client_id` (uuid, foreign key to clients)
      - `related_id` (uuid) - ID of the related comment/ticket/review
      - `is_read` (boolean)
      - `created_at` (timestamptz)
      - `read_at` (timestamptz, optional)

  2. Security
    - Enable RLS on notifications table
    - Only admins can read notifications

  3. Functions
    - Function to create notification when comment is added
    - Function to create notification when ticket is created
    - Function to create notification when review is submitted
*/

-- Create notification type enum
CREATE TYPE notification_type AS ENUM ('comment', 'ticket', 'review');

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type notification_type NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  projet_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  related_id uuid NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for notifications table (admin only)
CREATE POLICY "Admin can manage all notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_projet_id ON notifications(projet_id);
CREATE INDEX IF NOT EXISTS idx_notifications_client_id ON notifications(client_id);

-- Function to create notification for new comment
CREATE OR REPLACE FUNCTION create_comment_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    type,
    title,
    message,
    projet_id,
    client_id,
    related_id
  ) VALUES (
    'comment',
    'Nouveau commentaire',
    'Un client a ajouté un commentaire sur ' || 
    CASE 
      WHEN NEW.task_id IS NOT NULL THEN 'une tâche'
      WHEN NEW.milestone_id IS NOT NULL THEN 'un jalon'
      ELSE 'le projet'
    END,
    NEW.projet_id,
    NEW.created_by_client_id,
    NEW.id
  );
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to create notification for new ticket
CREATE OR REPLACE FUNCTION create_ticket_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification for client-created tickets
  IF NEW.created_by = 'client' THEN
    INSERT INTO notifications (
      type,
      title,
      message,
      projet_id,
      client_id,
      related_id
    ) SELECT
      'ticket',
      'Nouveau ticket de support',
      'Un client a créé un nouveau ticket: ' || NEW.titre,
      NEW.projet_id,
      p.client_id,
      NEW.id
    FROM projects p
    WHERE p.id = NEW.projet_id;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to create notification for new review
CREATE OR REPLACE FUNCTION create_review_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    type,
    title,
    message,
    projet_id,
    client_id,
    related_id
  ) SELECT
    'review',
    'Nouvelle évaluation',
    'Un client a évalué le projet avec ' || NEW.note || '/5 étoiles',
    NEW.projet_id,
    p.client_id,
    NEW.id
  FROM projects p
  WHERE p.id = NEW.projet_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER trigger_comment_notification
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION create_comment_notification();

CREATE TRIGGER trigger_ticket_notification
  AFTER INSERT ON tickets
  FOR EACH ROW EXECUTE FUNCTION create_ticket_notification();

CREATE TRIGGER trigger_review_notification
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION create_review_notification();