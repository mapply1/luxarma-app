"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddButton } from "@/components/ui/add-button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { useTasks } from "@/hooks/use-tasks";
import { useProjectComments } from "@/hooks/use-comments";
import { Edit2, Trash2, MessageSquare } from "lucide-react";
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
import { Task, Milestone } from "@/types";
import { CommentsSection } from "@/components/client/comments-section";
import { toast } from "sonner";

interface TasksTabProps {
  milestones: Milestone[];
  projectId: string;
  onCreateTask?: () => void;
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

export function TasksTab({ milestones, projectId, onCreateTask }: TasksTabProps) {
  // Use React Query hook instead of props for real-time updates
  const { data: tasks = [] } = useTasks(projectId);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTaskForComments, setSelectedTaskForComments] = useState<Task | null>(null);
  const [isCommentsDialogOpen, setIsCommentsDialogOpen] = useState(false);
  
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const { data: projectComments = [] } = useProjectComments(projectId);
  
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    statut: 'a_faire' as Task['statut'],
    priorite: 'moyenne' as Task['priorite'],
    milestone_id: '',
    assignee: '',
    date_echeance: ''
  });

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
    setFormData({
      titre: task.titre,
      description: task.description || '',
      statut: task.statut,
      priorite: task.priorite,
      milestone_id: task.milestone_id || '',
      assignee: task.assignee || '',
      date_echeance: task.date_echeance || ''
    });
  };

  const handleCreate = () => {
    setIsCreateDialogOpen(true);
    onCreateTask?.();
  };

  const handleSave = async () => {
    try {
      // Validation des données
      if (!formData.titre.trim()) {
        toast.error("Le titre est obligatoire");
        return;
      }
      
      if (editingTask) {
        // Update existing task in Supabase
        updateTaskMutation.mutate({ 
          id: editingTask.id, 
          updates: {
            ...formData,
            milestone_id: formData.milestone_id || null,
            assignee: formData.assignee || null,
            date_echeance: formData.date_echeance || null,
          }
        });
      } else {
        // Create new task in Supabase
        createTaskMutation.mutate({
          projet_id: projectId,
          ...formData,
          milestone_id: formData.milestone_id || null,
          assignee: formData.assignee || null,
          date_echeance: formData.date_echeance || null,
        });
      }
      
      setEditingTask(null);
      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
      setFormData({ titre: '', description: '', statut: 'a_faire', priorite: 'moyenne', milestone_id: '', assignee: '', date_echeance: '' });
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getMilestoneName = (milestoneId?: string) => {
    if (!milestoneId) return 'Aucun';
    const milestone = milestones.find(m => m.id === milestoneId);
    return milestone?.titre || 'Inconnu';
  };

  const getTaskComments = (taskId: string) => {
    return projectComments.filter(c => c.task_id === taskId);
  };

  const handleViewComments = (task: Task) => {
    setSelectedTaskForComments(task);
    setIsCommentsDialogOpen(true);
  };
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tâches ({tasks.length})</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <AddButton onClick={handleCreate}>
              Nouvelle tâche
            </AddButton>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}</DialogTitle>
              <DialogDescription>
                {editingTask ? 'Modifiez les détails de la tâche.' : 'Créez une nouvelle tâche pour ce projet.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="titre">Titre</Label>
                <Input
                  id="titre"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="statut">Statut</Label>
                  <Select value={formData.statut} onValueChange={(value: Task['statut']) => setFormData({ ...formData, statut: value })}>
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
                  <Label htmlFor="priorite">Priorité</Label>
                  <Select value={formData.priorite} onValueChange={(value: Task['priorite']) => setFormData({ ...formData, priorite: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basse">Basse</SelectItem>
                      <SelectItem value="moyenne">Moyenne</SelectItem>
                      <SelectItem value="haute">Haute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="milestone">Jalon</Label>
                <Select 
                  value={formData.milestone_id || "no-milestone"} 
                  onValueChange={(value) => setFormData({ ...formData, milestone_id: value === "no-milestone" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un jalon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-milestone">Aucun jalon</SelectItem>
                    {milestones.map((milestone) => (
                      <SelectItem key={milestone.id} value={milestone.id}>
                        {milestone.titre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="assignee">Assignée à</Label>
                  <Input
                    id="assignee"
                    value={formData.assignee}
                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                    placeholder="Nom de la personne"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date_echeance">Date d'échéance</Label>
                  <Input
                    id="date_echeance"
                    type="date"
                    value={formData.date_echeance}
                    onChange={(e) => setFormData({ ...formData, date_echeance: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setEditingTask(null);
                setIsCreateDialogOpen(false);
              }}>
                Annuler
              </Button>
              <Button onClick={handleSave}>
                {editingTask ? 'Sauvegarder' : 'Créer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier la tâche</DialogTitle>
            <DialogDescription>
              Modifiez les détails de la tâche.
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-statut">Statut</Label>
                <Select value={formData.statut} onValueChange={(value: Task['statut']) => setFormData({ ...formData, statut: value })}>
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
                <Label htmlFor="edit-priorite">Priorité</Label>
                <Select value={formData.priorite} onValueChange={(value: Task['priorite']) => setFormData({ ...formData, priorite: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basse">Basse</SelectItem>
                    <SelectItem value="moyenne">Moyenne</SelectItem>
                    <SelectItem value="haute">Haute</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-milestone">Jalon</Label>
              <Select 
                value={formData.milestone_id || "no-milestone"} 
                onValueChange={(value) => setFormData({ ...formData, milestone_id: value === "no-milestone" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un jalon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-milestone">Aucun jalon</SelectItem>
                  {milestones.map((milestone) => (
                    <SelectItem key={milestone.id} value={milestone.id}>
                      {milestone.titre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-assignee">Assignée à</Label>
                <Input
                  id="edit-assignee"
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  placeholder="Nom de la personne"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-date_echeance">Date d'échéance</Label>
                <Input
                  id="edit-date_echeance"
                  type="date"
                  value={formData.date_echeance}
                  onChange={(e) => setFormData({ ...formData, date_echeance: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditingTask(null);
              setIsEditDialogOpen(false);
            }}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pour voir les commentaires */}
      <Dialog open={isCommentsDialogOpen} onOpenChange={setIsCommentsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Commentaires sur "{selectedTaskForComments?.titre}"
            </DialogTitle>
            <DialogDescription>
              Commentaires laissés par le client sur cette tâche
            </DialogDescription>
          </DialogHeader>
          
          {selectedTaskForComments && (
            <div className="py-4">
              <CommentsSection 
                comments={getTaskComments(selectedTaskForComments.id)} 
                title="Commentaires du client"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Jalon</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Priorité</TableHead>
              <TableHead>Échéance</TableHead>
              <TableHead>Créée le</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.titre}</TableCell>
                <TableCell>{getMilestoneName(task.milestone_id)}</TableCell>
                <TableCell>
                  <Badge className={statusColors[task.statut]}>
                    {statusLabels[task.statut]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={priorityColors[task.priorite]}>
                    {priorityLabels[task.priorite]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {task.date_echeance ? formatDate(task.date_echeance) : 'Non définie'}
                </TableCell>
                <TableCell>{formatDate(task.created_at)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(task)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewComments(task)}
                      title="Voir les commentaires du client"
                    >
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      {getTaskComments(task.id).length > 0 && (
                        <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1 rounded">
                          {getTaskComments(task.id).length}
                        </span>
                      )}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer la tâche</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer la tâche "{task.titre}" ? 
                            Cette action supprimera également tous les commentaires associés.
                            Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(task.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}