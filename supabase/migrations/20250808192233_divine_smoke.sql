/*
  # Fix client notification triggers for admin actions

  1. Ensure triggers exist and work properly
    - Task creation notifications
    - Task status update notifications  
    - Milestone creation notifications
    - Milestone status update notifications
    - Document upload notifications

  2. Debug and fix any trigger issues
    - Ensure functions run with proper privileges
    - Fix any RLS policy conflicts
    - Ensure client_id is properly resolved from projects

  3. Test trigger functionality
    - Create test functions to verify trigger execution
*/

-- First, let's ensure the notification types exist
DO $$
BEGIN
  -- Add notification types if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'task_created' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type')) THEN
    ALTER TYPE notification_type ADD VALUE 'task_created';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'task_updated' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type')) THEN
    ALTER TYPE notification_type ADD VALUE 'task_updated';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'milestone_created' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type')) THEN
    ALTER TYPE notification_type ADD VALUE 'milestone_created';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'milestone_updated' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type')) THEN
    ALTER TYPE notification_type ADD VALUE 'milestone_updated';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'document_uploaded' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type')) THEN
    ALTER TYPE notification_type ADD VALUE 'document_uploaded';
  END IF;
END $$;

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS trigger_task_created_notification ON tasks;
DROP TRIGGER IF EXISTS trigger_task_updated_notification ON tasks;
DROP TRIGGER IF EXISTS trigger_milestone_created_notification ON milestones;
DROP TRIGGER IF EXISTS trigger_milestone_updated_notification ON milestones;
DROP TRIGGER IF EXISTS trigger_document_uploaded_notification ON documents;

-- Recreate the notification functions with better error handling
CREATE OR REPLACE FUNCTION create_task_created_notification()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't fail the main operation
      RAISE LOG 'Error creating task notification: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION create_task_updated_notification()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only notify on status changes
  IF OLD.statut IS DISTINCT FROM NEW.statut THEN
    BEGIN
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
    EXCEPTION
      WHEN OTHERS THEN
        -- Log error but don't fail the main operation
        RAISE LOG 'Error creating task update notification: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION create_milestone_created_notification()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't fail the main operation
      RAISE LOG 'Error creating milestone notification: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION create_milestone_updated_notification()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only notify on status changes
  IF OLD.statut IS DISTINCT FROM NEW.statut THEN
    BEGIN
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
    EXCEPTION
      WHEN OTHERS THEN
        -- Log error but don't fail the main operation
        RAISE LOG 'Error creating milestone update notification: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION create_document_uploaded_notification()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only notify for admin uploads
  IF NEW.uploaded_by = 'admin' THEN
    BEGIN
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
    EXCEPTION
      WHEN OTHERS THEN
        -- Log error but don't fail the main operation
        RAISE LOG 'Error creating document notification: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate all triggers
CREATE TRIGGER trigger_task_created_notification
  AFTER INSERT ON tasks
  FOR EACH ROW EXECUTE FUNCTION create_task_created_notification();

CREATE TRIGGER trigger_task_updated_notification
  AFTER UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION create_task_updated_notification();

CREATE TRIGGER trigger_milestone_created_notification
  AFTER INSERT ON milestones
  FOR EACH ROW EXECUTE FUNCTION create_milestone_created_notification();

CREATE TRIGGER trigger_milestone_updated_notification
  AFTER UPDATE ON milestones
  FOR EACH ROW EXECUTE FUNCTION create_milestone_updated_notification();

CREATE TRIGGER trigger_document_uploaded_notification
  AFTER INSERT ON documents
  FOR EACH ROW EXECUTE FUNCTION create_document_uploaded_notification();

-- Test function to verify triggers work (for debugging)
CREATE OR REPLACE FUNCTION test_notification_system(project_id_param uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  test_task_id uuid;
  test_milestone_id uuid;
  test_document_id uuid;
  notification_count integer;
BEGIN
  -- Get project info
  IF NOT EXISTS (SELECT 1 FROM projects WHERE id = project_id_param) THEN
    RETURN 'Error: Project not found';
  END IF;
  
  -- Test task creation
  INSERT INTO tasks (projet_id, titre, description, statut, priorite)
  VALUES (project_id_param, 'Test notification task', 'This is a test task for notifications', 'a_faire', 'moyenne')
  RETURNING id INTO test_task_id;
  
  -- Test milestone creation
  INSERT INTO milestones (projet_id, titre, description, statut, date_prevue, ordre)
  VALUES (project_id_param, 'Test notification milestone', 'This is a test milestone for notifications', 'a_faire', CURRENT_DATE + INTERVAL '7 days', 999)
  RETURNING id INTO test_milestone_id;
  
  -- Count notifications created
  SELECT COUNT(*) INTO notification_count
  FROM notifications 
  WHERE projet_id = project_id_param 
  AND created_at > NOW() - INTERVAL '1 minute';
  
  -- Clean up test data
  DELETE FROM tasks WHERE id = test_task_id;
  DELETE FROM milestones WHERE id = test_milestone_id;
  DELETE FROM notifications WHERE related_id::uuid IN (test_task_id, test_milestone_id);
  
  RETURN 'Test completed. Notifications created: ' || notification_count::text;
END;
$$;