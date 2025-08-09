"use client";

import { memo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "iconoir-react";
import { Trash2, Edit2 } from "lucide-react";
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
import { Client } from "@/types";

interface ClientsTableProps {
  clients: Client[];
  onClientClick: (clientId: string) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (client: Client) => void;
}

const ClientsTableComponent = ({ clients, onClientClick, onEditClient, onDeleteClient }: ClientsTableProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="rounded-md border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-luxarma-text font-medium">Prénom</TableHead>
            <TableHead className="text-luxarma-text font-medium">Nom</TableHead>
            <TableHead className="text-luxarma-text font-medium">Email</TableHead>
            <TableHead className="text-luxarma-text font-medium">Téléphone</TableHead>
            <TableHead className="text-luxarma-text font-medium">Entreprise</TableHead>
            <TableHead className="text-luxarma-text font-medium">Créé le</TableHead>
            <TableHead className="text-luxarma-text font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow 
              key={client.id} 
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onClientClick(client.id)}
            >
              <TableCell className="font-medium text-luxarma-text">{client.prenom}</TableCell>
              <TableCell className="text-luxarma-text">{client.nom}</TableCell>
              <TableCell className="text-luxarma-subtext">{client.email}</TableCell>
              <TableCell className="text-luxarma-subtext">{client.telephone || 'Non renseigné'}</TableCell>
              <TableCell className="text-luxarma-subtext">{client.entreprise || 'Indépendant'}</TableCell>
              <TableCell className="text-luxarma-subtext">{formatDate(client.created_at)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-luxarma-accent1 hover:bg-blue-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClientClick(client.id);
                    }}
                  >
                    <Eye />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditClient(client);
                    }}
                    className="text-luxarma-subtext hover:bg-gray-50"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer le client</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer le client "{client.prenom} {client.nom}" ? 
                          Cette action supprimera également tous ses projets et toutes les données associées (jalons, tâches, tickets, documents, évaluations).
                          Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDeleteClient(client)}
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
  );
};

export const ClientsTable = memo(ClientsTableComponent);