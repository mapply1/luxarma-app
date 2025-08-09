/*
  # Fix named project links system

  1. Changes
    - Alter projects table to support named links
    - Change liens_admin from text[] to jsonb to store objects with name and url
    - Update existing data to maintain compatibility (fixed version)

  2. Structure
    - Each link will be stored as: {"name": "Link Name", "url": "https://..."}
    - This allows admins to give meaningful names to project links
*/

-- First, add the new column
ALTER TABLE projects ADD COLUMN IF NOT EXISTS liens_admin_new jsonb DEFAULT '[]'::jsonb;

-- Migrate existing data with a simple approach
DO $$
DECLARE
    project_record RECORD;
    link_text TEXT;
    link_index INTEGER;
    links_array jsonb := '[]'::jsonb;
BEGIN
    FOR project_record IN SELECT id, liens_admin FROM projects WHERE liens_admin IS NOT NULL AND array_length(liens_admin, 1) > 0
    LOOP
        links_array := '[]'::jsonb;
        link_index := 1;
        
        FOREACH link_text IN ARRAY project_record.liens_admin
        LOOP
            links_array := links_array || jsonb_build_array(
                jsonb_build_object(
                    'name', 'Lien ' || link_index::text,
                    'url', link_text
                )
            );
            link_index := link_index + 1;
        END LOOP;
        
        UPDATE projects 
        SET liens_admin_new = links_array 
        WHERE id = project_record.id;
    END LOOP;
END $$;

-- Drop the old column and rename the new one
ALTER TABLE projects DROP COLUMN IF EXISTS liens_admin;
ALTER TABLE projects RENAME COLUMN liens_admin_new TO liens_admin;