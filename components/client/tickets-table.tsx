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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Search } from "lucide-react";
import { Ticket } from "@/types";

interface TicketsTableProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
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

export function TicketsTable({ tickets, onTicketClick }: TicketsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('tous');

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'tous' || ticket.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    // Trier par date de création décroissante
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher dans vos réclamations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue />
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
      </div>

      {/* Tableau */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Priorité</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTickets.map((ticket) => (
              <TableRow 
                key={ticket.id} 
                className="cursor-pointer hover:bg-slate-50"
                onClick={() => onTicketClick(ticket)}
              >
                <TableCell className="font-medium">
                  <div className="max-w-[300px]">
                    <p className="truncate">{ticket.titre}</p>
                    <p className="text-sm text-slate-500 truncate">{ticket.description}</p>
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
                <TableCell>{formatDate(ticket.created_at)}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTicketClick(ticket);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {sortedTickets.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <p className="text-lg font-medium mb-2">Aucun ticket trouvé</p>
          <p>
            {searchTerm || statusFilter !== 'tous' 
              ? 'Aucune réclamation ne correspond à vos critères de recherche'
              : 'Vous n\'avez pas encore créé de réclamations'
            }
          </p>
        </div>
      )}

      {tickets.length > 0 && (
        <div className="text-sm text-slate-600">
          {filteredTickets.length} réclamation(s) affichée(s) sur {tickets.length} au total
        </div>
      )}
    </div>
  );
}