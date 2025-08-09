"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddButton } from "@/components/ui/add-button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAllTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";
import { useMilestones } from "@/hooks/use-milestones";
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
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckSquare, Search, Edit2, Trash2, ExternalLink, Target, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Task, Project, Milestone } from "@/types";
import Link from "next/link";

// Dynamic import for better performance
const AdminCommandPalette = dynamic(() => import("@/components/admin/admin-command-palette").then((mod) => ({ default: mod.AdminCommandPalette })), { ssr: false });

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

export default function AdminAllTasksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('tous');
  const [priorityFilter, setPriorityFilter] = useState<string>('tous');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  
  const { data: allTasks = [], isLoading: loading } = useAllTasks();
  const { data: projects = [] } = useProjects();
  const { data: milestones = [] } = useMilestones(selectedProjectId);
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    statut: 'a_faire' as Task['statut'],
    priorite: 'moyenne' as Task['priorite'],
    assignee: '',
    date_echeance: '',
    projet_id: '',
    milestone_id: ''
  });

  const filteredTasks = allTasks.filter(task => {
    const matchesSearch = task.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.project?.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.project?.client?.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'tous' || task.statut === statusFilter;
    const matchesPriority = priorityFilter === 'tous' || task.priorite === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Reset milestone when project changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, milestone_id: '' }));
  }, [selectedProjectId]);

  const handleCreateTask = () => {
    setSelectedTask(null);
    setFormData({
      titre: '',
      description: '',
      statut: 'a_faire',
      priorite: 'moyenne',
      assignee: '',
      date_echeance: '',
      projet_id: '',
      milestone_id: ''
    });
    setSelectedProjectId('');
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      titre: task.titre,
      description: task.description || '',
      statut: task.statut,
      priorite: task.priorite,
      assignee: task.assignee || '',
      date_echeance: task.date_echeance || '',
      projet_id: task.projet_id,
      milestone_id: task.milestone_id || ''
    });
    setSelectedProjectId(task.projet_id);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedTask) return;
    
    try {
      updateTaskMutation.mutate({ 
        id: selectedTask.id, 
        updates: {
          ...formData,
          assignee: formData.assignee || null,
          date_echeance: formData.date_echeance || null,
        }
      });
      
      setIsEditDialogOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleSaveCreate = async () => {
    if (!formData.titre.trim()) {
      return;
    }
    
    if (!formData.projet_id) {
      return;
    }
    
    try {
      createTaskMutation.mutate({
        titre: formData.titre,
        description: formData.description || undefined,
        statut: formData.statut,
        priorite: formData.priorite,
        assignee: formData.assignee || undefined,
        date_echeance: formData.date_echeance || undefined,
        projet_id: formData.projet_id,
        milestone_id: formData.milestone_id || undefined,
      });
      
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const handleDelete = async (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non définie';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="h-16 bg-slate-200 rounded"></div>
          <div className="h-96 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  const todoTasks = allTasks.filter(t => t.statut === 'a_faire').length;
  const inProgressTasks = allTasks.filter(t => t.statut === 'en_cours').length;
  const completedTasks = allTasks.filter(t => t.statut === 'termine').length;
  const highPriorityTasks = allTasks.filter(t => t.priorite === 'haute' && t.statut !== 'termine').length;

  return (
    <>
      <AdminCommandPalette />
      
      <div className="p-8 space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Toutes les Tâches</h1>
          </div>
          <p className="text-gray-600">
            Vue globale de toutes les tâches de vos projets
          </p>
        </div>

        {/* Statistiques des tâches */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">À Faire</CardTitle>
              <Target className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{todoTasks}</div>
              <CardDescription>Tâches en attente</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Cours</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{inProgressTasks}</div>
              <CardDescription>En développement</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terminées</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{completedTasks}</div>
              <CardDescription>Tâches livrées</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Priorité Haute</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">{highPriorityTasks}</div>
              <CardDescription>Tâches urgentes</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card>
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Rechercher tâches, projets ou clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les statuts</SelectItem>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Toutes les priorités</SelectItem>
                  {Object.entries(priorityLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des tâches */}
        <Card>
          <CardHeader>
            <CardTitle>
              Liste des Tâches ({filteredTasks.length})
            </CardTitle>
            <CardDescription>
              Toutes les tâches de vos projets avec liens directs vers les projets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
              <AddButton onClick={handleCreateTask}>
                Nouvelle tâche
              </AddButton>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Projet</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Jalon</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead>Assigné à</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium max-w-[200px]">
                        <div className="truncate" title={task.titre}>
                          {task.titre}
                        </div>
                        {task.description && (
                          <div className="text-xs text-slate-500 truncate mt-1" title={task.description}>
                            {task.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link 
                          href={`/admin/projects/${task.project?.id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {task.project?.titre}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {task.project?.client?.prenom} {task.project?.client?.nom}
                      </TableCell>
                      <TableCell>
                        {task.milestone?.titre || 'Aucun'}
                      </TableCell>
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
                        {formatDate(task.date_echeance)}
                      </TableCell>
                      <TableCell>
                        {task.assignee || 'Non assigné'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/projects/${task.project?.id}`}>
                            <Button variant="ghost" size="sm" title="Voir le projet">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(task)}
                            title="Modifier la tâche"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Supprimer la tâche"
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

            {filteredTasks.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <CheckSquare className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-medium mb-2">
                  {searchTerm || statusFilter !== 'tous' || priorityFilter !== 'tous' 
                    ? 'Aucune tâche trouvée' 
                    : 'Aucune tâche'
                  }
                </p>
                <p>
                  {searchTerm || statusFilter !== 'tous' || priorityFilter !== 'tous'
                    ? 'Aucune tâche ne correspond à vos critères de recherche'
                    : 'Les tâches de vos projets apparaîtront ici'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouvelle tâche</DialogTitle>
            <DialogDescription>
              Créez une nouvelle tâche et assignez-la à un projet
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="create-projet">Projet</Label>
              <Select 
                value={formData.projet_id} 
                onValueChange={(value) => {
                  setFormData({ ...formData, projet_id: value, milestone_id: '' });
                  setSelectedProjectId(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un projet" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.titre} - {project.client?.prenom} {project.client?.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="create-milestone">Jalon (optionnel)</Label>
              <Select 
                value={formData.milestone_id || "no-milestone"} 
                onValueChange={(value) => setFormData({ ...formData, milestone_id: value === "no-milestone" ? "" : value })}
                disabled={!selectedProjectId}
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
            
            <div className="grid gap-2">
              <Label htmlFor="create-titre">Titre</Label>
              <Input
                id="create-titre"
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                placeholder="Titre de la tâche"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-description">Description</Label>
              <Textarea
                id="create-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description détaillée de la tâche"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="create-statut">Statut</Label>
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
                <Label htmlFor="create-priorite">Priorité</Label>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="create-assignee">Assigné à</Label>
                <Input
                  id="create-assignee"
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  placeholder="Nom de la personne"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-date_echeance">Date d'échéance</Label>
                <Input
                  id="create-date_echeance"
                  type="date"
                  value={formData.date_echeance}
                  onChange={(e) => setFormData({ ...formData, date_echeance: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSaveCreate}
              disabled={!formData.titre.trim() || !formData.projet_id || createTaskMutation.isPending}
            >
              {createTaskMutation.isPending ? "Création..." : "Créer la tâche"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier la tâche</DialogTitle>
            <DialogDescription>
              Projet: {selectedTask?.project?.titre}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-assignee">Assigné à</Label>
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
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveEdit}>
              {updateTaskMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}