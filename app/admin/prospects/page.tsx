"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddButton } from "@/components/ui/add-button";
import { useProspects, useDeleteProspect, useUpdateProspectStatus } from "@/hooks/use-prospects";
import { User, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Prospect, Client, Project } from "@/types";

// Dynamic imports for better performance
const ProspectsTable = dynamic(() => import("@/components/admin/prospects-table").then((mod) => ({ default: mod.ProspectsTable })), { ssr: false });
const ProspectConversionModal = dynamic(() => import("@/components/admin/prospect-conversion-modal").then((mod) => ({ default: mod.ProspectConversionModal })), { ssr: false });
const ProspectForm = dynamic(() => import("@/components/admin/prospect-form").then((mod) => ({ default: mod.ProspectForm })), { ssr: false });
const AdminCommandPalette = dynamic(() => import("@/components/admin/admin-command-palette").then((mod) => ({ default: mod.AdminCommandPalette })), { ssr: false });

export default function AdminProspectsPage() {
  const [isProspectFormOpen, setIsProspectFormOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [isConversionModalOpen, setIsConversionModalOpen] = useState(false);


  const { data: prospects = [], isLoading: loading } = useProspects();
  const deleteProspectMutation = useDeleteProspect();
  const updateProspectStatusMutation = useUpdateProspectStatus();

  const handleNewProspect = () => {
    setSelectedProspect(null);
    setIsProspectFormOpen(true);
  };

  const handleProspectSaved = (savedProspect: Prospect) => {
    // React Query will automatically refetch and update the cache
    setSelectedProspect(null);
    setIsProspectFormOpen(false);
  };

  const handleConvert = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setIsConversionModalOpen(true);
  };

  const handleConversionComplete = (project: Project, client: Client) => {
    // React Query will automatically refetch prospects since prospect was deleted
    setSelectedProspect(null);
    setIsConversionModalOpen(false);
  };

  const handleArchive = (prospectId: string) => {
    updateProspectStatusMutation.mutate({ 
      id: prospectId, 
      statut: 'archive'
    });
  };

  const handleDelete = (prospectId: string) => {
    deleteProspectMutation.mutate(prospectId);
  };
  
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

  const activeProspects = prospects.filter(p => !['converti', 'perdu', 'archive'].includes(p.statut));
  const convertedProspects = prospects.filter(p => p.statut === 'converti');
  const qualifiedProspects = prospects.filter(p => ['qualifie', 'negocie'].includes(p.statut));
  const conversionRate = prospects.length > 0 ? Math.round((convertedProspects.length / prospects.length) * 100) : 0;

  return (
    <>
      <AdminCommandPalette />
      
      <div className="p-8 space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <User className="text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">CRM Prospects</h1>
          </div>
          <p className="text-gray-600">
            Gérez vos prospects et convertissez-les en projets
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-luxarma-subtext">
            {prospects.length} prospects au total
          </div>
          <AddButton 
            onClick={handleNewProspect}
          >
            Nouveau prospect
          </AddButton>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-luxarma-text">Prospects Actifs</CardTitle>
              <User className="h-4 w-4 text-luxarma-accent1" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-luxarma-text">{activeProspects.length}</div>
              <CardDescription className="text-luxarma-subtext">
                En cours de qualification
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-luxarma-text">Qualifiés</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-luxarma-text">{qualifiedProspects.length}</div>
              <CardDescription className="text-luxarma-subtext">
                Prêts à convertir
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-luxarma-text">Convertis</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-luxarma-text">{convertedProspects.length}</div>
              <CardDescription className="text-luxarma-subtext">
                Devenus clients
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-luxarma-text">Taux de conversion</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-luxarma-text">{conversionRate}%</div>
              <CardDescription className="text-luxarma-subtext">
                Prospects → Clients
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Tableau des prospects */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-luxarma-text">Liste des Prospects</CardTitle>
            <CardDescription className="text-luxarma-subtext">
              Gérez vos prospects et suivez leur progression
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProspectsTable 
              prospects={prospects}
              onConvert={handleConvert}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      </div>

      {/* Modal de conversion */}
      <ProspectConversionModal
        prospect={selectedProspect}
        isOpen={isConversionModalOpen}
        onClose={() => {
          setIsConversionModalOpen(false);
          setSelectedProspect(null);
        }}
        onConvert={handleConversionComplete}
      />

      {/* Prospect Form Modal */}
      <ProspectForm
        prospect={selectedProspect}
        isOpen={isProspectFormOpen}
        onClose={() => {
          setIsProspectFormOpen(false);
          setSelectedProspect(null);
        }}
        onProspectSaved={handleProspectSaved}
      />
    </>
  );
}