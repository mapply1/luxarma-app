"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MilestoneTimeline } from "@/components/client/milestone-timeline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, CheckCircle, Circle } from "lucide-react";
import { useClientProject, useClientMilestones } from "@/hooks/use-client-data";

// Dynamic import for better performance
const ClientCommandPalette = dynamic(() => import("@/components/client/client-command-palette").then((mod) => ({ default: mod.ClientCommandPalette })), { ssr: false });

function ClientRoadmapContent() {
  const searchParams = useSearchParams();
  const selectedProjectId = searchParams.get('project');
  const { data: project } = useClientProject(selectedProjectId || undefined);
  const { data: milestones = [], isLoading: loading } = useClientMilestones(project?.id);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-24 bg-slate-200 rounded"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4">
                <div className="w-4 h-4 bg-slate-200 rounded-full mt-6"></div>
                <div className="flex-1 h-32 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Projet non trouvé</h1>
          <p className="text-slate-600 mt-2">Le projet demandé n'existe pas ou vous n'y avez pas accès.</p>
        </div>
      </div>
    );
  }

  const completedMilestones = milestones.filter(m => m.statut === 'termine').length;
  const inProgressMilestones = milestones.filter(m => m.statut === 'en_cours').length;
  const upcomingMilestones = milestones.filter(m => m.statut === 'a_faire').length;

  return (
    <>
      <ClientCommandPalette projectId={project.id} />
      
      <div className="p-8 space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Feuille de Route</h1>
          </div>
          <p className="text-gray-600">
            Suivez l'avancement de votre projet étape par étape
          </p>
        </div>

        {/* Project Overview */}
        <Card>
          <CardHeader>
            <CardDescription>
               
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-900">{completedMilestones}</p>
                  <p className="text-sm text-green-700">Étapes terminées</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Clock className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-900">{inProgressMilestones}</p>
                  <p className="text-sm text-blue-700">En cours</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <Circle className="h-8 w-8 text-slate-600" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{upcomingMilestones}</p>
                  <p className="text-sm text-slate-700">À venir</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Étapes du Projet</CardTitle>
            <CardDescription>
              Cliquez sur une étape pour voir les détails et les tâches associées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MilestoneTimeline milestones={milestones} projectId={project.id} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default function ClientRoadmapPage() {
  return (
    <Suspense fallback={
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-24 bg-slate-200 rounded"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4">
                <div className="w-4 h-4 bg-slate-200 rounded-full mt-6"></div>
                <div className="flex-1 h-32 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <ClientRoadmapContent />
    </Suspense>
  );
}