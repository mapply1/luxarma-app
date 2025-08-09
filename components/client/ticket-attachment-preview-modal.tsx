"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, FileText, Image as ImageIcon, Calendar, User } from "lucide-react";
import { TicketAttachment } from "@/types";

interface TicketAttachmentPreviewModalProps {
  attachment: TicketAttachment | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TicketAttachmentPreviewModal({ attachment, isOpen, onClose }: TicketAttachmentPreviewModalProps) {
  if (!attachment) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <ImageIcon className="h-8 w-8 text-green-500" />;
    if (type.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  const getFileTypeLabel = (type: string) => {
    if (type.includes('image')) return 'Image';
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('word')) return 'Document Word';
    return 'Document';
  };

  const canPreview = attachment.type.includes('pdf') || attachment.type.includes('image');

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.nom;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenExternal = () => {
    window.open(attachment.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon(attachment.type)}
              <div>
                <DialogTitle className="text-xl">{attachment.nom}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{getFileTypeLabel(attachment.type)}</Badge>
                  <span>{formatFileSize(attachment.taille)}</span>
                  <span>•</span>
                  <span>Uploadé le {formatDate(attachment.created_at)}</span>
                </DialogDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
              <Button variant="outline" size="sm" onClick={handleOpenExternal}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Ouvrir
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Prévisualisation */}
        <div className="flex-1 min-h-0 max-h-[60vh]">
          {canPreview ? (
            <div className="h-full border rounded-lg overflow-hidden bg-gray-50 relative">
              {attachment.type.includes('pdf') ? (
                <iframe
                  src={`${attachment.url}#toolbar=0&navpanes=0&scrollbar=1`}
                  className="w-full h-full max-h-[60vh] border-0"
                  title={attachment.nom}
                  style={{ 
                    maxHeight: '60vh',
                    minHeight: '400px'
                  }}
                />
              ) : attachment.type.includes('image') ? (
                <div className="flex items-center justify-center h-full p-4 max-h-[60vh] overflow-auto">
                  <img
                    src={attachment.url}
                    alt={attachment.nom}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    style={{ maxHeight: 'calc(60vh - 2rem)' }}
                  />
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 max-h-[60vh] border rounded-lg bg-gray-50">
              <div className="text-center">
                {getFileIcon(attachment.type)}
                <p className="text-slate-600 mt-4">
                  Aperçu non disponible pour ce type de fichier
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Utilisez les boutons ci-dessus pour télécharger ou ouvrir le fichier
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Informations additionnelles */}
        <div className="border-t pt-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-slate-900">Type MIME:</span>
              <p className="text-slate-600 font-mono">{attachment.type}</p>
            </div>
            <div>
              <span className="font-medium text-slate-900">Taille:</span>
              <p className="text-slate-600">{formatFileSize(attachment.taille)}</p>
            </div>
            <div>
              <span className="font-medium text-slate-900">Uploadé par:</span>
              <p className="text-slate-600">Client</p>
            </div>
            <div>
              <span className="font-medium text-slate-900">Date:</span>
              <p className="text-slate-600">{formatDate(attachment.created_at)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}