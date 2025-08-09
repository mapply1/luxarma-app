"use client";

"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddButton } from "@/components/ui/add-button";
import { useProjects } from "@/hooks/use-projects";
import { Folder, Search } from "iconoir-react";

// Dynamic imports for better performance
const ProjectsTable = dynamic(() => import("@/components/admin/projects-table").then((mod) => ({ default: mod.ProjectsTable })), { ssr: false });
const AdminCommandPalette = dynamic(() => import("@/components/admin/admin-command-palette").then((mod) => ({ default: mod.AdminCommandPalette })), { ssr: false });

export default function AdminProjectsPage() {
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: projects = [], isLoading: loading } = useProjects();
  
  const handleProjectDeleted = (projectId: string) => {
    setFilteredProjects(prev => prev.filter(p => p.id !== projectId));
  };


  useEffect(() => {
    setFilteredProjects(projects);
  }, [projects]);

  useEffect(() => {
    const filtered = projects.filter(project => {
      const searchLower = searchTerm.toLowerCase();
      return (
        project.titre.toLowerCase().includes(searchLower) ||
        project.client?.nom.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower)
      );
    });
    setFilteredProjects(filtered);
  }, [searchTerm, projects]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const activeProjects = projects.filter(p => ['en_cours', 'en_revision'].includes(p.statut));
  const completedProjects = projects.filter(p => p.statut === 'termine');

  return (
    <>
      <Suspense fallback={null}>
        <AdminCommandPalette />
      </Suspense>
      
      <div className="p-8 space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Folder className="text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Projets</h1>
          </div>
          <p className="text-gray-600">
            Gérez tous vos projets et suivez leur avancement
          </p>
        </div>

        {/* Actions et recherche */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-luxarma-subtext" />
            <Input
              placeholder="Rechercher par titre, client ou description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 border-gray-300 focus:border-luxarma-accent1 focus:ring-luxarma-accent1"
            />
          </div>
          
          <Link href="/admin/clients">
            <AddButton>
              Nouveau projet
            </AddButton>
          </Link>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-luxarma-text">Total Projets</CardTitle>
              <Folder className="text-luxarma-accent1" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-luxarma-text">{projects.length}</div>
              <CardDescription className="text-luxarma-subtext">
                Projets dans votre portefeuille
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-luxarma-text">Projets Actifs</CardTitle>
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-luxarma-text">{activeProjects.length}</div>
              <CardDescription className="text-luxarma-subtext">
                En cours et en révision
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-luxarma-text">Terminés</CardTitle>
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-luxarma-text">{completedProjects.length}</div>
              <CardDescription className="text-luxarma-subtext">
                Projets livrés
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Tableau des projets */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-luxarma-text">
              Liste des Projets ({filteredProjects.length})
            </CardTitle>
            <CardDescription className="text-luxarma-subtext">
              Cliquez sur un projet pour voir ses détails
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="animate-pulse h-64 bg-slate-200 rounded"></div>}>
              <ProjectsTable projects={filteredProjects} onProjectDeleted={handleProjectDeleted} />
            </Suspense>

            {filteredProjects.length === 0 && (
              <div className="text-center py-12">
                <Folder className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-luxarma-text mb-2">
                  {searchTerm ? 'Aucun projet trouvé' : 'Aucun projet'}
                </h3>
                <p className="text-luxarma-subtext mb-4">
                  {searchTerm 
                    ? 'Aucun projet ne correspond à votre recherche' 
                    : 'Commencez par créer votre premier projet'
                  }
                </p>
                {!searchTerm && (
                  <Link href="/admin/clients">
                    <AddButton>
                      Créer un projet
                    </AddButton>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}