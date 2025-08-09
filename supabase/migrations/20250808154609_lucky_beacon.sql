/*
  # Add function to check if client has account

  1. New Functions
    - `check_client_has_account(client_id)` - Checks if a client has a user account
    - This function can be called from the app to verify account status

  2. Security
    - Function runs with elevated privileges to check auth.users table
    - Only returns boolean result, no sensitive data exposed
*/

-- Function to check if a client has a user account
CREATE OR REPLACE FUNCTION check_client_has_account(client_id_param text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  account_exists boolean := false;
BEGIN
  -- Check if there's a user with this client_id in user_metadata
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE raw_user_meta_data ->> 'client_id' = client_id_param
    AND raw_user_meta_data ->> 'role' = 'client'
  ) INTO account_exists;
  
  RETURN account_exists;
EXCEPTION
  WHEN OTHERS THEN
    -- Return false on any error
    RETURN false;
END;
$$;