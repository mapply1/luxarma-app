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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDeleteProject } from "@/hooks/use-projects";
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
import { ChevronDown, Search, Trash2, Eye } from "lucide-react";
import { Project } from "@/types";
import Link from "next/link";

interface ProjectsTableProps {
  projects: Project[];
  onProjectDeleted?: (projectId: string) => void;
}

const statusLabels = {
  en_attente: 'En Attente',
  en_cours: 'En Cours',
  en_revision: 'En Révision',
  termine: 'Terminé',
  suspendu: 'Suspendu'
};

const statusColors = {
  en_attente: 'bg-yellow-100 text-yellow-800',
  en_cours: 'bg-blue-100 text-blue-800',
  en_revision: 'bg-orange-100 text-orange-800',
  termine: 'bg-green-100 text-green-800',
  suspendu: 'bg-red-100 text-red-800'
};

export function ProjectsTable({ projects, onProjectDeleted }: ProjectsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('tous');
  const deleteProjectMutation = useDeleteProject();

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client?.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'tous' || project.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const handleDeleteProject = async (project: Project) => {
    deleteProjectMutation.mutate(project.id, {
      onSuccess: () => {
        onProjectDeleted?.(project.id);
      }
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher des projets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[150px]">
              {statusFilter === 'tous' ? 'Tous les statuts' : statusLabels[statusFilter as keyof typeof statusLabels]}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter('tous')}>
              Tous les statuts
            </DropdownMenuItem>
            {Object.entries(statusLabels).map(([key, label]) => (
              <DropdownMenuItem key={key} onClick={() => setStatusFilter(key)}>
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre du Projet</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Dernière Mise à Jour</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.map((project) => (
              <TableRow key={project.id} className="hover:bg-slate-50">
                <TableCell className="font-medium">{project.titre}</TableCell>
                <TableCell>{project.client?.nom}</TableCell>
                <TableCell>
                  <Badge className={statusColors[project.statut]}>
                    {statusLabels[project.statut]}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(project.updated_at)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/projects/${project.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer le projet</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer le projet "{project.titre}" ? 
                            Cette action supprimera également tous les jalons, tâches, tickets, documents et évaluations associés.
                            Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteProject(project)}
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