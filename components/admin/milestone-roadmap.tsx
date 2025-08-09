"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddButton } from "@/components/ui/add-button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GripVertical, Edit2, Trash2, Eye, ExternalLink } from "lucide-react";
import { MessageSquare } from "lucide-react";
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
import { Milestone } from "@/types";
import { useProjectComments } from "@/hooks/use-comments";
import { CommentsSection } from "@/components/client/comments-section";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface MilestoneRoadmapProps {
  milestones: Milestone[];
  projectId: string;
  onUpdateMilestones: (milestones: Milestone[]) => void;
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

export function MilestoneRoadmap({ milestones, projectId, onUpdateMilestones }: MilestoneRoadmapProps) {
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedMilestoneForComments, setSelectedMilestoneForComments] = useState<Milestone | null>(null);
  const [isCommentsDialogOpen, setIsCommentsDialogOpen] = useState(false);
  
  const { data: projectComments = [] } = useProjectComments(projectId);
  
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    statut: 'a_faire' as Milestone['statut'],
    date_prevue: new Date().toISOString().split('T')[0]
  });

  const updateMilestonesOrder = async (reorderedMilestones: Milestone[]) => {
    try {
      // Update the order in Supabase
      const updates = reorderedMilestones.map((milestone, index) => 
        supabase
          .from('milestones')
          .update({ ordre: index + 1 })
          .eq('id', milestone.id)
      );
      
      await Promise.all(updates);
      onUpdateMilestones(reorderedMilestones);
      toast.success("Ordre des jalons mis à jour");
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'ordre:', error);
      toast.error("Erreur lors de la mise à jour de l'ordre");
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(milestones);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order
    const updatedItems = items.map((item, index) => ({
      ...item,
      ordre: index + 1
    }));

    updateMilestonesOrder(updatedItems);
  };

  const handleEdit = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setFormData({
      titre: milestone.titre,
      description: milestone.description,
      statut: milestone.statut,
      date_prevue: milestone.date_prevue
    });
  };

  const handleSave = async () => {
    // Validation des données
    if (!formData.titre.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }
    
    if (!formData.date_prevue) {
      toast.error("La date prévue est obligatoire");
      return;
    }
    
    try {
      if (editingMilestone) {
        // Update existing milestone in Supabase
        const { data: updatedMilestone, error } = await supabase
          .from('milestones')
          .update(formData)
          .eq('id', editingMilestone.id)
          .select()
          .single();
        
        if (error) throw error;
        
        const updatedMilestones = milestones.map(m => 
          m.id === editingMilestone.id ? updatedMilestone : m
        );
        onUpdateMilestones(updatedMilestones);
        toast.success("Jalon mis à jour avec succès");
      } else {
        // Create new milestone in Supabase
        const { data: newMilestone, error } = await supabase
          .from('milestones')
          .insert({
            ...formData,
            projet_id: projectId,
            ordre: milestones.length + 1,
          })
          .select()
          .single();
        
        if (error) throw error;
        
        onUpdateMilestones([...milestones, newMilestone]);
        toast.success("Jalon créé avec succès");
      }
      
      setEditingMilestone(null);
      setIsCreateDialogOpen(false);
      setFormData({ 
        titre: '', 
        description: '', 
        statut: 'a_faire', 
        date_prevue: new Date().toISOString().split('T')[0] 
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du jalon:', error);
      toast.error("Erreur lors de la sauvegarde du jalon");
    }
  };

  const handleDelete = async (milestoneId: string) => {
    try {
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', milestoneId);
      
      if (error) throw error;
      
      const updatedMilestones = milestones.filter(m => m.id !== milestoneId);
      onUpdateMilestones(updatedMilestones);
      toast.success("Jalon supprimé avec succès");
    } catch (error) {
      console.error('Erreur lors de la suppression du jalon:', error);
      toast.error("Erreur lors de la suppression du jalon");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getMilestoneComments = (milestoneId: string) => {
    return projectComments.filter(c => c.milestone_id === milestoneId);
  };

  const handleViewComments = (milestone: Milestone) => {
    setSelectedMilestoneForComments(milestone);
    setIsCommentsDialogOpen(true);
  };
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Feuille de Route</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <AddButton size="sm">
              Ajouter un jalon
            </AddButton>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau jalon</DialogTitle>
              <DialogDescription>
                Créez un nouveau jalon pour ce projet.
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
              <div className="grid gap-2">
                <Label htmlFor="statut">Statut</Label>
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
                <Label htmlFor="date_prevue">Date prévue</Label>
                <Input
                  id="date_prevue"
                  type="date"
                  value={formData.date_prevue}
                  onChange={(e) => setFormData({ ...formData, date_prevue: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave}>Créer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="milestones">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {milestones.map((milestone, index) => (
                <Draggable key={milestone.id} draggableId={milestone.id} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`${snapshot.isDragging ? 'shadow-lg' : ''}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                            </div>
                            <CardTitle className="text-lg">{milestone.titre}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={statusColors[milestone.statut]}>
                              {statusLabels[milestone.statut]}
                            </Badge>
                            <Link href={`/admin/milestones/${milestone.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Voir les détails du jalon"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(milestone)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
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
                                  <Button variant="outline" onClick={() => setEditingMilestone(null)}>
                                    Annuler
                                  </Button>
                                  <Button onClick={handleSave}>Sauvegarder</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewComments(milestone)}
                              title="Voir les commentaires du client"
                            >
                              <MessageSquare className="h-4 w-4 text-blue-600" />
                              {getMilestoneComments(milestone.id).length > 0 && (
                                <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1 rounded">
                                  {getMilestoneComments(milestone.id).length}
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
                                    onClick={() => handleDelete(milestone.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <span>Échéance: {formatDate(milestone.date_prevue)}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>{milestone.description}</CardDescription>
                        {milestone.date_completee && (
                          <p className="text-sm text-green-600 mt-2">
                            Complété le {formatDate(milestone.date_completee)}
                          </p>
                        )}
                        <div className="mt-3">
                          <Link href={`/admin/milestones/${milestone.id}`}>
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Voir les détails et tâches
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Dialog pour voir les commentaires */}
      <Dialog open={isCommentsDialogOpen} onOpenChange={setIsCommentsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Commentaires sur "{selectedMilestoneForComments?.titre}"
            </DialogTitle>
            <DialogDescription>
              Commentaires laissés par le client sur ce jalon
            </DialogDescription>
          </DialogHeader>
          
          {selectedMilestoneForComments && (
            <div className="py-4">
              <CommentsSection 
                comments={getMilestoneComments(selectedMilestoneForComments.id)} 
                title="Commentaires du client"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}