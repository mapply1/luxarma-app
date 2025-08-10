export interface Client {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  entreprise?: string;
  telephone?: string;
  ville?: string;
  linkedin_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  titre: string;
  description: string;
  client_id: string;
  statut: 'en_attente' | 'en_cours' | 'en_revision' | 'termine' | 'suspendu';
  date_debut: string;
  date_fin_prevue: string;
  date_fin_reelle?: string;
  budget?: number;
  liens_admin?: { name: string; url: string }[];
  created_at: string;
  updated_at: string;
  client?: Client;
}

export interface Milestone {
  id: string;
  projet_id: string;
  titre: string;
  description: string;
  statut: 'a_faire' | 'en_cours' | 'termine';
  date_prevue: string;
  date_completee?: string;
  ordre: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  projet_id: string;
  milestone_id?: string;
  titre: string;
  description?: string;
  statut: 'a_faire' | 'en_cours' | 'termine';
  priorite: 'basse' | 'moyenne' | 'haute';
  assignee?: string;
  date_echeance?: string;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  projet_id: string;
  titre: string;
  description: string;
  statut: 'ouvert' | 'en_cours' | 'resolu' | 'ferme';
  priorite: 'basse' | 'moyenne' | 'haute';
  created_by: 'admin' | 'client';
  created_at: string;
  updated_at: string;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  nom: string;
  type: string;
  url: string;
  taille: number;
  storage_path: string;
  uploaded_by_client_id: string;
  created_at: string;
}

export interface Document {
  id: string;
  projet_id: string;
  nom: string;
  type: string;
  url: string;
  taille: number;
  storage_path?: string; // Path in Supabase Storage
  uploaded_by: 'admin' | 'client';
  requires_signature?: boolean;
  is_signed?: boolean;
  signed_at?: string;
  signature_data?: string;
  created_at: string;
}

export interface Review {
  id: string;
  projet_id: string;
  milestone_id?: string;
  note: number; // 1-5
  commentaire?: string;
  created_at: string;
}

export interface Prospect {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  entreprise?: string;
  ville?: string;
  type_demande: 'landing_framer' | 'site_multipage_framer' | 'refonte_framer' | 'integration_design_framer' | 'ux_ui_figma' | 'formation_framer' | 'partenariats' | 'autres' | 'site' | 'formation' | 'partenariat' | 'autre';
  budget_range?: string;
  echeance_souhaitee?: string;
  description_projet: string;
  statut: 'nouveau' | 'contacte' | 'qualifie' | 'negocie' | 'converti' | 'perdu' | 'archive';
  source: string; // ex: "Tally Form", "Référence", etc.
  resume_auto?: string; // Résumé généré automatiquement
  notes_internes?: string;
  discovery_call_resume?: string; // Résumé manuel de l'appel de découverte
  proposal_doc_url?: string; // URL du document de proposition généré par Make.com
  quote_doc_url?: string; // URL du document de devis généré par Make.com
  documents?: string[]; // URLs des documents
  historique_interactions?: InteractionProspect[];
  created_at: string;
  updated_at: string;
  converted_client_id?: string; // Si converti en client
  converted_project_id?: string; // Si converti en projet
}

export interface InteractionProspect {
  id: string;
  prospect_id: string;
  type: 'email' | 'appel' | 'meeting' | 'note';
  titre: string;
  description: string;
  created_at: string;
  created_by: string;
}

export interface Comment {
  id: string;
  projet_id: string;
  task_id?: string;
  milestone_id?: string;
  content: string;
  created_by_client_id: string;
  created_at: string;
  updated_at: string;
  client?: Client;
}

export interface Notification {
  id: string;
  type: 'comment' | 'ticket' | 'review' | 'task_created' | 'task_updated' | 'milestone_created' | 'milestone_updated' | 'document_uploaded';
  title: string;
  message: string;
  projet_id: string;
  client_id: string;
  related_id: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
  client?: Client;
  project?: Project;
}