"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, FileText, Image as ImageIcon, Trash2, ZoomIn } from "lucide-react";
import { TicketAttachment } from "@/types";
import { useDeleteTicketAttachment } from "@/hooks/use-ticket-attachments";
import { useCurrentClient } from "@/hooks/use-client-data";
import { TicketAttachmentPreviewModal } from "./ticket-attachment-preview-modal";

interface TicketAttachmentsViewerProps {
  attachments: TicketAttachment[];
  ticketId: string;
  showDeleteButton?: boolean;
  showPreviewButton?: boolean;
}

export function TicketAttachmentsViewer({ 
  attachments, 
  ticketId, 
  showDeleteButton = false,
  showPreviewButton = true 
}: TicketAttachmentsViewerProps) {
  const { data: currentClient } = useCurrentClient();
  const deleteAttachmentMutation = useDeleteTicketAttachment();
  const [selectedAttachment, setSelectedAttachment] = useState<TicketAttachment | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <ImageIcon className="h-8 w-8 text-green-500" />;
    return <FileText className="h-8 w-8 text-red-500" />;
  };

  const getFileTypeLabel = (type: string) => {
    if (type.includes('image')) return 'Image';
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('word')) return 'Word';
    return 'Document';
  };

  const handleDownload = (attachment: TicketAttachment) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.nom;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (attachmentId: string) => {
    deleteAttachmentMutation.mutate(attachmentId);
  };

  const handlePreview = (attachment: TicketAttachment) => {
    setSelectedAttachment(attachment);
    setIsPreviewOpen(true);
  };
  if (attachments.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-600" />
          Pièces jointes ({attachments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border">
              {getFileIcon(attachment.type)}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" title={attachment.nom}>
                  {attachment.nom}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Badge variant="outline" className="text-xs">
                    {getFileTypeLabel(attachment.type)}
                  </Badge>
                  <span>{formatFileSize(attachment.taille)}</span>
                  <span>•</span>
                  <span>{formatDate(attachment.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {showPreviewButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreview(attachment)}
                    className="h-8 w-8 p-0"
                    title="Prévisualiser"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(attachment)}
                  className="h-8 w-8 p-0"
                  title="Télécharger"
                >
                  <Download className="h-4 w-4" />
                </Button>
                {showDeleteButton && 
                 currentClient && 
                 attachment.uploaded_by_client_id === currentClient.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(attachment.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <TicketAttachmentPreviewModal
        attachment={selectedAttachment}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setSelectedAttachment(null);
        }}
      />
    </Card>
  );
}