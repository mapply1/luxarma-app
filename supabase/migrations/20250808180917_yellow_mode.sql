/*
  # Expand prospect demande types

  1. Changes
    - Extend demande_type enum to include all Framer and design service options
    - Add new values to support the full range of services offered

  2. New Type Values
    - landing_framer: Création Landing Page Framer
    - site_multipage_framer: Création d'un site multipage Framer
    - refonte_framer: Refonte d'un site internet sur Framer
    - integration_design_framer: Intégration d'un design sur Framer
    - ux_ui_figma: UX/UI design sur Figma
    - formation_framer: Formation sur Framer
    - partenariats: Partenariats et collaborations
    - autres: Autres
*/

-- Extend the demande_type enum with new values
ALTER TYPE demande_type ADD VALUE IF NOT EXISTS 'landing_framer';
ALTER TYPE demande_type ADD VALUE IF NOT EXISTS 'site_multipage_framer';
ALTER TYPE demande_type ADD VALUE IF NOT EXISTS 'refonte_framer';
ALTER TYPE demande_type ADD VALUE IF NOT EXISTS 'integration_design_framer';
ALTER TYPE demande_type ADD VALUE IF NOT EXISTS 'ux_ui_figma';
ALTER TYPE demande_type ADD VALUE IF NOT EXISTS 'formation_framer';
ALTER TYPE demande_type ADD VALUE IF NOT EXISTS 'partenariats';
ALTER TYPE demande_type ADD VALUE IF NOT EXISTS 'autres';