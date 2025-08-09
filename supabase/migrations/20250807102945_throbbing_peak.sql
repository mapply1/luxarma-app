/*
  # Create admin user setup function

  1. New Functions
    - `create_admin_user(email, password)` - Creates an admin user with proper role
    - This function can be called from the Supabase SQL editor to create your admin account

  2. Usage
    - Run: SELECT create_admin_user('your-admin-email@domain.com', 'your-secure-password');
    - This will create an admin user that can access the admin interface
*/

-- Function to create admin user (call this from Supabase SQL editor)
CREATE OR REPLACE FUNCTION create_admin_user(admin_email text, admin_password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Create user with admin role in metadata
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "admin"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO user_id;

  RETURN 'Admin user created successfully with ID: ' || user_id::text;
EXCEPTION
  WHEN unique_violation THEN
    RETURN 'Error: User with this email already exists';
  WHEN OTHERS THEN
    RETURN 'Error creating admin user: ' || SQLERRM;
END;
$$;

-- Function to create client user (for creating client accounts)
CREATE OR REPLACE FUNCTION create_client_user(client_email text, client_password text, client_id_param text, client_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Create user with client role in metadata
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    client_email,
    crypt(client_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    json_build_object('role', 'client', 'client_id', client_id_param, 'client_name', client_name),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO user_id;

  RETURN 'Client user created successfully with ID: ' || user_id::text;
EXCEPTION
  WHEN unique_violation THEN
    RETURN 'Error: User with this email already exists';
  WHEN OTHERS THEN
    RETURN 'Error creating client user: ' || SQLERRM;
END;
$$;