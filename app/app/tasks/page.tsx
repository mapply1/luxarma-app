"use client";

"use client";

import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Target, Clock, CheckCircle, MessageCircle } from "lucide-react";
import { Task } from "@/types";
import { useClientProject, useClientMilestones, useClientTasks } from "@/hooks/use-client-data";

// Dynamic imports for better performance
const TasksTable = dynamic(() => import("@/components/client/tasks-table").then((mod) => ({ default: mod.TasksTable })), { ssr: false });
const TaskDetailsModal = dynamic(() => import("@/components/client/task-details-modal").then((mod) => ({ default: mod.TaskDetailsModal })), { ssr: false });
const ClientCommandPalette = dynamic(() => import("@/components/client/client-command-palette").then((mod) => ({ default: mod.ClientCommandPalette })), { ssr: false });

function ClientAllTasksContent() {
  const searchParams = useSearchParams();
  const selectedProjectId = searchParams.get('project');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const { data: project } = useClientProject(selectedProjectId || undefined);
  const { data: milestones = [] } = useClientMilestones(project?.id);
  const { data: allTasks = [], isLoading: loading } = useClientTasks(project?.id);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-16 bg-slate-200 rounded"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  const todoTasks = allTasks.filter(t => t.statut === 'a_faire').length;
  const inProgressTasks = allTasks.filter(t => t.statut === 'en_cours').length;
  const completedTasks = allTasks.filter(t => t.statut === 'termine').length;

  const getSelectedMilestone = () => {
    if (!selectedTask?.milestone_id) return undefined;
    return milestones.find(m => m.id === selectedTask.milestone_id);
  };

  return (
    <>
      <Suspense fallback={null}>
        <ClientCommandPalette />
      </Suspense>
      
      <div className="p-8 space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Toutes les Tâches</h1>
          </div>
          <p className="text-gray-600">
            Suivez l'avancement de toutes les tâches de votre projet
          </p>
        </div>

        {/* Statistiques des tâches */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">À Faire</CardTitle>
              <Target className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{todoTasks}</div>
              <CardDescription>
                Tâches en attente
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Cours</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{inProgressTasks}</div>
              <CardDescription>
                Tâches en développement
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terminées</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{completedTasks}</div>
              <CardDescription>
                Tâches livrées
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Tableau des tâches */}
        <Card>
          <CardHeader>
            <CardTitle>
              Liste des Tâches ({allTasks.length})
            </CardTitle>
            <CardDescription>
              Cliquez sur une tâche pour voir ses détails complets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="animate-pulse h-64 bg-slate-200 rounded"></div>}>
              <TasksTable 
                tasks={allTasks}
                milestones={milestones}
                onTaskClick={handleTaskClick}
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* Modal des détails de tâche */}
      <Suspense fallback={null}>
        <TaskDetailsModal
          task={selectedTask}
          milestone={getSelectedMilestone()}
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
        />
      </Suspense>
    </>
  );
}

export default function ClientAllTasksPage() {
  return (
    <Suspense fallback={
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-16 bg-slate-200 rounded"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    }>
      <ClientAllTasksContent />
    </Suspense>
  );
}