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
import { Edit2, Trash2, MessageSquare, Eye } from "lucide-react";
import { Paperclip } from "lucide-react";
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
import { Ticket } from "@/types";
import { useTickets, useCreateTicket, useUpdateTicket, useDeleteTicket } from "@/hooks/use-tickets";
import { useTicketAttachments } from "@/hooks/use-ticket-attachments";
import { TicketAttachmentsViewer } from "@/components/client/ticket-attachments-viewer";
import { toast } from "sonner";

interface TicketsTabProps {
  tickets: Ticket[];
  projectId: string;
  onUpdateTickets: (tickets: Ticket[]) => void;
  onCreateTicket?: () => void;
}

const statusLabels = {
  ouvert: 'Ouvert',
  en_cours: 'En Cours',
  resolu: 'Résolu',
  ferme: 'Fermé'
};

const statusColors = {
  ouvert: 'bg-red-100 text-red-800',
  en_cours: 'bg-blue-100 text-blue-800',
  resolu: 'bg-green-100 text-green-800',
  ferme: 'bg-gray-100 text-gray-800'
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

export function TicketsTab({ tickets, projectId, onUpdateTickets, onCreateTicket }: TicketsTabProps) {
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const createTicketMutation = useCreateTicket();
  const updateTicketMutation = useUpdateTicket();
  const deleteTicketMutation = useDeleteTicket();
  
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    statut: 'ouvert' as Ticket['statut'],
    priorite: 'moyenne' as Ticket['priorite'],
    created_by: 'admin' as Ticket['created_by']
  });

  const handleEdit = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setFormData({
      titre: ticket.titre,
      description: ticket.description,
      statut: ticket.statut,
      priorite: ticket.priorite,
      created_by: ticket.created_by
    });
    setIsEditDialogOpen(true);
  };

  const handleView = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsViewDialogOpen(true);
  };

  const handleCreate = () => {
    setIsCreateDialogOpen(true);
    setFormData({
      titre: '',
      description: '',
      statut: 'ouvert',
      priorite: 'moyenne',
      created_by: 'admin'
    });
    onCreateTicket?.();
  };

  const handleSave = async () => {
    try {
      // Validation des données
      if (!formData.titre.trim()) {
        toast.error("Le titre est obligatoire");
        return;
      }
      
      if (!formData.description.trim()) {
        toast.error("La description est obligatoire");
        return;
      }
      
      if (editingTicket) {
        // Update existing ticket
        updateTicketMutation.mutate({ 
          id: editingTicket.id, 
          updates: formData
        });
        
        // Update local state
        const updatedTickets = tickets.map(t => 
          t.id === editingTicket.id 
            ? { ...t, ...formData, updated_at: new Date().toISOString() }
            : t
        );
        onUpdateTickets(updatedTickets);
      } else {
        // Create new ticket
        createTicketMutation.mutate({
          projet_id: projectId,
          ...formData,
        });
        
        // Update local state
        const newTicket: Ticket = {
          id: Date.now().toString(),
          projet_id: projectId,
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        onUpdateTickets([...tickets, newTicket]);
      }
      
      setEditingTicket(null);
      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
      setFormData({ 
        titre: '', 
        description: '', 
        statut: 'ouvert', 
        priorite: 'moyenne', 
        created_by: 'admin' 
      });
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async (ticketId: string) => {
    try {
      deleteTicketMutation.mutate(ticketId);
      
      const updatedTickets = tickets.filter(t => t.id !== ticketId);
      onUpdateTickets(updatedTickets);
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Composant pour afficher le nombre de pièces jointes
  const AttachmentCount = ({ ticketId }: { ticketId: string }) => {
    const { data: attachments = [] } = useTicketAttachments(ticketId);
    
    if (attachments.length === 0) return null;
    
    return (
      <span className="flex items-center gap-1 text-xs text-blue-600">
        <Paperclip className="h-3 w-3" />
        {attachments.length}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Réclamations de Support ({tickets.length})</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <AddButton onClick={handleCreate}>
              Nouvelle réclamation
            </AddButton>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nouvelle réclamation</DialogTitle>
              <DialogDescription>
                Créer une nouvelle réclamation de support.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="titre">Titre</Label>
                <Input
                  id="titre"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  placeholder="Résumé du problème ou de la demande"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Décrivez en détail le problème ou la demande du client"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="statut">Statut</Label>
                  <Select value={formData.statut} onValueChange={(value: Ticket['statut']) => setFormData({ ...formData, statut: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ouvert">Ouvert</SelectItem>
                      <SelectItem value="en_cours">En Cours</SelectItem>
                      <SelectItem value="resolu">Résolu</SelectItem>
                      <SelectItem value="ferme">Fermé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priorite">Priorité</Label>
                  <Select value={formData.priorite} onValueChange={(value: Ticket['priorite']) => setFormData({ ...formData, priorite: value })}>
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
                <div className="grid gap-2">
                  <Label htmlFor="created_by">Créé par</Label>
                  <Select value={formData.created_by} onValueChange={(value: Ticket['created_by']) => setFormData({ ...formData, created_by: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave}>
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier la réclamation</DialogTitle>
            <DialogDescription>
              Modifiez les détails et le statut de cette réclamation.
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
              <Label htmlFor="edit-description">Description complète</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className="min-h-[150px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-statut">Statut</Label>
                <Select value={formData.statut} onValueChange={(value: Ticket['statut']) => setFormData({ ...formData, statut: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ouvert">Ouvert - En attente</SelectItem>
                    <SelectItem value="en_cours">En Cours - En traitement</SelectItem>
                    <SelectItem value="resolu">Résolu - Solution trouvée</SelectItem>
                    <SelectItem value="ferme">Fermé - Terminé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-priorite">Priorité</Label>
                <Select value={formData.priorite} onValueChange={(value: Ticket['priorite']) => setFormData({ ...formData, priorite: value })}>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={updateTicketMutation.isPending}>
              {updateTicketMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              {selectedTicket?.titre}
            </DialogTitle>
            <DialogDescription>
              Réclamation #{selectedTicket?.id} - Créé le {selectedTicket && formatDate(selectedTicket.created_at)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-6">
              {/* Status et Priority */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600">Statut:</span>
                  <Badge className={statusColors[selectedTicket.statut]}>
                    {statusLabels[selectedTicket.statut]}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600">Priorité:</span>
                  <Badge className={priorityColors[selectedTicket.priorite]}>
                    {priorityLabels[selectedTicket.priorite]}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600">Créé par:</span>
                  <Badge variant="outline">
                    {selectedTicket.created_by === 'client' ? 'Client' : 'Admin'}
                  </Badge>
                </div>
              </div>

              {/* Description complète */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Description complète</h4>
                <div className="bg-slate-50 p-4 rounded-lg border">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                </div>
              </div>

              {/* Pièces jointes */}
              <TicketAttachmentsSection ticketId={selectedTicket.id} />

              {/* Actions rapides */}
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleEdit(selectedTicket);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Modifier et répondre
                </Button>
                
                {selectedTicket.statut !== 'ferme' && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      updateTicketMutation.mutate({ 
                        id: selectedTicket.id, 
                        updates: { statut: 'resolu' }
                      });
                      const updatedTickets = tickets.map(t => 
                        t.id === selectedTicket.id 
                          ? { ...t, statut: 'resolu' as const, updated_at: new Date().toISOString() }
                          : t
                      );
                      onUpdateTickets(updatedTickets);
                      setIsViewDialogOpen(false);
                    }}
                  >
                    Marquer comme résolu
                  </Button>
                )}
              </div>

              {/* Informations temporelles */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-slate-900">Créé le:</span>
                    <p className="text-slate-600">{formatDate(selectedTicket.created_at)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-900">Dernière modification:</span>
                    <p className="text-slate-600">{formatDate(selectedTicket.updated_at)}</p>
                  </div>
                </div>
              </div>
              
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Priorité</TableHead>
              <TableHead>Créé par</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id} className="hover:bg-slate-50">
                <TableCell className="font-medium">
                  <div className="max-w-[250px]">
                    <div className="flex items-center gap-2">
                      <p className="truncate" title={ticket.titre}>{ticket.titre}</p>
                      <AttachmentCount ticketId={ticket.id} />
                    </div>
                    <p className="text-sm text-slate-500 truncate" title={ticket.description}>
                      {ticket.description}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[ticket.statut]}>
                    {statusLabels[ticket.statut]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={priorityColors[ticket.priorite]}>
                    {priorityLabels[ticket.priorite]}
                  </Badge>
                </TableCell>
                <TableCell className="capitalize">
                  <Badge variant="outline">
                    {ticket.created_by === 'client' ? 'Client' : 'Admin'}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(ticket.created_at)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(ticket)}
                      title="Voir la réclamation complète"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(ticket)}
                      title="Modifier la réclamation"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Supprimer la réclamation"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer la réclamation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer la réclamation "{ticket.titre}" ? 
                            Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(ticket.id)}
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

      {tickets.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">Aucune réclamation</p>
          <p className="mb-4">Aucune réclamation de support n'a été créée pour ce projet.</p>
          <AddButton onClick={() => setIsCreateDialogOpen(true)}>
            Créer une réclamation
          </AddButton>
        </div>
      )}
    </div>
  );
}

// Composant pour afficher les pièces jointes dans l'admin
function TicketAttachmentsSection({ ticketId }: { ticketId: string }) {
  const { data: attachments = [], isLoading } = useTicketAttachments(ticketId);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-3"></div>
        <div className="h-16 bg-slate-200 rounded"></div>
      </div>
    );
  }

  if (attachments.length === 0) {
    return (
      <div>
        <h4 className="font-medium text-slate-900 mb-3">Pièces jointes</h4>
        <div className="bg-slate-50 p-4 rounded-lg border text-center">
          <Paperclip className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">Aucune pièce jointe</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h4 className="font-medium text-slate-900 mb-3">
        Pièces jointes ({attachments.length})
      </h4>
      <TicketAttachmentsViewer 
        attachments={attachments}
        ticketId={ticketId}
        showDeleteButton={false}
        showPreviewButton={true}
      />
    </div>
  );
}