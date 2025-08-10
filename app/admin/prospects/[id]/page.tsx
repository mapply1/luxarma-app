"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useProspect, useDeleteProspect } from "@/hooks/use-prospects";
import { useUpdateProspect } from "@/hooks/use-prospects";
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Calendar,
  DollarSign,
  FileText,
  ArrowRight,
  Edit,
  Archive,
  Send,
  ExternalLink
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { InteractionProspect, Client, Project } from "@/types";

// Dynamic imports for better performance
const ProspectConversionModal = dynamic(() => import("@/components/admin/prospect-conversion-modal").then((mod) => ({ default: mod.ProspectConversionModal })), { ssr: false });
const AdminCommandPalette = dynamic(() => import("@/components/admin/admin-command-palette").then((mod) => ({ default: mod.AdminCommandPalette })), { ssr: false });

const statusLabels = {
  nouveau: 'Nouveau',
  contacte: 'Contacté',
  qualifie: 'Qualifié',
  negocie: 'Négocie',
  converti: 'Converti',
  perdu: 'Perdu',
  archive: 'Archivé'
};

const statusColors = {
  nouveau: 'bg-blue-100 text-blue-800 border-blue-200',
  contacte: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  qualifie: 'bg-green-100 text-green-800 border-green-200',
  negocie: 'bg-orange-100 text-orange-800 border-orange-200',
  converti: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  perdu: 'bg-red-100 text-red-800 border-red-200',
  archive: 'bg-gray-100 text-gray-800 border-gray-200'
};

const typeDemandeLabels = {
  landing_framer: 'Création Landing Page Framer',
  site_multipage_framer: 'Création d\'un site multipage Framer',
  refonte_framer: 'Refonte d\'un site internet sur Framer',
  integration_design_framer: 'Intégration d\'un design sur Framer',
  ux_ui_figma: 'UX/UI design sur Figma',
  formation_framer: 'Formation sur Framer',
  partenariats: 'Partenariats et collaborations',
  autres: 'Autres',
  // Anciens types pour compatibilité
  site: 'Site Web',
  formation: 'Formation',
  partenariat: 'Partenariat',
  autre: 'Autre'
};

