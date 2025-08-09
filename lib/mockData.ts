// DEVELOPMENT ONLY - This file contains mock data for development and testing
// In production, all data should come from Supabase database
import { Client, Project, Milestone, Task, Ticket, Document, Review, Prospect, InteractionProspect } from '@/types';

// Only export mock data in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

if (!isDevelopment) {
  console.warn('Mock data should not be used in production. All data should come from the database.');
}

export const mockClients: Client[] = [
  {
    id: '1',
    prenom: 'Sophie',
    nom: 'Sophie Dubois',
    email: 'sophie@dubois-design.fr',
    entreprise: 'Dubois Design',
    telephone: '+33 1 23 45 67 89',
    ville: 'Paris',
    linkedin_url: 'https://linkedin.com/in/sophie-dubois',
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-15T09:00:00Z'
  },
  {
    id: '2',
    prenom: 'Marc',
    nom: 'Marc Martin',
    email: 'marc@techsolutions.fr',
    entreprise: 'Tech Solutions',
    telephone: '+33 1 98 76 54 32',
    ville: 'Lyon',
    created_at: '2024-02-01T10:30:00Z',
    updated_at: '2024-02-01T10:30:00Z'
  }
];

export const mockProjects: Project[] = [
  {
    id: '1',
    titre: 'Site E-commerce Dubois Design',
    description: 'Création d\'un site e-commerce moderne pour la vente de produits de design.',
    client_id: '1',
    statut: 'en_cours',
    date_debut: '2024-01-15',
    date_fin_prevue: '2024-03-15',
    budget: 15000,
    liens_admin: ['https://figma.com/design-draft', 'https://staging.dubois-design.fr'],
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-20T14:30:00Z',
    client: mockClients[0]
  },
  {
    id: '2',
    titre: 'Application Web Tech Solutions',
    description: 'Développement d\'une application web de gestion pour Tech Solutions.',
    client_id: '2',
    statut: 'en_revision',
    date_debut: '2024-02-01',
    date_fin_prevue: '2024-04-30',
    budget: 25000,
    liens_admin: ['https://techsolutions-staging.fr'],
    created_at: '2024-02-01T10:30:00Z',
    updated_at: '2024-02-15T16:45:00Z',
    client: mockClients[1]
  }
];

export const mockMilestones: Milestone[] = [
  {
    id: '1',
    projet_id: '1',
    titre: 'Conception et Maquettes',
    description: 'Création des maquettes et validation du design',
    statut: 'termine',
    date_prevue: '2024-01-30',
    date_completee: '2024-01-28',
    ordre: 1,
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-28T15:30:00Z'
  },
  {
    id: '2',
    projet_id: '1',
    titre: 'Développement Frontend',
    description: 'Développement de l\'interface utilisateur',
    statut: 'en_cours',
    date_prevue: '2024-02-28',
    ordre: 2,
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-02-01T10:00:00Z'
  },
  {
    id: '3',
    projet_id: '1',
    titre: 'Tests et Déploiement',
    description: 'Tests finaux et mise en production',
    statut: 'a_faire',
    date_prevue: '2024-03-15',
    ordre: 3,
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-15T09:00:00Z'
  }
];

export const mockTasks: Task[] = [
  {
    id: '1',
    projet_id: '1',
    milestone_id: '2',
    titre: 'Intégration du panier d\'achat',
    description: 'Développer la fonctionnalité de panier d\'achat',
    statut: 'en_cours',
    priorite: 'haute',
    date_echeance: '2024-02-25',
    created_at: '2024-02-01T09:00:00Z',
    updated_at: '2024-02-15T11:30:00Z'
  },
  {
    id: '2',
    projet_id: '1',
    milestone_id: '2',
    titre: 'Optimisation mobile',
    description: 'Optimiser l\'affichage pour les appareils mobiles',
    statut: 'a_faire',
    priorite: 'moyenne',
    date_echeance: '2024-02-28',
    created_at: '2024-02-05T10:15:00Z',
    updated_at: '2024-02-05T10:15:00Z'
  },
  {
    id: '3',
    projet_id: '1',
    titre: 'Configuration SSL',
    description: 'Mettre en place le certificat SSL',
    statut: 'termine',
    priorite: 'haute',
    date_echeance: '2024-02-10',
    created_at: '2024-02-01T14:00:00Z',
    updated_at: '2024-02-08T16:45:00Z'
  }
];

