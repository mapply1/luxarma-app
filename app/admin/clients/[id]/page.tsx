"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
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
import { AddButton } from "@/components/ui/add-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useClient, useClientProjects, useDeleteClient } from "@/hooks/use-clients";
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Folder, 
  Calendar,
  Eye,
  Plus
} from "iconoir-react";
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
import { ExternalLink, DollarSign, UserPlus, Shield, CheckCircle2, Trash2 } from "lucide-react";
import { Project } from "@/types";

// Dynamic imports for better performance
const ProjectForm = dynamic(() => import("@/components/admin/project-form").then((mod) => ({ default: mod.ProjectForm })), { ssr: false });
const CreateClientAccountModal = dynamic(() => import("@/components/admin/create-client-account-modal").then((mod) => ({ default: mod.CreateClientAccountModal })), { ssr: false });
const AdminCommandPalette = dynamic(() => import("@/components/admin/admin-command-palette").then((mod) => ({ default: mod.AdminCommandPalette })), { ssr: false });

export default function ClientProfilePage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [hasClientAccount, setHasClientAccount] = useState(false);

  const { data: client, isLoading: clientLoading } = useClient(clientId);
  const { data: projects = [], isLoading: projectsLoading } = useClientProjects(clientId);
  const deleteClientMutation = useDeleteClient();
  
  const loading = clientLoading || projectsLoading;

  useEffect(() => {
    const checkClientAccount = async () => {
      if (!client) return;
      
      try {
        // Call the database function to check if client has an account
        const { data, error } = await supabase
          .rpc('check_client_has_account', { client_id_param: clientId });
        
        if (error) {
          console.error('Erreur lors de la vérification du compte client:', error);
          setHasClientAccount(false);
        } else {
          setHasClientAccount(data || false);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du compte client:', error);
        setHasClientAccount(false);
      }
    };

    checkClientAccount();
  }, [client, clientId]);

  const handleProjectSaved = (savedProject: Project) => {
    // React Query will automatically refetch and update the cache
  };

  const handleAccountCreated = () => {
    setHasClientAccount(true);
    setIsAccountModalOpen(false);
  };

  const handleDeleteClient = async () => {
    if (!client) return;
    deleteClientMutation.mutate(client.id, {
      onSuccess: () => {
        router.push('/admin/clients');
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

  const statusLabels: Record<string, string> = {
    en_attente: 'En Attente',
    en_cours: 'En Cours',
    en_revision: 'En Révision',
    termine: 'Terminé',
    suspendu: 'Suspendu'
  };

  const statusColors: Record<string, string> = {
    en_attente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    en_cours: 'bg-blue-100 text-blue-800 border-blue-200',
    en_revision: 'bg-orange-100 text-orange-800 border-orange-200',
    termine: 'bg-green-100 text-green-800 border-green-200',
    suspendu: 'bg-red-100 text-red-800 border-red-200'
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

  if (!client) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-luxarma-text">Client non trouvé</h1>
          <p className="text-luxarma-subtext mt-2">Le client demandé n'existe pas.</p>
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
              <BreadcrumbLink href="/admin/clients">Clients</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{client.prenom} {client.nom}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{client.prenom} {client.nom}</h1>
            <p className="text-gray-600 mt-1">
              {client.entreprise ? `${client.entreprise} • ` : ''}{client.email}
            </p>
          </div>
          <AddButton 
            onClick={() => setIsProjectFormOpen(true)}
          >
            Nouveau projet
          </AddButton>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer le client
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer le client</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir supprimer le client "{client.prenom} {client.nom}" ? 
                  Cette action supprimera également tous ses projets ({projects.length}) et toutes les données associées (jalons, tâches, tickets, documents, évaluations).
                  Cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteClient}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Supprimer définitivement
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Informations du client */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-luxarma-text">
              <User />
              Informations du Client
            </CardTitle>
            <CardDescription className="text-luxarma-subtext">
              Détails du contact et informations professionnelles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Status du compte client */}
            <div className="mb-6 p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-slate-900">Compte Client</h4>
                    <p className="text-sm text-slate-600">
                      {hasClientAccount 
                        ? "Le client a un compte et peut accéder à son portail" 
                        : "Le client n'a pas encore de compte d'accès"
                      }
                    </p>
                  </div>
                </div>
                <div>
                  {hasClientAccount ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Compte actif
                    </Badge>
                  ) : (
                    <Button 
                      onClick={() => setIsAccountModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Créer un compte
                    </Button>
                  )}
                </div>
              </div>
              
              {hasClientAccount && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700">
                    ✅ Ce client peut se connecter avec son email <strong>{client.email}</strong> pour accéder à ses projets, consulter les documents, créer des tickets et évaluer les projets terminés.
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="text-luxarma-accent1" />
                  <div>
                    <p className="text-sm font-medium text-luxarma-text">Email</p>
                    <p className="text-luxarma-subtext">{client.email}</p>
                  </div>
                </div>

                {client.telephone && (
                  <div className="flex items-center gap-3">
                    <Phone className="text-luxarma-accent1" />
                    <div>
                      <p className="text-sm font-medium text-luxarma-text">Téléphone</p>
                      <p className="text-luxarma-subtext">{client.telephone}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {client.entreprise && (
                  <div className="flex items-center gap-3">
                    <Building className="text-luxarma-accent1" />
                    <div>
                      <p className="text-sm font-medium text-luxarma-text">Entreprise</p>
                      <p className="text-luxarma-subtext">{client.entreprise}</p>
                    </div>
                  </div>
                )}

                {client.ville && (
                  <div className="flex items-center gap-3">
                    <MapPin className="text-luxarma-accent1" />
                    <div>
                      <p className="text-sm font-medium text-luxarma-text">Ville</p>
                      <p className="text-luxarma-subtext">{client.ville}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {client.linkedin_url && (
                  <div className="flex items-center gap-3">
                    <ExternalLink className="text-luxarma-accent1" />
                    <div>
                      <p className="text-sm font-medium text-luxarma-text">LinkedIn</p>
                      <a 
                        href={client.linkedin_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-luxarma-accent1 hover:underline"
                      >
                        Voir le profil
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="text-luxarma-accent1" />
                  <div>
                    <p className="text-sm font-medium text-luxarma-text">Client depuis</p>
                    <p className="text-luxarma-subtext">{formatDate(client.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projets du client */}
        <Card className="border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-luxarma-text">
                  <Folder />
                  Projets ({projects.length})
                </CardTitle>
                <CardDescription className="text-luxarma-subtext">
                  Tous les projets réalisés ou en cours pour ce client
                </CardDescription>
              </div>
              <Button 
                onClick={() => setIsProjectFormOpen(true)}
                size="sm"
                variant="outline"
                className="border-[#0c120d] text-[#0c120d] hover:bg-[#0c120d] hover:text-white transition-colors duration-200"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nouveau projet
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {projects.length > 0 ? (
              <div className="rounded-md border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-luxarma-text font-medium">Titre</TableHead>
                      <TableHead className="text-luxarma-text font-medium">Statut</TableHead>
                      <TableHead className="text-luxarma-text font-medium">Budget</TableHead>
                      <TableHead className="text-luxarma-text font-medium">Échéance</TableHead>
                      <TableHead className="text-luxarma-text font-medium">Dernière MAJ</TableHead>
                      <TableHead className="text-luxarma-text font-medium">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => (
                      <TableRow key={project.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-luxarma-text">{project.titre}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[project.statut]}>
                            {statusLabels[project.statut]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-luxarma-subtext">
                          {project.budget ? (
                            <div className="flex items-center gap-1">
                              <DollarSign width="1em" height="1em" />
                              {project.budget.toLocaleString('fr-FR')} €
                            </div>
                          ) : (
                            'Non défini'
                          )}
                        </TableCell>
                        <TableCell className="text-luxarma-subtext">
                          {formatDate(project.date_fin_prevue)}
                        </TableCell>
                        <TableCell className="text-luxarma-subtext">
                          {formatDate(project.updated_at)}
                        </TableCell>
                        <TableCell>
                          <Link href={`/admin/projects/${project.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-luxarma-accent1 hover:bg-blue-50"
                            >
                              <Eye />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Folder className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-luxarma-text mb-2">Aucun projet</h3>
                <p className="text-luxarma-subtext mb-4">
                  Ce client n'a pas encore de projet assigné
                </p>
                <AddButton 
                  onClick={() => setIsProjectFormOpen(true)}
                >
                  Créer le premier projet
                </AddButton>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistiques rapides */}
        {projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-luxarma-text">Total Projets</p>
                    <p className="text-2xl font-bold text-luxarma-text">{projects.length}</p>
                  </div>
                  <Folder className="text-luxarma-accent1" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-luxarma-text">En Cours</p>
                    <p className="text-2xl font-bold text-luxarma-text">
                      {projects.filter(p => ['en_cours', 'en_revision'].includes(p.statut)).length}
                    </p>
                  </div>
                  <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-luxarma-text">Terminés</p>
                    <p className="text-2xl font-bold text-luxarma-text">
                      {projects.filter(p => p.statut === 'termine').length}
                    </p>
                  </div>
                  <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-luxarma-text">Budget Total</p>
                    <p className="text-2xl font-bold text-luxarma-text">
                      {projects.reduce((sum, p) => sum + (p.budget || 0), 0).toLocaleString('fr-FR')} €
                    </p>
                  </div>
                  <DollarSign className="text-luxarma-emerald" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Formulaire de projet */}
      <ProjectForm
        client={client}
        isOpen={isProjectFormOpen}
        onClose={() => setIsProjectFormOpen(false)}
        onProjectSaved={handleProjectSaved}
      />

      {/* Modal de création de compte client */}
      <CreateClientAccountModal
        client={client}
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onAccountCreated={handleAccountCreated}
      />
    </>
  );
}