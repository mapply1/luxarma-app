/*
  # Replace budget min/max with budget range text field

  1. Changes
    - Remove budget_min and budget_max numeric columns from prospects table
    - Add budget_range text column for flexible budget input
    - This allows prospects to specify budget ranges like "5k-10k", "environ 15k", etc.

  2. Migration
    - Migrate existing data to the new format
    - Drop old columns and add new column
*/

-- Migrate existing data to budget_range text field
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS budget_range text;

-- Migrate existing budget data to the new text format
UPDATE prospects 
SET budget_range = CASE
  WHEN budget_min IS NOT NULL AND budget_max IS NOT NULL THEN
    budget_min::text || ' - ' || budget_max::text || ' €'
  WHEN budget_min IS NOT NULL THEN
    'À partir de ' || budget_min::text || ' €'
  WHEN budget_max IS NOT NULL THEN
    'Jusqu''à ' || budget_max::text || ' €'
  ELSE NULL
END
WHERE budget_min IS NOT NULL OR budget_max IS NOT NULL;

-- Drop the old budget columns
ALTER TABLE prospects DROP COLUMN IF EXISTS budget_min;
ALTER TABLE prospects DROP COLUMN IF EXISTS budget_max;