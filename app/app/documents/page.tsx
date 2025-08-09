"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DocumentsGrid } from "@/components/client/documents-grid";
import { FileText, FolderOpen, Download, Eye, PenTool, AlertTriangle } from "lucide-react";
import { useClientProject, useClientDocuments, useDocumentsToSign } from "@/hooks/use-client-data";

// Dynamic import for better performance
const ClientCommandPalette = dynamic(() => import("@/components/client/client-command-palette").then((mod) => ({ default: mod.ClientCommandPalette })), { ssr: false });

function ClientDocumentsContent() {
  const searchParams = useSearchParams();
  const selectedProjectId = searchParams.get('project');
  const { data: project } = useClientProject(selectedProjectId || undefined);
  const { data: documents = [], isLoading: loading } = useClientDocuments(project?.id);
  const { data: documentsToSign = [] } = useDocumentsToSign(project?.id);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-24 bg-slate-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalDocuments = documents.length;
  const totalSize = documents.reduce((sum, doc) => sum + doc.taille, 0);
  const pendingSignatures = documentsToSign.length;
  
  const formatTotalSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const documentTypes = documents.reduce((acc, doc) => {
    if (doc.type.includes('pdf')) acc.pdf++;
    else if (doc.type.includes('image')) acc.images++;
    else acc.autres++;
    return acc;
  }, { pdf: 0, images: 0, autres: 0 });

  return (
    <>
      <ClientCommandPalette />
      
      <div className="p-8 space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          </div>
          <p className="text-gray-600">
            Accédez à tous les documents de votre projet
          </p>
        </div>

        {/* Alert pour signatures en attente */}
        {pendingSignatures > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
                <div>
                  <h3 className="font-medium text-orange-900 mb-1">
                    Action requise : Signature de documents
                  </h3>
                  <p className="text-orange-700 text-sm">
                    {pendingSignatures} document(s) nécessitent votre signature électronique. 
                    Consultez la section ci-dessous pour les signer.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistiques des documents */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slatse-900">{totalDocuments}</div>
              <CardDescription>Documents</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PDFs</CardTitle>
              <FileText className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">{documentTypes.pdf}</div>
              <CardDescription>Fichiers PDF</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Images</CardTitle>
              <Eye className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{documentTypes.images}</div>
              <CardDescription>Images et visuels</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taille</CardTitle>
              <Download className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{formatTotalSize(totalSize)}</div>
              <CardDescription>Espace total</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">À Signer</CardTitle>
              <PenTool className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{pendingSignatures}</div>
              <CardDescription>Signatures requises</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Liste des documents */}
        <Card>
          <CardContent>
            <DocumentsGrid documents={documents} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default function ClientDocumentsPage() {
  return (
    <Suspense fallback={
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-24 bg-slate-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    }>
      <ClientDocumentsContent />
    </Suspense>
  );
}