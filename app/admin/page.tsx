"use client";

"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, Users, CheckCircle, Clock, UserPlus, TrendingUp } from "lucide-react";
import { Project } from "@/types";
import { supabase } from "@/lib/supabase";

// Dynamic import for better performance
const ProjectsTable = dynamic(() => import("@/components/admin/projects-table").then((mod) => ({ default: mod.ProjectsTable })), { ssr: false });

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [prospects, setProspects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch projects with clients
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*, client:clients(*)')
          .order('created_at', { ascending: false });
        
        if (projectsError) throw projectsError;

        // Fetch prospects
        const { data: prospectsData, error: prospectsError } = await supabase
          .from('prospects')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (prospectsError) throw prospectsError;

        setProjects(projectsData || []);
        setProspects(prospectsData || []);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const activeProjects = projects.filter(p => ['en_cours', 'en_revision'].includes(p.statut));
  const completedProjects = projects.filter(p => p.statut === 'termine');
  const totalClients = new Set(projects.map(p => p.client_id)).size;
  const totalProspects = prospects.length;
  const qualifiedProspects = prospects.filter(p => ['qualifie', 'negocie'].includes(p.statut)).length;
  const conversionRate = totalProspects > 0 ? Math.round((prospects.filter(p => p.statut === 'converti').length / totalProspects) * 100) : 0;

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-200 rounded"></div>
            ))}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Admin</h1>
          <p className="text-gray-600 mt-2">Gérez vos projets et clients</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Tableau de Bord Admin</h1>
        <p className="text-slate-600 mt-2">Gérez vos projets et clients</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projets Actifs</CardTitle>
            <FolderOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects.length}</div>
            <CardDescription>
              Projets en cours et en révision
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients Actifs</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <CardDescription>
              Clients avec projets en cours
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projets Terminés</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedProjects.length}</div>
            <CardDescription>
              Projets livrés ce mois
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prospects</CardTitle>
            <UserPlus className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProspects}</div>
            <CardDescription>
              {qualifiedProspects} qualifiés
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <CardDescription>
              Taux prospect → client
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projets Actifs</CardTitle>
          <CardDescription>
            Liste de tous les projets en cours de développement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="animate-pulse h-64 bg-slate-200 rounded"></div>}>
            <ProjectsTable projects={activeProjects} />
          </Suspense>
        </CardContent>
      </Card>

      {/* Prospects récents */}
      <Card>
        <CardHeader>
          <CardTitle>Prospects Récents</CardTitle>
          <CardDescription>
            Les derniers prospects ajoutés au CRM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {prospects.map((prospect) => (
              <div key={prospect.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{prospect.prenom} {prospect.nom}</p>
                  <p className="text-sm text-slate-500">{prospect.entreprise || prospect.email}</p>
                  <p className="text-sm text-slate-500">{prospect.type_demande} • {prospect.statut}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">
                    {new Date(prospect.created_at).toLocaleDateString('fr-FR')}
                  </p>
                  {prospect.budget_max && (
                    <p className="text-sm font-medium">
                      Jusqu'à {prospect.budget_max.toLocaleString()} €
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}