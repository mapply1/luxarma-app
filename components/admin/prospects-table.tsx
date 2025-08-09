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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Eye, ArrowRight, Archive, Search, Trash2 } from "lucide-react";
import { Prospect } from "@/types";
import { useDeleteProspect } from "@/hooks/use-prospects";
import Link from "next/link";

interface ProspectsTableProps {
  prospects: Prospect[];
  onConvert: (prospect: Prospect) => void;
  onArchive: (prospectId: string) => void;
  onDelete?: (prospectId: string) => void;
}

const statusLabels = {
  nouveau: 'Nouveau',
  contacte: 'Contacté',
  qualifie: 'Qualifié',
  negocie: 'Négocie',
  converti: 'Converti',
  perdu: 'Perdu',
  archive: 'Archivé'
};

const statusColors = {
  nouveau: 'bg-blue-100 text-blue-800',
  contacte: 'bg-yellow-100 text-yellow-800',
  qualifie: 'bg-green-100 text-green-800',
  negocie: 'bg-orange-100 text-orange-800',
  converti: 'bg-emerald-100 text-emerald-800',
  perdu: 'bg-red-100 text-red-800',
  archive: 'bg-gray-100 text-gray-800'
};

const typeDemandeLabels = {
  landing_framer: 'Création Landing Page Framer',
  site_multipage_framer: 'Création d\'un site multipage Framer',
  refonte_framer: 'Refonte d\'un site internet sur Framer',
  integration_design_framer: 'Intégration d\'un design sur Framer',
  ux_ui_figma: 'UX/UI design sur Figma',
  formation_framer: 'Formation sur Framer',
  partenariats: 'Partenariats et collaborations',
  autres: 'Autres',
  // Anciens types pour compatibilité
  site: 'Site Web',
  formation: 'Formation',
  partenariat: 'Partenariat',
  autre: 'Autre'
};

export function ProspectsTable({ prospects, onConvert, onArchive, onDelete }: ProspectsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('tous');
  const [typeFilter, setTypeFilter] = useState<string>('tous');
  const deleteProspectMutation = useDeleteProspect();

  const filteredProspects = prospects.filter(prospect => {
    const matchesSearch = prospect.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prospect.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prospect.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prospect.entreprise?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'tous' || prospect.statut === statusFilter;
    const matchesType = typeFilter === 'tous' || prospect.type_demande === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatBudget = (budgetRange?: string) => {
    return budgetRange || 'Non défini';
  };

  const handleDeleteProspect = async (prospect: Prospect) => {
    deleteProspectMutation.mutate(prospect.id, {
      onSuccess: () => {
        onDelete?.(prospect.id);
      }
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher des prospects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
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

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type de demande" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous les types</SelectItem>
            {Object.entries(typeDemandeLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Prospect</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Échéance</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Créé le</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProspects.map((prospect) => (
              <TableRow key={prospect.id} className="hover:bg-slate-50">
                <TableCell>
                  <div>
                    <div className="font-medium">{prospect.prenom} {prospect.nom}</div>
                    <div className="text-sm text-slate-500">{prospect.email}</div>
                    {prospect.entreprise && (
                      <div className="text-sm text-slate-500">{prospect.entreprise}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {typeDemandeLabels[prospect.type_demande]}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {formatBudget(prospect.budget_range)}
                </TableCell>
                <TableCell className="text-sm">
                  {prospect.echeance_souhaitee ? formatDate(prospect.echeance_souhaitee) : 'Non définie'}
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[prospect.statut]}>
                    {statusLabels[prospect.statut]}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {formatDate(prospect.created_at)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/prospects/${prospect.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    {prospect.statut !== 'converti' && prospect.statut !== 'archive' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onConvert(prospect)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onArchive(prospect.id)}
                          className="text-gray-600 hover:text-gray-700"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer le prospect</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer le prospect "{prospect.prenom} {prospect.nom}" ? 
                            Cette action supprimera également toutes les interactions associées.
                            Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteProspect(prospect)}
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

      {filteredProspects.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <p className="text-lg font-medium mb-2">Aucun prospect trouvé</p>
          <p>
            {searchTerm || statusFilter !== 'tous' || typeFilter !== 'tous'
              ? 'Aucun prospect ne correspond à vos critères de recherche'
              : 'Aucun prospect dans votre CRM'
            }
          </p>
        </div>
      )}
    </div>
  );
}