"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ExternalLink, Calendar, DollarSign, CheckCircle, Trash2 } from "lucide-react";
import { Milestone, Task, Document, Ticket } from "@/types";
import { useProject, useDeleteProject, useUpdateProject } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { MilestoneRoadmap } from "@/components/admin/milestone-roadmap";
import Link from "next/link";

// Dynamic imports for better performance
const AdminCommandPalette = dynamic(() => import("@/components/admin/admin-command-palette").then((mod) => ({ default: mod.AdminCommandPalette })), { ssr: false });
const TasksTab = dynamic(() => import("@/components/admin/tasks-tab").then((mod) => ({ default: mod.TasksTab })), { ssr: false });
const DocumentsTab = dynamic(() => import("@/components/admin/documents-tab").then((mod) => ({ default: mod.DocumentsTab })), { ssr: false });
const TicketsTab = dynamic(() => import("@/components/admin/tickets-tab").then((mod) => ({ default: mod.TicketsTab })), { ssr: false });
const ProjectEditForm = dynamic(() => import("@/components/admin/project-edit-form").then((mod) => ({ default: mod.ProjectEditForm })), { ssr: false });

export default function AdminProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  const { data: project, isLoading: loading } = useProject(projectId);
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(projectId);
  const deleteProjectMutation = useDeleteProject();
  const updateProjectMutation = useUpdateProject();

  useEffect(() => {
    const fetchRelatedData = async () => {
      if (!project) return;
      
      try {
        const { data: milestonesData, error: milestonesError } = await supabase
          .from('milestones')
          .select('*')
          .eq('projet_id', projectId)
          .order('ordre');
        
        if (milestonesError) throw milestonesError;
        
        const { data: documentsData, error: documentsError } = await supabase
          .from('documents')
          .select('*')
          .eq('projet_id', projectId)
          .order('created_at', { ascending: false });

        if (documentsError) throw documentsError;

        const { data: ticketsData, error: ticketsError } = await supabase
          .from('tickets')
          .select('*')
          .eq('projet_id', projectId)
          .order('created_at', { ascending: false });

        if (ticketsError) throw ticketsError;

        setMilestones(milestonesData || []);
        setDocuments(documentsData || []);
        setTickets(ticketsData || []);
      } catch (error) {
        console.error('Erreur lors du chargement des données liées:', error);
      }
    };

    fetchRelatedData();
  }, [project, projectId]);

  const handleProjectUpdated = (updatedProject: Project) => {
    // React Query will handle the update automatically
  };

  const handleCompleteProject = async () => {
    if (!project) return;
    

    updateProjectMutation.mutate({ 
      id: project.id, 
      updates: { statut: 'termine' } 
    });
  };

  const handleCreateTask = () => {
    // This will be called by the command palette
    // The TasksTab component will handle the actual creation
  };

  const handleUploadDocument = () => {
    // This will be called by the command palette
    // The DocumentsTab component will handle the actual upload
  };

  const handleCreateTicket = () => {
    // This will be called by the command palette
    // The TicketsTab component will handle the actual creation
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    deleteProjectMutation.mutate(project.id, {
      onSuccess: () => {
        router.push('/admin/projects');
      }
    });
  };
  
  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-24 bg-slate-200 rounded"></div>
          <div className="h-96 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Projet non trouvé</h1>
          <p className="text-slate-600 mt-2">Le projet demandé n'existe pas.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const statusLabels = {
    en_attente: 'En Attente',
    en_cours: 'En Cours',
    en_revision: 'En Révision',
    termine: 'Terminé',
    suspendu: 'Suspendu'
  };

  const statusColors = {
    en_attente: 'bg-yellow-100 text-yellow-800',
    en_cours: 'bg-blue-100 text-blue-800',
    en_revision: 'bg-orange-100 text-orange-800',
    termine: 'bg-green-100 text-green-800',
    suspendu: 'bg-red-100 text-red-800'
  };

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
              <BreadcrumbLink href="/admin/projects">Projets</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{project.titre}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-slate-900">{project.titre}</h1>
            <div className="flex items-center gap-4">
              <Badge className={statusColors[project.statut]}>
                {statusLabels[project.statut]}
              </Badge>
              <div className="flex items-center text-slate-600">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Échéance: {formatDate(project.date_fin_prevue)}</span>
              </div>
              {project.budget && (
                <div className="flex items-center text-slate-600">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span>{project.budget.toLocaleString('fr-FR')} €</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditFormOpen(true)}
            >
              Modifier le projet
            </Button>
            {project.statut !== 'termine' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marquer comme terminé
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Marquer le projet comme terminé</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir marquer le projet "{project.titre}" comme terminé ? 
                    Cette action activera la possibilité pour le client d'évaluer le projet et 
                    changera le statut du projet de manière permanente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleCompleteProject}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Marquer comme terminé
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer le projet
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer le projet</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer le projet "{project.titre}" ? 
                    Cette action supprimera également tous les jalons, tâches, réclamations, documents et évaluations associés.
                    Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteProject}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Supprimer définitivement
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="tasks">Tâches ({tasks.length})</TabsTrigger>
            <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
            <TabsTrigger value="tickets">Tickets ({tickets.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations du Projet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed mb-6">{project.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Client</h4>
                    <p className="text-slate-600">{project.client?.nom}</p>
                    <p className="text-slate-600">{project.client?.email}</p>
                    {project.client?.entreprise && (
                      <p className="text-slate-600">{project.client.entreprise}</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Dates</h4>
                    <p className="text-slate-600">Début: {formatDate(project.date_debut)}</p>
                    <p className="text-slate-600">Fin prévue: {formatDate(project.date_fin_prevue)}</p>
                    {project.date_fin_reelle && (
                      <p className="text-slate-600">Fin réelle: {formatDate(project.date_fin_reelle)}</p>
                    )}
                  </div>
                </div>

                {project.liens_admin && project.liens_admin.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-slate-900 mb-3">Liens Administrateur</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.liens_admin.map((lien, index) => (
                        <Button key={index} variant="outline" size="sm" asChild>
                          <a href={lien.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            {lien.name}
                          </a>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <MilestoneRoadmap 
              milestones={milestones} 
              projectId={projectId}
              onUpdateMilestones={setMilestones}
            />
          </TabsContent>

          <TabsContent value="tasks">
            <TasksTab 
              milestones={milestones}
              projectId={projectId}
              onCreateTask={handleCreateTask}
            />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentsTab 
              documents={documents}
              projectId={projectId}
              onUpdateDocuments={setDocuments}
              onUploadDocument={handleUploadDocument}
            />
          </TabsContent>

          <TabsContent value="tickets">
            <TicketsTab 
              tickets={tickets}
              projectId={projectId}
              onUpdateTickets={setTickets}
              onCreateTicket={handleCreateTicket}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Edit Form Modal */}
      <ProjectEditForm
        project={project}
        isOpen={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        onProjectUpdated={handleProjectUpdated}
      />
    </>
  );
}