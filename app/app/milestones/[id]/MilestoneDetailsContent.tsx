"use client";

import dynamic from "next/dynamic";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, CheckCircle, Circle, Eye } from "lucide-react";
import { Task } from "@/types";
import { useClientMilestone, useClientMilestoneTasks, useCurrentClient } from "@/hooks/use-client-data";
import { useMilestoneComments } from "@/hooks/use-comments";
import { CommentsSection } from "@/components/client/comments-section";
import { CommentForm } from "@/components/client/comment-form";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

// Dynamic imports for better performance
const ClientCommandPalette = dynamic(() => import("@/components/client/client-command-palette").then((mod) => ({ default: mod.ClientCommandPalette })), { ssr: false });
const TaskDetailsModal = dynamic(() => import("@/components/client/task-details-modal").then((mod) => ({ default: mod.TaskDetailsModal })), { ssr: false });

const statusIcons = {
  termine: CheckCircle,
  en_cours: Clock,
  a_faire: Circle
};

const statusLabels = {
  termine: 'Terminé',
  en_cours: 'En Cours',
  a_faire: 'À Faire'
};

const statusColors = {
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

interface MilestoneDetailsContentProps {
  milestoneId: string;
}

export function MilestoneDetailsContent({ milestoneId }: MilestoneDetailsContentProps) {
  const searchParams = useSearchParams();
  const selectedProjectId = searchParams.get('project');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const { data: currentClient } = useCurrentClient();
  const { data: milestone, isLoading: milestoneLoading } = useClientMilestone(milestoneId);
  const { data: tasks = [], isLoading: tasksLoading } = useClientMilestoneTasks(milestoneId);
  const { data: comments = [] } = useMilestoneComments(milestoneId);

  const loading = milestoneLoading || tasksLoading;

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
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
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!milestone) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Jalon non trouvé</h1>
          <p className="text-slate-600 mt-2">Le jalon demandé n'existe pas ou vous n'y avez pas accès.</p>
        </div>
      </div>
    );
  }

  const StatusIcon = statusIcons[milestone.statut];
  const completedTasks = tasks.filter(t => t.statut === 'termine').length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <>
      <ClientCommandPalette />
      
      <div className="p-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/app">Aperçu</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/app/roadmap">Feuille de Route</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{milestone.titre}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <StatusIcon className={`h-6 w-6 ${
              milestone.statut === 'termine' ? 'text-green-600' :
              milestone.statut === 'en_cours' ? 'text-blue-600' : 'text-slate-400'
            }`} />
            <h1 className="text-3xl font-bold text-gray-900">{milestone.titre}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge className={statusColors[milestone.statut]}>
              {statusLabels[milestone.statut]}
            </Badge>
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Échéance: {formatDate(milestone.date_prevue)}</span>
            </div>
          </div>
        </div>

        {/* Milestone Details */}
        <Card>
          <CardHeader>
            <CardTitle>Détails de l'Étape</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">{milestone.description}</p>
              
              {milestone.date_completee && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-700 font-medium">
                    ✅ Jalon complété le {formatDate(milestone.date_completee)}
                  </p>
                </div>
              )}

              {/* Progress */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-900">Progression des tâches</h4>
                  <span className="text-sm text-slate-600">
                    {completedTasks} sur {totalTasks} tâches terminées
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div 
                      className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-slate-600 min-w-[3rem]">
                    {progressPercentage}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Table */}
        <Card>
          <CardHeader>
            <CardTitle>Tâches de l'Étape ({tasks.length})</CardTitle>
            <CardDescription>
              Liste des tâches associées à cette étape
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tasks.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titre</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Priorité</TableHead>
                      <TableHead>Échéance</TableHead>
                      <TableHead>Créée le</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium">{task.titre}</TableCell>
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
                          {task.date_echeance ? formatDateTime(task.date_echeance) : 'Non définie'}
                        </TableCell>
                        <TableCell>{formatDateTime(task.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTaskClick(task)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTaskClick(task)}
                              title="Commenter cette tâche"
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
                <p>Aucune tâche n'est associée à cette étape pour le moment.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section commentaires */}
        <div className="space-y-6">
          <CommentsSection comments={comments} title="Vos commentaires sur cette étape" />
          
          {currentClient && (
            <CommentForm 
              projectId={milestone.projet_id}
              milestoneId={milestone.id}
            />
          )}
        </div>
      </div>

      {/* Task Details Modal */}
      <TaskDetailsModal
        task={selectedTask}
        milestone={milestone}
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
      />
    </>
  );
}