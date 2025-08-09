/*
  # Add discovery call resume and tally submission URL fields to prospects

  1. Changes
    - Add discovery_call_resume text field to store manual discovery call summaries
    - Add tally_submission_url text field to store Tally form submission URLs
    - Both fields are optional and can be updated by admin users

  2. Security
    - Fields are managed by existing RLS policies (admin only)
*/

-- Add discovery call resume field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'discovery_call_resume'
  ) THEN
    ALTER TABLE prospects ADD COLUMN discovery_call_resume text;
  END IF;
END $$;

-- Add tally submission URL field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prospects' AND column_name = 'tally_submission_url'
  ) THEN
    ALTER TABLE prospects ADD COLUMN tally_submission_url text;
  END IF;
END $$;