export const mockDocuments: Document[] = [
  {
    id: '1',
    projet_id: '1',
    nom: 'Contrat de service - Dubois Design.pdf',
    type: 'application/pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    taille: 245760,
    uploaded_by: 'admin',
    created_at: '2024-01-15T09:00:00Z'
  },
  {
    id: '2',
    projet_id: '1',
    nom: 'Facture initial - janvier 2024.pdf',
    type: 'application/pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    taille: 156320,
    uploaded_by: 'admin',
    created_at: '2024-01-20T14:30:00Z'
  },
  {
    id: '3',
    projet_id: '1',
    nom: 'Moodboard - Inspiration design.jpg',
    type: 'image/jpeg',
    url: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800',
    taille: 892456,
    uploaded_by: 'admin',
    created_at: '2024-01-25T11:15:00Z'
  },
  {
    id: '4',
    projet_id: '1',
    nom: 'Brief technique - spécifications.pdf',
    type: 'application/pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    taille: 523120,
    uploaded_by: 'admin',
    created_at: '2024-02-01T10:45:00Z'
  },
  {
    id: '5',
    projet_id: '1',
    nom: 'Wireframes - Page accueil.png',
    type: 'image/png',
    url: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800',
    taille: 1245890,
    uploaded_by: 'admin',
    created_at: '2024-02-05T16:20:00Z'
  }
];

export const mockTickets: Ticket[] = [
  {
    id: '1',
    projet_id: '1',
    titre: 'Problème de couleur sur la page d\'accueil',
    description: 'Les couleurs du header ne correspondent pas à la charte graphique validée.',
    statut: 'ouvert',
    priorite: 'moyenne',
    created_by: 'client',
    created_at: '2024-02-10T09:30:00Z',
    updated_at: '2024-02-10T09:30:00Z'
  },
  {
    id: '2',
    projet_id: '1',
    titre: 'Demande de modification du footer',
    description: 'Pourriez-vous ajouter les liens vers nos réseaux sociaux dans le footer ?',
    statut: 'en_cours',
    priorite: 'basse',
    created_by: 'client',
    created_at: '2024-02-12T14:15:00Z',
    updated_at: '2024-02-13T10:20:00Z'
  }
];

export const mockReviews: Review[] = [
  {
    id: '1',
    projet_id: '1',
    note: 5,
    commentaire: 'Excellent travail ! L\'équipe a été très professionnelle et le résultat dépasse mes attentes. La communication était claire tout au long du projet.',
    created_at: '2024-03-15T16:30:00Z'
  }
];

export const mockProspects: Prospect[] = [
  {
    id: '1',
    nom: 'Leroy',
    prenom: 'Julie',
    email: 'julie.leroy@startup.fr',
    telephone: '+33 6 12 34 56 78',
    entreprise: 'Innovation Startup',
    ville: 'Toulouse',
    type_demande: 'site_multipage_framer',
    budget_range: '8k - 15k €',
    echeance_souhaitee: '2024-04-01',
    description_projet: 'Refonte complète du site web avec e-commerce intégré',
    statut: 'qualifie',
    source: 'Tally Form',
    resume_auto: 'Startup tech cherchant à refaire son site avec module e-commerce. Budget OK, timing serré.',
    notes_internes: 'Discovery call prévu vendredi. Très motivés, budget confirmé.',
    created_at: '2024-02-15T14:20:00Z',
    updated_at: '2024-02-20T10:30:00Z'
  },
  {
    id: '2',
    nom: 'Martin',
    prenom: 'Pierre',
    email: 'p.martin@consulting.com',
    telephone: '+33 1 45 67 89 12',
    entreprise: 'Martin Consulting',
    ville: 'Lyon',
    type_demande: 'formation_framer',
    budget_range: '3k - 5k €',
    description_projet: 'Formation équipe sur les outils digitaux modernes',
    statut: 'contacte',
    source: 'LinkedIn',
    resume_auto: 'Cabinet de conseil cherchant formation digitale pour 10 personnes.',
    created_at: '2024-02-28T09:15:00Z',
    updated_at: '2024-02-28T09:15:00Z'
  },
  {
    id: '3',
    nom: 'Bernard',
    prenom: 'Marie',
    email: 'marie.bernard@artisan.fr',
    entreprise: 'Atelier Bernard',
    ville: 'Nice',
    type_demande: 'landing_framer',
    budget_range: '2k - 4k €',
    echeance_souhaitee: '2024-05-15',
    description_projet: 'Site vitrine pour artisan avec galerie photos',
    statut: 'nouveau',
    source: 'Recommandation',
    created_at: '2024-03-01T16:45:00Z',
    updated_at: '2024-03-01T16:45:00Z'
  }
];

export const mockInteractions: InteractionProspect[] = [
  {
    id: '1',
    prospect_id: '1',
    type: 'appel',
    titre: 'Premier contact téléphonique',
    description: 'Discussion de 30min. Projet confirmé, budget OK. RDV discovery call fixé.',
    created_at: '2024-02-16T10:00:00Z',
    created_by: 'admin'
  },
  {
    id: '2',
    prospect_id: '1',
    type: 'email',
    titre: 'Envoi cahier des charges',
    description: 'Envoyé template CDC e-commerce pour remplissage',
    created_at: '2024-02-18T14:30:00Z',
    created_by: 'admin'
  }
];