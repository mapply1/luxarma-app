/*
  # Add named project links system

  1. Changes
    - Alter projects table to support named links
    - Change liens_admin from text[] to jsonb to store objects with name and url
    - Update existing data to maintain compatibility

  2. Structure
    - Each link will be stored as: {"name": "Link Name", "url": "https://..."}
    - This allows admins to give meaningful names to project links
*/

-- Create a temporary column for the new structure
ALTER TABLE projects ADD COLUMN IF NOT EXISTS liens_admin_new jsonb DEFAULT '[]'::jsonb;

-- Migrate existing data (convert simple URLs to named links)
UPDATE projects 
SET liens_admin_new = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'name', 'Lien ' || (row_number() OVER ())::text,
      'url', link
    )
  )
  FROM unnest(COALESCE(liens_admin, '{}')) AS link
)
WHERE liens_admin IS NOT NULL AND array_length(liens_admin, 1) > 0;

-- Drop the old column and rename the new one
ALTER TABLE projects DROP COLUMN IF EXISTS liens_admin;
ALTER TABLE projects RENAME COLUMN liens_admin_new TO liens_admin;