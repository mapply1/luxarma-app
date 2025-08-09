"use client";

"use client";

import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, FileText, Image as ImageIcon, Calendar, PenTool, CheckCircle, AlertTriangle } from "lucide-react";
import { Document } from "@/types";
import { createDownloadLink } from "@/lib/storage";

// Dynamic imports for better performance
const DocumentPreviewModal = dynamic(() => import("./document-preview-modal").then((mod) => ({ default: mod.DocumentPreviewModal })), { ssr: false });
const DocumentSignatureModal = dynamic(() => import("./document-signature-modal").then((mod) => ({ default: mod.DocumentSignatureModal })), { ssr: false });

interface DocumentsGridProps {
  documents: Document[];
}

export function DocumentsGrid({ documents }: DocumentsGridProps) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedDocumentToSign, setSelectedDocumentToSign] = useState<Document | null>(null);
  const [isSignatureOpen, setIsSignatureOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
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
    if (type.includes('pdf')) return <FileText className="h-12 w-12 text-red-500" />;
    if (type.includes('image')) return <ImageIcon className="h-12 w-12 text-green-500" />;
    return <FileText className="h-12 w-12 text-gray-500" />;
  };

  const getFileTypeLabel = (type: string) => {
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('image')) return 'Image';
    if (type.includes('word')) return 'Word';
    return 'Document';
  };

  const getDocumentCategory = (nom: string) => {
    const lowerName = nom.toLowerCase();
    if (lowerName.includes('facture') || lowerName.includes('invoice')) return 'Facture';
    if (lowerName.includes('contrat') || lowerName.includes('contract')) return 'Contrat';
    if (lowerName.includes('moodboard') || lowerName.includes('mood')) return 'Moodboard';
    if (lowerName.includes('brief')) return 'Brief';
    if (lowerName.includes('wireframe')) return 'Wireframe';
    return 'Document';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Facture': return 'bg-green-100 text-green-800';
      case 'Contrat': return 'bg-blue-100 text-blue-800';
      case 'Moodboard': return 'bg-purple-100 text-purple-800';
      case 'Brief': return 'bg-orange-100 text-orange-800';
      case 'Wireframe': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSignatureStatus = (document: Document) => {
    if (!document.requires_signature) return null;
    if (document.is_signed) {
      return {
        label: 'Signé',
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="h-3 w-3" />
      };
    }
    return {
      label: 'Signature requise',
      color: 'bg-orange-100 text-orange-800',
      icon: <PenTool className="h-3 w-3" />
    };
  };

  const handlePreview = (document: Document) => {
    setSelectedDocument(document);
    setIsPreviewOpen(true);
  };

  const handleSign = (document: Document) => {
    setSelectedDocumentToSign(document);
    setIsSignatureOpen(true);
  };

  const handleDownload = (document: Document) => {
    try {
      // Extract file path from URL for Supabase Storage
      const url = new URL(document.url);
      const filePath = url.pathname.split('/').slice(-3).join('/'); // Get last 3 parts: projectId/documentId/filename
      createDownloadLink(filePath, document.nom);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      // Fallback to direct download
      const link = document.createElement('a');
      link.href = document.url;
      link.download = document.nom;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const groupedDocuments = documents.reduce((acc, doc) => {
    const category = getDocumentCategory(doc.nom);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  // Séparer les documents qui nécessitent une signature
  const documentsToSign = documents.filter(d => d.requires_signature && !d.is_signed);

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun document</h3>
        <p className="text-gray-600">
          Les documents du projet apparaîtront ici une fois téléchargés par l'équipe.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Alert pour documents à signer */}
      {documentsToSign.length > 0 && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h3 className="font-medium text-orange-900">
              Documents en attente de signature
            </h3>
          </div>
          <p className="text-orange-700 text-sm mb-3">
            Vous avez {documentsToSign.length} document(s) qui nécessitent votre signature électronique.
          </p>
          <div className="flex flex-wrap gap-2">
            {documentsToSign.map((doc) => (
              <Button
                key={doc.id}
                size="sm"
                variant="outline"
                onClick={() => handleSign(doc)}
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <PenTool className="h-3 w-3 mr-1" />
                Signer "{doc.nom}"
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-8">
        {Object.entries(groupedDocuments).map(([category, docs]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-slate-900">{category}</h3>
              <Badge className={getCategoryColor(category)}>
                {docs.length} document{docs.length > 1 ? 's' : ''}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {docs.map((document) => (
                <Card key={document.id} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getFileIcon(document.type)}
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base truncate" title={document.nom}>
                            {document.nom}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {getFileTypeLabel(document.type)}
                            </Badge>
                            <span className="text-xs">{formatFileSize(document.taille)}</span>
                            {(() => {
                              const signatureStatus = getSignatureStatus(document);
                              return signatureStatus ? (
                                <Badge className={`text-xs ${signatureStatus.color}`}>
                                  {signatureStatus.icon}
                                  <span className="ml-1">{signatureStatus.label}</span>
                                </Badge>
                              ) : null;
                            })()}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(document.created_at)}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(document)}
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Prévisualiser</span>
                        </Button>
                        {document.requires_signature && !document.is_signed && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSign(document)}
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-orange-600"
                            title="Signer le document"
                          >
                            <PenTool className="h-4 w-4" />
                            <span className="sr-only">Signer</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(document)}
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Télécharger</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>

                  {/* Thumbnail pour les images */}
                  {document.type.includes('image') && (
                    <div className="px-4 pb-4">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={document.url}
                          alt={document.nom}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Suspense fallback={null}>
        <DocumentPreviewModal
          document={selectedDocument}
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setSelectedDocument(null);
          }}
        />
      </Suspense>

      <Suspense fallback={null}>
        <DocumentSignatureModal
          document={selectedDocumentToSign}
          isOpen={isSignatureOpen}
          onClose={() => {
            setIsSignatureOpen(false);
            setSelectedDocumentToSign(null);
          }}
        />
      </Suspense>
    </>
  );
}