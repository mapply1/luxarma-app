"use client";

"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, AlertCircle, MessageSquare, User } from "lucide-react";
import { Ticket, Milestone } from "@/types";
import { useTicketAttachments } from "@/hooks/use-ticket-attachments";

// Dynamic import for better performance
const TicketAttachmentsViewer = dynamic(() => import("./ticket-attachments-viewer").then((mod) => ({ default: mod.TicketAttachmentsViewer })), { ssr: false });

interface TicketDetailsModalProps {
  ticket: Ticket | null;
  milestone?: Milestone;
  isOpen: boolean;
  onClose: () => void;
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

export function TicketDetailsModal({ ticket, milestone, isOpen, onClose }: TicketDetailsModalProps) {
  const { data: attachments = [] } = useTicketAttachments(ticket?.id);

  if (!ticket) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'ouvert':
        return 'Ce ticket a été créé et est en attente de prise en charge par notre équipe.';
      case 'en_cours':
        return 'Notre équipe travaille actuellement sur ce ticket.';
      case 'resolu':
        return 'Cette réclamation a été résolue. Vous pouvez la fermer si vous êtes satisfait.';
      case 'ferme':
        return 'Cette réclamation a été fermée et est considéré comme terminée.';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            {ticket.titre}
          </DialogTitle>
          <DialogDescription>
            Réclamation #{ticket.id} - Créé le {formatDate(ticket.created_at)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status et Priority */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">Statut:</span>
              <Badge className={statusColors[ticket.statut]}>
                {statusLabels[ticket.statut]}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">Priorité:</span>
              <Badge className={priorityColors[ticket.priorite]}>
                <AlertCircle className="h-3 w-3 mr-1" />
                {priorityLabels[ticket.priorite]}
              </Badge>
            </div>
          </div>

          {/* Message de statut */}
          <div className={`p-4 rounded-lg border ${
            ticket.statut === 'ouvert' ? 'bg-red-50 border-red-200' :
            ticket.statut === 'en_cours' ? 'bg-blue-50 border-blue-200' :
            ticket.statut === 'resolu' ? 'bg-green-50 border-green-200' :
            'bg-gray-50 border-gray-200'
          }`}>
            <p className={`text-sm ${
              ticket.statut === 'ouvert' ? 'text-red-700' :
              ticket.statut === 'en_cours' ? 'text-blue-700' :
              ticket.statut === 'resolu' ? 'text-green-700' :
              'text-gray-700'
            }`}>
              {getStatusMessage(ticket.statut)}
            </p>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h4 className="font-medium text-slate-900 mb-2">Description</h4>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          {/* Jalon associé */}
          {milestone && (
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Étape concernée</h4>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="font-medium text-blue-900">{milestone.titre}</p>
                <p className="text-sm text-blue-700 mt-1">{milestone.description}</p>
              </div>
            </div>
          )}

          {/* Informations techniques */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Informations temporelles</h4>
              
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-slate-500" />
                <span className="text-slate-600">Créé le:</span>
                <span className="font-medium">{formatDate(ticket.created_at)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span className="text-slate-600">Dernière mise à jour:</span>
                <span className="font-medium">{formatDate(ticket.updated_at)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Informations de la réclamations</h4>
              
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-slate-500" />
                <span className="text-slate-600">Créé par:</span>
                <span className="font-medium capitalize">{ticket.created_by}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <MessageSquare className="h-4 w-4 text-slate-500" />
                <span className="text-slate-600">ID de la réclamation:</span>
                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">#{ticket.id}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Pièces jointes */}
          <Suspense fallback={<div className="animate-pulse h-32 bg-slate-200 rounded"></div>}>
            <TicketAttachmentsViewer 
              attachments={attachments}
              ticketId={ticket.id}
              showDeleteButton={true}
            />
          </Suspense>

          <Separator />

          {/* Prochaines étapes */}
          <div>
            <h4 className="font-medium text-slate-900 mb-3">Que faire ensuite ?</h4>
            <div className="space-y-2 text-sm text-slate-600">
              {ticket.statut === 'ouvert' && (
                <p>• Notre équipe va examiner votre réclamation et vous répondre sous 24h</p>
              )}
              {ticket.statut === 'en_cours' && (
                <p>• Nous travaillons sur votre demande et vous tiendrons informé des progrès</p>
              )}
              {ticket.statut === 'resolu' && (
                <p>• Si le problème est résolu, cette réclamation sera automatiquement fermée dans 7 jours</p>
              )}
              {ticket.statut === 'ferme' && (
                <p>• Cette réclamations est fermée. Créez une nouvelle réclamation si vous avez d'autres questions</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}