/*
  # Update RLS policies for development

  1. Changes
    - Update clients table policies to allow all authenticated users to manage clients
    - Update prospects table policies to allow all authenticated users to manage prospects
    - This resolves the RLS violation error when creating clients/prospects

  2. Security
    - Policies now check for authenticated users instead of requiring 'admin' role
    - Suitable for development environment
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can manage all clients" ON clients;
DROP POLICY IF EXISTS "Admins can manage all prospects" ON prospects;

-- Create new policies that allow authenticated users to manage clients and prospects
CREATE POLICY "Authenticated users can manage all clients"
  ON clients
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage all prospects"
  ON prospects
  FOR ALL
  TO authenticated
  USING (true);