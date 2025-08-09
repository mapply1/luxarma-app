"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { TasksTab } from "@/components/admin/tasks-tab";
import { useMilestone, useMilestoneTasks, useUpdateMilestone, useDeleteMilestone } from "@/hooks/use-milestones";
import { useTasks } from "@/hooks/use-tasks";
import { useProjectComments } from "@/hooks/use-comments";
import { CommentsSection } from "@/components/client/comments-section";
import { Calendar, Clock, CheckCircle, Circle, Edit2, Trash2, MessageSquare, Target, ArrowLeft, ExternalLink } from "lucide-react";
import { Milestone, Task } from "@/types";

// Dynamic import for better performance
const AdminCommandPalette = dynamic(() => import("@/components/admin/admin-command-palette").then((mod) => ({ default: mod.AdminCommandPalette })), { ssr: false });

const statusIcons: Record<string, any> = {
  termine: CheckCircle,
  en_cours: Clock,
  a_faire: Circle
};

const statusLabels: Record<string, string> = {
  termine: 'Terminé',
  en_cours: 'En Cours',
  a_faire: 'À Faire'
};

const statusColors: Record<string, string> = {
  termine: 'bg-green-100 text-green-800',
  en_cours: 'bg-blue-100 text-blue-800',
  a_faire: 'bg-slate-100 text-slate-800'
};

const taskStatusLabels: Record<string, string> = {
  a_faire: 'À Faire',
  en_cours: 'En Cours',
  termine: 'Terminé'
};

const taskStatusColors: Record<string, string> = {
  a_faire: 'bg-slate-100 text-slate-800',
  en_cours: 'bg-blue-100 text-blue-800',
  termine: 'bg-green-100 text-green-800'
};

const priorityColors: Record<string, string> = {
  basse: 'bg-green-100 text-green-800',
  moyenne: 'bg-yellow-100 text-yellow-800',
  haute: 'bg-red-100 text-red-800'
};

export default function AdminMilestoneDetailPage() {
  const router = useRouter();
  const params = useParams();
  const milestoneId = params.id as string;
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCommentsDialogOpen, setIsCommentsDialogOpen] = useState(false);
  
  const { data: milestone, isLoading: milestoneLoading } = useMilestone(milestoneId);
  const { data: milestoneTasks = [], isLoading: tasksLoading } = useMilestoneTasks(milestoneId);
  const { data: allProjectTasks = [] } = useTasks(milestone?.projet_id);
  const { data: projectComments = [] } = useProjectComments(milestone?.projet_id);
  const updateMilestoneMutation = useUpdateMilestone();
  const deleteMilestoneMutation = useDeleteMilestone();

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    statut: 'a_faire' as Milestone['statut'],
    date_prevue: ''
  });

  const loading = milestoneLoading || tasksLoading;

  const handleEdit = () => {
    if (!milestone) return;
    setFormData({
      titre: milestone.titre,
      description: milestone.description,
      statut: milestone.statut,
      date_prevue: milestone.date_prevue
    });
    setIsEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!milestone) return;
    
    try {
      updateMilestoneMutation.mutate({ 
        id: milestone.id, 
        updates: formData
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleDelete = async () => {
    if (!milestone) return;
    deleteMilestoneMutation.mutate(milestone.id, {
      onSuccess: () => {
        router.push(`/admin/projects/${milestone.projet_id}`);
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
      year: 'numeric'
    });
  };

  const getMilestoneComments = () => {
    return projectComments.filter(c => c.milestone_id === milestoneId) as any[];
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
          <p className="text-slate-600 mt-2">Le jalon demandé n'existe pas.</p>
        </div>
      </div>
    );
  }

  const StatusIcon = statusIcons[milestone.statut];
  const completedTasks = milestoneTasks.filter(t => t.statut === 'termine').length;
  const totalTasks = milestoneTasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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
              <BreadcrumbLink href={`/admin/projects/${milestone.projet_id}`}>
{(milestone as any).project?.[0]?.titre || 'Projet'}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{milestone.titre}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between">
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
          
          <div className="flex gap-2">
            <Link href={`/admin/projects/${milestone.projet_id}`}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au projet
              </Button>
            </Link>
            <Button onClick={handleEdit}>
              <Edit2 className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer le jalon</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer le jalon "{milestone.titre}" ? 
                    Cette action supprimera également toutes les tâches et commentaires associés.
                    Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Supprimer définitivement
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Milestone Details */}
        <Card>
          <CardHeader>
            <CardTitle>Détails du Jalon</CardTitle>
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tâches du Jalon ({milestoneTasks.length})</CardTitle>
                <CardDescription>
                  Toutes les tâches associées à cette étape
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                onClick={() => setIsCommentsDialogOpen(true)}
                className="text-blue-600 hover:bg-blue-50"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Commentaires client ({getMilestoneComments().length})
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {milestoneTasks.length > 0 ? (
              <TasksTab 
                milestones={[milestone]}
                projectId={milestone.projet_id}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Aucune tâche</p>
                <p>Aucune tâche n'est associée à ce jalon pour le moment.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Milestone Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le jalon</DialogTitle>
            <DialogDescription>
              Modifiez les détails de ce jalon.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-titre">Titre</Label>
              <Input
                id="edit-titre"
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-statut">Statut</Label>
              <Select value={formData.statut} onValueChange={(value: Milestone['statut']) => setFormData({ ...formData, statut: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a_faire">À Faire</SelectItem>
                  <SelectItem value="en_cours">En Cours</SelectItem>
                  <SelectItem value="termine">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-date_prevue">Date prévue</Label>
              <Input
                id="edit-date_prevue"
                type="date"
                value={formData.date_prevue}
                onChange={(e) => setFormData({ ...formData, date_prevue: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comments Dialog */}
      <Dialog open={isCommentsDialogOpen} onOpenChange={setIsCommentsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Commentaires client sur "{milestone.titre}"
            </DialogTitle>
            <DialogDescription>
              Commentaires laissés par le client sur ce jalon
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <CommentsSection 
              comments={getMilestoneComments()} 
              title="Commentaires du client"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}