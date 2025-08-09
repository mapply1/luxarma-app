"use client";

"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddButton } from "@/components/ui/add-button";
import { useClients, useDeleteClient } from "@/hooks/use-clients";
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
import { User, Search, Plus } from "iconoir-react";
import { Client } from "@/types";

// Dynamic imports for better performance
const ClientForm = dynamic(() => import("@/components/admin/client-form").then((mod) => ({ default: mod.ClientForm })), { ssr: false });
const ClientsTable = dynamic(() => import("@/components/admin/clients-table").then((mod) => ({ default: mod.ClientsTable })), { ssr: false });
const AdminCommandPalette = dynamic(() => import("@/components/admin/admin-command-palette").then((mod) => ({ default: mod.AdminCommandPalette })), { ssr: false });

export default function AdminClientsPage() {
  const router = useRouter();
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);

  const searchParams = useSearchParams();
  const shouldOpenForm = searchParams.get('new') === 'true';
  
  const { data: clients = [], isLoading: loading, error } = useClients();
  const deleteClientMutation = useDeleteClient();

  useEffect(() => {
    setFilteredClients(clients);
  }, [clients]);

  useEffect(() => {
    if (shouldOpenForm) {
      setIsClientFormOpen(true);
    }
  }, [shouldOpenForm]);

  useEffect(() => {
    const filtered = clients.filter(client => {
      const searchLower = searchTerm.toLowerCase();
      return (
        client.prenom.toLowerCase().includes(searchLower) ||
        client.nom.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower) ||
        client.entreprise?.toLowerCase().includes(searchLower) ||
        ''
      );
    });
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  const handleClientSaved = (savedClient: Client) => {
    // React Query will automatically refetch and update the cache
    setSelectedClient(null);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setIsClientFormOpen(true);
  };

  const handleNewClient = () => {
    setSelectedClient(null);
    setIsClientFormOpen(true);
  };

  const handleDeleteClient = async (client: Client) => {
    deleteClientMutation.mutate(client.id);
  };

  const handleClientClick = (clientId: string) => {
    router.push(`/admin/clients/${clientId}`);
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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

  return (
    <>
      <Suspense fallback={null}>
        <AdminCommandPalette />
      </Suspense>
      
      <div className="p-8 space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <User className="text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Clients</h1>
          </div>
          <p className="text-gray-600">
            Gérez votre portefeuille de clients et créez de nouveaux projets
          </p>
        </div>

        {/* Actions et recherche */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-luxarma-subtext" />
            <Input
              placeholder="Rechercher par nom, email ou entreprise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 border-gray-300 focus:border-luxarma-accent1 focus:ring-luxarma-accent1"
            />
          </div>
          
          <AddButton 
            onClick={handleNewClient}
          >
            Nouveau client
          </AddButton>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-luxarma-text">Total Clients</CardTitle>
              <User className="text-luxarma-accent1" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-luxarma-text">{clients.length}</div>
              <CardDescription className="text-luxarma-subtext">
                Clients dans votre portefeuille
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-luxarma-text">Résultats</CardTitle>
              <Search className="text-luxarma-emerald" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-luxarma-text">{filteredClients.length}</div>
              <CardDescription className="text-luxarma-subtext">
                {searchTerm ? 'Clients trouvés' : 'Tous les clients'}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-luxarma-text">Ce mois</CardTitle>
              <Plus className="text-luxarma-amber" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-luxarma-text">
                {clients.filter(c => {
                  const clientDate = new Date(c.created_at);
                  const now = new Date();
                  return clientDate.getMonth() === now.getMonth() && clientDate.getFullYear() === now.getFullYear();
                }).length}
              </div>
              <CardDescription className="text-luxarma-subtext">
                Nouveaux clients
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Tableau des clients */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-luxarma-text">Liste des Clients</CardTitle>
            <CardDescription className="text-luxarma-subtext">
              Cliquez sur un client pour voir ses détails et projets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="animate-pulse h-64 bg-slate-200 rounded"></div>}>
              <ClientsTable 
                clients={filteredClients}
                onClientClick={handleClientClick}
                onEditClient={handleEditClient}
                onDeleteClient={handleDeleteClient}
              />
            </Suspense>

            {filteredClients.length === 0 && (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-luxarma-text mb-2">
                  {searchTerm ? 'Aucun client trouvé' : 'Aucun client'}
                </h3>
                <p className="text-luxarma-subtext mb-4">
                  {searchTerm 
                    ? 'Aucun client ne correspond à votre recherche' 
                    : 'Commencez par créer votre premier client'
                  }
                </p>
                {!searchTerm && (
                  <AddButton 
                    onClick={handleNewClient}
                  >
                    Créer un client
                  </AddButton>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Formulaire client */}
      <Suspense fallback={null}>
        <ClientForm
          client={selectedClient || undefined}
          isOpen={isClientFormOpen}
          onClose={() => {
            setIsClientFormOpen(false);
            setSelectedClient(null);
          }}
          onClientSaved={handleClientSaved}
        />
      </Suspense>
    </>
  );
}