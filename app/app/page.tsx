"use client";

import dynamic from "next/dynamic";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, DollarSign, ExternalLink, Eye, CheckCircle, Clock, Circle, MessageCircle } from "lucide-react";
import { useClientProject, useClientMilestones, useClientTasks } from "@/hooks/use-client-data";
import { useTaskComments, useMilestoneComments } from "@/hooks/use-comments";
import { Task, Milestone } from "@/types";
import Link from "next/link";

// Dynamic imports for better performance
const ClientCommandPalette = dynamic(() => import("@/components/client/client-command-palette").then((mod) => ({ default: mod.ClientCommandPalette })), { ssr: false });
const TaskDetailsModal = dynamic(() => import("@/components/client/task-details-modal").then((mod) => ({ default: mod.TaskDetailsModal })), { ssr: false });

function ClientProjectOverviewContent() {
  const searchParams = useSearchParams();
  const selectedProjectId = searchParams.get('project');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const { data: project } = useClientProject(selectedProjectId || undefined);
  const { data: milestones = [], isLoading: milestonesLoading } = useClientMilestones(project?.id);
  const { data: tasks = [], isLoading: tasksLoading } = useClientTasks(project?.id);

  const loading = milestonesLoading || tasksLoading;

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const getSelectedMilestone = () => {
    if (!selectedTask?.milestone_id) return undefined;
    return milestones.find(m => m.id === selectedTask.milestone_id);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-24 bg-slate-200 rounded"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Projet non trouvé</h1>
          <p className="text-slate-600 mt-2">Le projet demandé n'existe pas ou vous n'y avez pas accès.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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

  const milestoneStatusIcons = {
    termine: CheckCircle,
    en_cours: Clock,
    a_faire: Circle
  };

  const milestoneStatusLabels = {
    termine: 'Terminé',
    en_cours: 'En Cours',
    a_faire: 'À Faire'
  };

  const milestoneStatusColors = {
    termine: 'bg-green-100 text-green-800',
    en_cours: 'bg-blue-100 text-blue-800',
    a_faire: 'bg-slate-100 text-slate-800'
  };

  const taskStatusLabels = {
    a_faire: 'À Faire',
    en_cours: 'En Cours',
    termine: 'Terminé'
  };

  const taskStatusColors = {
    a_faire: 'bg-slate-100 text-slate-800',
    en_cours: 'bg-blue-100 text-blue-800',
    termine: 'bg-green-100 text-green-800'
  };

  const priorityColors = {
    basse: 'bg-green-100 text-green-800',
    moyenne: 'bg-yellow-100 text-yellow-800',
    haute: 'bg-red-100 text-red-800'
  };

  return (
    <>
    <div>
      <ClientCommandPalette projectId={project.id} />
      
      <div className="p-8 space-y-8">
        {/* Project Information */}
        <div className="space-y-6">
          <div className="mb-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-6xl">🚀</div>
              <h1 className="text-3xl font-bold text-gray-900">{project.titre}</h1>
            </div>
          </div>
          
          <p className="text-lg text-gray-700 leading-relaxed">{project.description}</p>
          
          <div className="flex items-center gap-6">
            <Badge className={statusColors[project.statut]}>
              {statusLabels[project.statut]}
            </Badge>
            
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Échéance: {formatDate(project.date_fin_prevue)}</span>
            </div>
            
            {project.budget && (
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="h-4 w-4" />
                <span>{project.budget.toLocaleString('fr-FR')} €</span>
              </div>
            )}
          </div>

          {/* Project Links */}
          {project.liens_admin && project.liens_admin.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Liens Utiles</h3>
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
        </div>

        {/* Milestones Table */}
        <div className="space-y-6 pt-8">
          <div className="border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold text-gray-900">Étapes du Projet</h2>
          </div>
          
          {milestones.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date Prévue</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {milestones.map((milestone) => {
                    const StatusIcon = milestoneStatusIcons[milestone.statut];
                    return (
                      <TableRow key={milestone.id} className="hover:bg-slate-50">
                         <TableCell className="font-medium">
                          {milestone.titre}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`h-4 w-4 ${
                              milestone.statut === 'termine' ? 'text-green-600' :
                              milestone.statut === 'en_cours' ? 'text-blue-600' : 'text-slate-400'
                            }`} />
                            <Badge className={milestoneStatusColors[milestone.statut]}>
                              {milestoneStatusLabels[milestone.statut]}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-md truncate">{milestone.description}</TableCell>
                        <TableCell>{formatDate(milestone.date_prevue)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link href={`/app/milestones/${milestone.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="sm" title="Commenter ce jalon">
                              <MessageCircle className="h-4 w-4 text-blue-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Circle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Aucune étape</p>
              <p>Les étapes du projet seront bientôt disponibles.</p>
            </div>
          )}
        </div>

        {/* Tasks Table */}
        <div className="space-y-6 pt-8">
          <div className="border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold text-gray-900">Tâches du Projet</h2>
          </div>
          
          {tasks.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => handleTaskClick(task)}>
                      <TableCell className="font-medium">
                        {task.titre}
                      </TableCell>
                      <TableCell>
                        <Badge className={taskStatusColors[task.statut]}>
                          {taskStatusLabels[task.statut]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={priorityColors[task.priorite]}>
                          {task.priorite.charAt(0).toUpperCase() + task.priorite.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {task.date_echeance ? formatDate(task.date_echeance) : 'Non définie'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTaskClick(task);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Commenter cette tâche"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTaskClick(task);
                            }}
                          >
                            <MessageCircle className="h-4 w-4 text-blue-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Aucune tâche</p>
              <p>Les tâches du projet seront bientôt disponibles.</p>
            </div>
          )}
        </div>
      </div>

      {/* Task Details Modal */}
      <TaskDetailsModal
        task={selectedTask}
        milestone={getSelectedMilestone()}
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
      />
    </div>
    </>
  );
}

export default function ClientProjectOverviewPage() {
  return (
    <Suspense fallback={
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-24 bg-slate-200 rounded"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    }>
      <ClientProjectOverviewContent />
    </Suspense>
  );
}