export default function ProspectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const prospectId = params.id as string;
  
  const [interactions, setInteractions] = useState<InteractionProspect[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isConversionModalOpen, setIsConversionModalOpen] = useState(false);
  const [discoveryCallResume, setDiscoveryCallResume] = useState('');
  const [proposalDocUrl, setProposalDocUrl] = useState('');
  const [quoteDocUrl, setQuoteDocUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);

  const { data: prospect, isLoading: loading } = useProspect(prospectId);
  const deleteProspectMutation = useDeleteProspect();
  const updateProspectMutation = useUpdateProspect();

  useEffect(() => {
    if (prospect) {
      setDiscoveryCallResume(prospect.discovery_call_resume || '');
      setProposalDocUrl(prospect.proposal_doc_url || '');
      setQuoteDocUrl(prospect.quote_doc_url || '');
    }
  }, [prospect]);

  useEffect(() => {
    const fetchInteractions = async () => {
      if (!prospect) return;
      
      try {
        const { data: interactionsData, error: interactionsError } = await supabase
          .from('interactions_prospects')
          .select('*')
          .eq('prospect_id', prospectId)
          .order('created_at', { ascending: false });
        
        if (interactionsError) throw interactionsError;
        
        setInteractions(interactionsData || []);
      } catch (error) {
        console.error('Erreur lors du chargement des interactions:', error);
      }
    };

    fetchInteractions();
  }, [prospect, prospectId]);

  const handleAddNote = () => {
    if (!newNote.trim() || !prospect) return;

    const newInteraction: InteractionProspect = {
      id: Date.now().toString(),
      prospect_id: prospect.id,
      type: 'note',
      titre: 'Note interne',
      description: newNote,
      created_at: new Date().toISOString(),
      created_by: 'admin'
    };

    setInteractions(prev => [newInteraction, ...prev]);
    setNewNote('');
    toast.success("Note ajoutée");
  };

  const handleSaveFields = async () => {
    if (!prospect) return;
    
    try {
      await updateProspectMutation.mutateAsync({
        id: prospect.id,
        updates: {
          discovery_call_resume: discoveryCallResume || null,
          proposal_doc_url: proposalDocUrl || null,
          quote_doc_url: quoteDocUrl || null,
        }
      });
      setIsEditing(false);
      toast.success("Champs mis à jour avec succès");
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleSendWebhook = async () => {
    if (!prospect) return;
    
    setIsSendingWebhook(true);
    
    try {
      const webhookPayload = {
        ...prospect,
        discovery_call_resume: discoveryCallResume,
        proposal_doc_url: proposalDocUrl,
        quote_doc_url: quoteDocUrl,
      };
      
      const response = await fetch('https://hook.eu2.make.com/au2mvgv6utpw4hlp7atwmdja4b9m6qdh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      toast.success("Données envoyées au webhook avec succès");
    } catch (error) {
      console.error('Erreur lors de l\'envoi au webhook:', error);
      toast.error("Erreur lors de l'envoi au webhook");
    } finally {
      setIsSendingWebhook(false);
    }
  };

  const handleConversionComplete = (project: Project, client: Client) => {
    // Navigate to the new client's page since prospect is deleted
    router.push(`/admin/clients/${client.id}`);
    setIsConversionModalOpen(false);
  };

  const handleDeleteProspect = async () => {
    if (!prospect) return;
    deleteProspectMutation.mutate(prospect.id, {
      onSuccess: () => {
        router.push('/admin/prospects');
      }
    });
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBudget = (budgetRange?: string) => {
    return budgetRange || 'Non défini';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!prospect) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-luxarma-text">Prospect non trouvé</h1>
          <p className="text-luxarma-subtext mt-2">Le prospect demandé n'existe pas.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminCommandPalette />
      
      <div className="p-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Tableau de Bord</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/prospects">Prospects</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{prospect.prenom} {prospect.nom}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {prospect.prenom} {prospect.nom}
            </h1>
            <p className="text-gray-600">
              {prospect.entreprise ? `${prospect.entreprise} • ` : ''}{prospect.email}
            </p>
          </div>
          
          <div className="flex gap-2">
            {prospect.statut !== 'converti' && prospect.statut !== 'archive' && (
              <Button 
                onClick={() => setIsConversionModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-medium"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Convertir en projet
              </Button>
            )}
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer le prospect</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer le prospect "{prospect.prenom} {prospect.nom}" ? 
                    Cette action supprimera également toutes les interactions associées.
                    Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteProspect}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Supprimer définitivement
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Informations principales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Infos prospect */}
            <Card className="border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-luxarma-text">
                    <User className="h-5 w-5" />
                    Informations du Prospect
                  </CardTitle>
                  <Badge className={statusColors[prospect.statut]}>
                    {statusLabels[prospect.statut]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-luxarma-accent1" />
                      <div>
                        <p className="text-sm font-medium text-luxarma-text">Email</p>
                        <p className="text-luxarma-subtext">{prospect.email}</p>
                      </div>
                    </div>

                    {prospect.telephone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-luxarma-accent1" />
                        <div>
                          <p className="text-sm font-medium text-luxarma-text">Téléphone</p>
                          <p className="text-luxarma-subtext">{prospect.telephone}</p>
                        </div>
                      </div>
                    )}

                    {prospect.entreprise && (
                      <div className="flex items-center gap-3">
                        <Building className="h-4 w-4 text-luxarma-accent1" />
                        <div>
                          <p className="text-sm font-medium text-luxarma-text">Entreprise</p>
                          <p className="text-luxarma-subtext">{prospect.entreprise}</p>
                        </div>
                      </div>
                    )}

                    {prospect.ville && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-luxarma-accent1" />
                        <div>
                          <p className="text-sm font-medium text-luxarma-text">Ville</p>
                          <p className="text-luxarma-subtext">{prospect.ville}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-luxarma-text mb-1">Type de demande</p>
                      <Badge variant="outline">
                        {typeDemandeLabels[prospect.type_demande]}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-luxarma-text mb-1">Budget</p>
                      <p className="text-luxarma-subtext">{formatBudget(prospect.budget_min, prospect.budget_max)}</p>
                    </div>

                    {prospect.echeance_souhaitee && (
                      <div>
                        <p className="text-sm font-medium text-luxarma-text mb-1">Échéance souhaitée</p>
                        <p className="text-luxarma-subtext">{formatDate(prospect.echeance_souhaitee)}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium text-luxarma-text mb-1">Source</p>
                      <p className="text-luxarma-subtext">{prospect.source}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description du projet */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-luxarma-text">Description du Projet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-luxarma-text leading-relaxed">{prospect.description_projet}</p>
              </CardContent>
            </Card>

            {/* Résumé automatique */}
            {prospect.resume_auto && (
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-luxarma-text">Résumé Automatique</CardTitle>
                  <CardDescription className="text-luxarma-subtext">
                    Généré automatiquement par Make
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-luxarma-text leading-relaxed bg-blue-50 p-4 rounded-lg">
                    {prospect.resume_auto}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {/* Actions rapides */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-luxarma-text">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={handleSendWebhook}
                  disabled={isSendingWebhook}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isSendingWebhook ? "Envoi..." : "Envoyer à Make.com"}
                </Button>
                {prospect.statut !== 'archive' && (
                  <Button variant="outline" className="w-full">
                    <Archive className="mr-2 h-4 w-4" />
                    Archiver
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Informations temporelles */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-luxarma-text">Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-luxarma-subtext" />
                  <span className="text-luxarma-subtext">Créé le:</span>
                  <span className="font-medium text-luxarma-text">{formatDate(prospect.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-luxarma-subtext" />
                  <span className="text-luxarma-subtext">Modifié le:</span>
                  <span className="font-medium text-luxarma-text">{formatDate(prospect.updated_at)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Notes internes */}
        {prospect.notes_internes && (
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-luxarma-text">Notes Internes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-luxarma-text leading-relaxed bg-yellow-50 p-4 rounded-lg">
                {prospect.notes_internes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Discovery Call Resume & Document URLs */}
        <Card className="border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-luxarma-text">Informations Complémentaires</CardTitle>
                <CardDescription className="text-luxarma-subtext">
                  Résumé d'appel et documents générés par Make.com
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setDiscoveryCallResume(prospect.discovery_call_resume || '');
                        setProposalDocUrl(prospect.proposal_doc_url || '');
                        setQuoteDocUrl(prospect.quote_doc_url || '');
                      }}
                    >
                      Annuler
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleSaveFields}
                      disabled={updateProspectMutation.isPending}
                    >
                      {updateProspectMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-luxarma-text mb-2 block">
                Résumé de l'appel de découverte
              </label>
              {isEditing ? (
                <Textarea
                  value={discoveryCallResume}
                  onChange={(e) => setDiscoveryCallResume(e.target.value)}
                  placeholder="Résumé de l'appel de découverte avec le prospect..."
                  className="min-h-[100px]"
                />
              ) : (
                <div className="bg-slate-50 p-4 rounded-lg border min-h-[100px]">
                  {discoveryCallResume ? (
                    <p className="text-luxarma-text leading-relaxed whitespace-pre-wrap">
                      {discoveryCallResume}
                    </p>
                  ) : (
                    <p className="text-luxarma-subtext italic">
                      Aucun résumé d'appel enregistré
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-luxarma-text mb-2 block">
                URL du document de proposition
              </label>
              {isEditing ? (
                <Input
                  value={proposalDocUrl}
                  onChange={(e) => setProposalDocUrl(e.target.value)}
                  placeholder="https://..."
                  type="url"
                />
              ) : (
                <div className="bg-slate-50 p-4 rounded-lg border">
                  {proposalDocUrl ? (
                    <a 
                      href={proposalDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                    >
                      <FileText className="h-4 w-4" />
                      Voir la proposition
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <p className="text-luxarma-subtext italic">
                      Aucune proposition générée
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-luxarma-text mb-2 block">
                URL du document de devis
              </label>
              {isEditing ? (
                <Input
                  value={quoteDocUrl}
                  onChange={(e) => setQuoteDocUrl(e.target.value)}
                  placeholder="https://..."
                  type="url"
                />
              ) : (
                <div className="bg-slate-50 p-4 rounded-lg border">
                  {quoteDocUrl ? (
                    <a 
                      href={quoteDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                    >
                      <DollarSign className="h-4 w-4" />
                      Voir le devis
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <p className="text-luxarma-subtext italic">
                      Aucun devis généré
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Historique des interactions */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-luxarma-text">Historique des Interactions</CardTitle>
            <CardDescription className="text-luxarma-subtext">
              Toutes les interactions avec ce prospect
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Ajouter une note */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-luxarma-text mb-2">Ajouter une note interne</h4>
              <div className="space-y-2">
                <Textarea
                  placeholder="Saisir une note interne..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[80px]"
                />
                <Button 
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  size="sm"
                >
                  Ajouter la note
                </Button>
              </div>
            </div>

            <Separator />

            {/* Liste des interactions */}
            <div className="space-y-4">
              {interactions.length > 0 ? (
                interactions.map((interaction) => (
                  <div key={interaction.id} className="border-l-2 border-blue-200 pl-4">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-luxarma-text">{interaction.titre}</h5>
                      <span className="text-xs text-luxarma-subtext">
                        {formatDateTime(interaction.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-luxarma-subtext mb-1">
                      Type: {interaction.type} • Par: {interaction.created_by}
                    </p>
                    <p className="text-luxarma-text">{interaction.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-luxarma-subtext text-center py-4">
                  Aucune interaction enregistrée pour ce prospect
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de conversion */}
      <ProspectConversionModal
        prospect={prospect}
        isOpen={isConversionModalOpen}
        onClose={() => setIsConversionModalOpen(false)}
        onConvert={handleConversionComplete}
      />
    </>
  );
}