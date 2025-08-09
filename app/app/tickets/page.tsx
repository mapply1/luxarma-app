"use client";

"use client";

import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Plus, List, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Ticket } from "@/types";
import { useClientProject, useClientMilestones, useClientTickets, useCreateTicket } from "@/hooks/use-client-data";

// Dynamic imports for better performance
const TicketForm = dynamic(() => import("@/components/client/ticket-form").then((mod) => ({ default: mod.TicketForm })), { ssr: false });
const TicketsTable = dynamic(() => import("@/components/client/tickets-table").then((mod) => ({ default: mod.TicketsTable })), { ssr: false });
const TicketDetailsModal = dynamic(() => import("@/components/client/ticket-details-modal").then((mod) => ({ default: mod.TicketDetailsModal })), { ssr: false });
const ClientCommandPalette = dynamic(() => import("@/components/client/client-command-palette").then((mod) => ({ default: mod.ClientCommandPalette })), { ssr: false });

function ClientTicketsContent() {
  const searchParams = useSearchParams();
  const selectedProjectId = searchParams.get('project');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const { data: project } = useClientProject(selectedProjectId || undefined);
  const { data: milestones = [] } = useClientMilestones(project?.id);
  const { data: tickets = [], isLoading: loading } = useClientTickets(project?.id);

  const handleTicketCreated = (ticket: Ticket) => {
    // React Query cache will be automatically updated by the mutation in TicketForm
  };

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsTicketModalOpen(true);
  };

  const getSelectedMilestone = () => {
    if (!selectedTicket?.milestone_id) return undefined;
    return milestones.find(m => m.id === selectedTicket.milestone_id);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-24 bg-slate-200 rounded"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  const openTickets = tickets.filter(t => t.statut === 'ouvert').length;
  const inProgressTickets = tickets.filter(t => t.statut === 'en_cours').length;
  const resolvedTickets = tickets.filter(t => t.statut === 'resolu').length;
  const closedTickets = tickets.filter(t => t.statut === 'ferme').length;

  return (
    <>
      <Suspense fallback={null}>
        <ClientCommandPalette />
      </Suspense>
      
      <div className="p-8 space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Réclamations</h1>
          </div>
          <p className="text-gray-600">
          Pour vos questions, demandes ou pour signaler des problèmes
          </p>
        </div>

        {/* Statistiques des tickets */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">{openTickets}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Résolus</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{resolvedTickets}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs pour création et liste */}
        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle réclamation
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Mes réclamations ({tickets.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Suspense fallback={<div className="animate-pulse h-96 bg-slate-200 rounded"></div>}>
              <TicketForm 
                milestones={milestones}
                projectId={project?.id || ''}
                onTicketCreated={handleTicketCreated}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>Historique des réclamations</CardTitle>
                <CardDescription>
                  Consultez le statut et les détails de toutes vos réclamations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="animate-pulse h-64 bg-slate-200 rounded"></div>}>
                  <TicketsTable 
                    tickets={tickets}
                    onTicketClick={handleTicketClick}
                  />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal des détails de ticket */}
      <Suspense fallback={null}>
        <TicketDetailsModal
          ticket={selectedTicket}
          milestone={getSelectedMilestone()}
          isOpen={isTicketModalOpen}
          onClose={() => {
            setIsTicketModalOpen(false);
            setSelectedTicket(null);
          }}
        />
      </Suspense>
    </>
  );
}

export default function ClientTicketsPage() {
  return (
    <Suspense fallback={
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-24 bg-slate-200 rounded"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    }>
      <ClientTicketsContent />
    </Suspense>
  );
}