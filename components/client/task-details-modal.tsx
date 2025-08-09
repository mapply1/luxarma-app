"use client";

"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, AlertCircle, User, MessageCircle } from "lucide-react";
import { Task, Milestone } from "@/types";
import { useTaskComments } from "@/hooks/use-comments";
import { useCurrentClient } from "@/hooks/use-client-data";

// Dynamic imports for better performance
const CommentsSection = dynamic(() => import("./comments-section").then((mod) => ({ default: mod.CommentsSection })), { ssr: false });
const CommentForm = dynamic(() => import("./comment-form").then((mod) => ({ default: mod.CommentForm })), { ssr: false });

interface TaskDetailsModalProps {
  task: Task | null;
  milestone?: Milestone;
  isOpen: boolean;
  onClose: () => void;
}

const statusLabels = {
  a_faire: 'À Faire',
  en_cours: 'En Cours',
  termine: 'Terminé'
};

const statusColors = {
  a_faire: 'bg-slate-100 text-slate-800',
  en_cours: 'bg-blue-100 text-blue-800',
  termine: 'bg-green-100 text-green-800'
};

const priorityLabels = {
  basse: 'Basse',
  moyenne: 'Moyenne',
  haute: 'Haute'
};

const priorityColors = {
  basse: 'bg-green-100 text-green-800',
  moyenne: 'bg-yellow-100 text-yellow-800',
  haute: 'bg-red-100 text-red-800'
};

export function TaskDetailsModal({ task, milestone, isOpen, onClose }: TaskDetailsModalProps) {
  const { data: currentClient } = useCurrentClient();
  const { data: comments = [] } = useTaskComments(task?.id);

  if (!task) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            {task.titre}
            <MessageCircle className="h-5 w-5 text-blue-600" />
          </DialogTitle>
          <DialogDescription>
            Détails de la tâche
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">Statut:</span>
              <Badge className={statusColors[task.statut]}>
                {statusLabels[task.statut]}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">Priorité:</span>
              <Badge className={priorityColors[task.priorite]}>
                <AlertCircle className="h-3 w-3 mr-1" />
                {priorityLabels[task.priorite]}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Description */}
          {task.description && (
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Description</h4>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg">
                {task.description}
              </p>
            </div>
          )}

          {/* Milestone */}
          {milestone && (
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Étape associée</h4>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="font-medium text-blue-900">{milestone.titre}</p>
                <p className="text-sm text-blue-700 mt-1">{milestone.description}</p>
              </div>
            </div>
          )}

          {/* Dates and Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Informations temporelles</h4>
              
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-slate-500" />
                <span className="text-slate-600">Créée le:</span>
                <span className="font-medium">{formatDate(task.created_at)}</span>
              </div>
              
              {task.date_echeance && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-600">Échéance:</span>
                  <span className="font-medium">{formatDateOnly(task.date_echeance)}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Assignment</h4>
              
              {task.assignee && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-600">Assignée à:</span>
                  <span className="font-medium">{task.assignee}</span>
                </div>
              )}
              
              {!task.assignee && (
                <p className="text-sm text-slate-500 italic">Non assignée</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Section commentaires */}
          <div className="space-y-4">
            <Suspense fallback={<div className="animate-pulse h-32 bg-slate-200 rounded"></div>}>
              <CommentsSection comments={comments} title="Vos commentaires" />
            </Suspense>
            
            {currentClient && (
              <Suspense fallback={<div className="animate-pulse h-20 bg-slate-200 rounded"></div>}>
                <CommentForm 
                  projectId={task.projet_id}
                  taskId={task.id}
                />
              </Suspense>
            )}
          </div>

          <Separator />

          {/* Progress indicator for status */}
          <div>
            <h4 className="font-medium text-slate-900 mb-3">Progression</h4>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    task.statut === 'a_faire' ? 'w-0 bg-slate-400' :
                    task.statut === 'en_cours' ? 'w-1/2 bg-blue-500' :
                    'w-full bg-green-500'
                  }`}
                ></div>
              </div>
              <span className="text-sm font-medium text-slate-600">
                {task.statut === 'a_faire' ? '0%' :
                 task.statut === 'en_cours' ? '50%' : '100%'}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}