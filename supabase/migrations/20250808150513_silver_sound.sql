/*
  # Fix RLS policy for notification triggers

  1. Changes
    - Update notification trigger functions to run with elevated privileges (SECURITY DEFINER)
    - This allows the triggers to insert notifications even when called by client users

  2. Security
    - Functions run with elevated privileges but only insert specific notification data
    - RLS policies for reading notifications remain unchanged (admin only)
*/

-- Update the comment notification function to run with elevated privileges
CREATE OR REPLACE FUNCTION create_comment_notification()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass RLS
AS $$
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
$$;

-- Update the ticket notification function to run with elevated privileges
CREATE OR REPLACE FUNCTION create_ticket_notification()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass RLS
AS $$
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
$$;

-- Update the review notification function to run with elevated privileges
CREATE OR REPLACE FUNCTION create_review_notification()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass RLS
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
$$;