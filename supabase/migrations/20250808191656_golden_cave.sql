/*
  # Extend notifications system for client activity tracking

  1. New notification types
    - task_created: When admin creates a new task
    - task_updated: When admin changes task status
    - milestone_created: When admin creates a new milestone
    - milestone_updated: When admin updates milestone status
    - document_uploaded: When admin uploads a document

  2. New triggers
    - Trigger on tasks table for creation and status updates
    - Trigger on milestones table for creation and status updates
    - Trigger on documents table for new uploads

  3. Security
    - All notification functions run with SECURITY DEFINER
    - Client notifications follow existing RLS policies
*/

-- Extend notification_type enum with new values
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'task_created';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'task_updated';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'milestone_created';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'milestone_updated';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'document_uploaded';

-- Function to create notification for new tasks
CREATE OR REPLACE FUNCTION create_task_created_notification()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO notifications (
    type,
    title,
    message,
    projet_id,
    client_id,
    related_id
  ) SELECT
    'task_created',
    'Nouvelle tâche ajoutée',
    'Une nouvelle tâche "' || NEW.titre || '" a été ajoutée à votre projet',
    NEW.projet_id,
    p.client_id,
    NEW.id
  FROM projects p
  WHERE p.id = NEW.projet_id;
  
  RETURN NEW;
END;
$$;

-- Function to create notification for task status updates
CREATE OR REPLACE FUNCTION create_task_updated_notification()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only notify on status changes
  IF OLD.statut IS DISTINCT FROM NEW.statut THEN
    INSERT INTO notifications (
      type,
      title,
      message,
      projet_id,
      client_id,
      related_id
    ) SELECT
      'task_updated',
      'Statut de tâche mis à jour',
      'Le statut de la tâche "' || NEW.titre || '" a été mis à jour vers "' || 
      CASE NEW.statut 
        WHEN 'a_faire' THEN 'À faire'
        WHEN 'en_cours' THEN 'En cours'
        WHEN 'termine' THEN 'Terminé'
      END || '"',
      NEW.projet_id,
      p.client_id,
      NEW.id
    FROM projects p
    WHERE p.id = NEW.projet_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to create notification for new milestones
CREATE OR REPLACE FUNCTION create_milestone_created_notification()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO notifications (
    type,
    title,
    message,
    projet_id,
    client_id,
    related_id
  ) SELECT
    'milestone_created',
    'Nouvelle étape ajoutée',
    'Une nouvelle étape "' || NEW.titre || '" a été ajoutée à votre projet',
    NEW.projet_id,
    p.client_id,
    NEW.id
  FROM projects p
  WHERE p.id = NEW.projet_id;
  
  RETURN NEW;
END;
$$;

-- Function to create notification for milestone status updates
CREATE OR REPLACE FUNCTION create_milestone_updated_notification()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only notify on status changes
  IF OLD.statut IS DISTINCT FROM NEW.statut THEN
    INSERT INTO notifications (
      type,
      title,
      message,
      projet_id,
      client_id,
      related_id
    ) SELECT
      'milestone_updated',
      'Étape mise à jour',
      'L''étape "' || NEW.titre || '" a été mise à jour vers "' || 
      CASE NEW.statut 
        WHEN 'a_faire' THEN 'À faire'
        WHEN 'en_cours' THEN 'En cours'
        WHEN 'termine' THEN 'Terminé'
      END || '"',
      NEW.projet_id,
      p.client_id,
      NEW.id
    FROM projects p
    WHERE p.id = NEW.projet_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to create notification for new documents
CREATE OR REPLACE FUNCTION create_document_uploaded_notification()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only notify for admin uploads
  IF NEW.uploaded_by = 'admin' THEN
    INSERT INTO notifications (
      type,
      title,
      message,
      projet_id,
      client_id,
      related_id
    ) SELECT
      'document_uploaded',
      'Nouveau document disponible',
      'Un nouveau document "' || NEW.nom || '" a été ajouté à votre projet',
      NEW.projet_id,
      p.client_id,
      NEW.id
    FROM projects p
    WHERE p.id = NEW.projet_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers for tasks
CREATE TRIGGER trigger_task_created_notification
  AFTER INSERT ON tasks
  FOR EACH ROW EXECUTE FUNCTION create_task_created_notification();

CREATE TRIGGER trigger_task_updated_notification
  AFTER UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION create_task_updated_notification();

-- Create triggers for milestones
CREATE TRIGGER trigger_milestone_created_notification
  AFTER INSERT ON milestones
  FOR EACH ROW EXECUTE FUNCTION create_milestone_created_notification();

CREATE TRIGGER trigger_milestone_updated_notification
  AFTER UPDATE ON milestones
  FOR EACH ROW EXECUTE FUNCTION create_milestone_updated_notification();

-- Create triggers for documents
CREATE TRIGGER trigger_document_uploaded_notification
  AFTER INSERT ON documents
  FOR EACH ROW EXECUTE FUNCTION create_document_uploaded_notification();