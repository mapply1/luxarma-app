"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/lib/supabase";
import { uploadFile, deleteFile } from "@/lib/storage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddButton } from "@/components/ui/add-button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Download, Trash2, Edit2, PenTool, CheckCircle } from "lucide-react";
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
import { Document } from "@/types";
import { toast } from "sonner";

interface DocumentsTabProps {
  documents: Document[];
  projectId: string;
  onUpdateDocuments: (documents: Document[]) => void;
  onUploadDocument?: () => void;
}

interface FileWithCustomName {
  file: File;
  customName: string;
  requiresSignature: boolean;
}

interface EditingDocument {
  id: string;
  name: string;
  requiresSignature: boolean;
}

export function DocumentsTab({ documents, projectId, onUpdateDocuments, onUploadDocument }: DocumentsTabProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileWithCustomName[]>([]);
  const [editingDocument, setEditingDocument] = useState<EditingDocument | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const filesWithNames = acceptedFiles.map(file => ({
      file,
      customName: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for default name
      requiresSignature: false
    }));
    setUploadedFiles(filesWithNames);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    multiple: true
  });

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return;

    // Validation: check that all files have custom names
    const filesWithoutNames = uploadedFiles.filter(item => !item.customName.trim());
    if (filesWithoutNames.length > 0) {
      toast.error("Veuillez donner un nom à tous les fichiers");
      return;
    }

    try {
      console.log('Starting upload for', uploadedFiles.length, 'files');
      
      const uploadPromises = uploadedFiles.map(async (fileItem) => {
        const { file, customName } = fileItem;
        
        try {
          console.log('Uploading file:', file.name, 'as', customName);
          
          // Upload file to Supabase Storage
          const uploadResult = await uploadFile(file, projectId);
          console.log('Upload result:', uploadResult);
          
          // Get file extension from original file
          const fileExtension = file.name.split('.').pop();
          const finalFileName = `${customName}.${fileExtension}`;
          
          // Create document record in database
          const documentData = {
            projet_id: projectId,
            nom: finalFileName,
            type: file.type,
            url: uploadResult.url,
            taille: file.size,
            uploaded_by: 'admin' as const,
            storage_path: uploadResult.path,
            requires_signature: fileItem.requiresSignature
          };
          
          console.log('Inserting document data:', documentData);
          
          const { data: insertedDocument, error: dbError } = await supabase
            .from('documents')
            .insert(documentData)
            .select()
            .single();
          
          if (dbError) {
            console.error('Database insertion error:', dbError);
            throw dbError;
          }
          
          console.log('Document inserted successfully:', insertedDocument);
          return insertedDocument;
        } catch (fileError) {
          console.error('Error uploading file:', file.name, fileError);
          throw fileError;
        }
      });

      const newDocuments = await Promise.all(uploadPromises);
      onUpdateDocuments([...documents, ...newDocuments]);
      setUploadedFiles([]);
      setIsUploadDialogOpen(false);
      toast.success("Documents téléchargés avec succès");
      onUploadDocument?.();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Erreur lors du téléchargement");
    }
  };

  const handleEditDocument = (document: Document) => {
    setEditingDocument({
      id: document.id,
      name: document.nom,
      requiresSignature: document.requires_signature || false
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingDocument) return;
    
    try {
      const { data: updatedDocument, error } = await supabase
        .from('documents')
        .update({
          nom: editingDocument.name,
          requires_signature: editingDocument.requiresSignature
        })
        .eq('id', editingDocument.id)
        .select()
        .single();
      
      if (error) throw error;
      
      const updatedDocuments = documents.map(d => 
        d.id === editingDocument.id ? { ...d, ...updatedDocument } : d
      );
      onUpdateDocuments(updatedDocuments);
      setIsEditDialogOpen(false);
      setEditingDocument(null);
      toast.success("Document mis à jour avec succès");
    } catch (error) {
      console.error('Erreur lors de la mise à jour du document:', error);
      toast.error("Erreur lors de la mise à jour du document");
    }
  };

  const handleDelete = async (documentId: string) => {
    try {
      const documentToDelete = documents.find(d => d.id === documentId);
      if (!documentToDelete?.storage_path) {
        toast.error("Impossible de supprimer : chemin de fichier manquant");
        return;
      }

      console.log('Deleting document:', documentToDelete.nom, 'from path:', documentToDelete.storage_path);
      
      // Delete from Supabase Storage
      await deleteFile(documentToDelete.storage_path);
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);
      
      if (dbError) throw dbError;
      
      const updatedDocuments = documents.filter(d => d.id !== documentId);
      onUpdateDocuments(updatedDocuments);
      toast.success("Document supprimé avec succès");
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    if (type.includes('word')) return <FileText className="h-8 w-8 text-blue-500" />;
    if (type.includes('image')) return <FileText className="h-8 w-8 text-green-500" />;
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Documents ({documents.length})</h3>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <AddButton onClick={() => onUploadDocument?.()}>
                Télécharger
              </AddButton>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Télécharger des documents</DialogTitle>
                <DialogDescription>
                  Glissez-déposez vos fichiers ou cliquez pour les sélectionner.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  {isDragActive ? (
                    <p className="text-blue-600">Déposez vos fichiers ici...</p>
                  ) : (
                    <div>
                      <p className="text-gray-600 mb-2">
                        Glissez-déposez vos fichiers ici, ou cliquez pour sélectionner
                      </p>
                      <p className="text-sm text-gray-500">
                        PDF, DOC, DOCX, PNG, JPG jusqu'à 10MB
                      </p>
                    </div>
                  )}
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Fichiers sélectionnés:</Label>
                    {uploadedFiles.map((fileItem, index) => (
                      <div key={index} className="space-y-2 p-3 bg-gray-50 rounded border">
                        <div className="flex items-center gap-2">
                          {getFileIcon(fileItem.file.type)}
                          <div>
                            <p className="text-sm font-medium">{fileItem.file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(fileItem.file.size)}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setUploadedFiles(files => files.filter((_, i) => i !== index))}
                            className="ml-auto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`custom-name-${index}`} className="text-xs">
                            Nom personnalisé pour le client
                          </Label>
                          <Input
                            id={`custom-name-${index}`}
                            placeholder="Ex: Contrat de service, Facture janvier..."
                            value={fileItem.customName}
                            onChange={(e) => {
                              const newFiles = [...uploadedFiles];
                              newFiles[index].customName = e.target.value;
                              setUploadedFiles(newFiles);
                            }}
                            className="text-sm"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`requires-signature-${index}`}
                            checked={fileItem.requiresSignature}
                            onCheckedChange={(checked) => {
                              const newFiles = [...uploadedFiles];
                              newFiles[index].requiresSignature = !!checked;
                              setUploadedFiles(newFiles);
                            }}
                          />
                          <Label htmlFor={`requires-signature-${index}`} className="text-xs text-blue-600">
                            Doit être signé par le client
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleUpload} disabled={uploadedFiles.length === 0}>
                    Télécharger ({uploadedFiles.length})
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((document) => (
            <Card key={document.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {getFileIcon(document.type)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-base font-semibold truncate" title={document.nom}>
                          {document.nom}
                        </CardTitle>
                        {document.requires_signature && (
                          <PenTool className="h-4 w-4 text-orange-500" title="Signature requise" />
                        )}
                        {document.is_signed && (
                          <CheckCircle className="h-4 w-4 text-green-500" title="Document signé" />
                        )}
                      </div>
                      <CardDescription className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <span>{formatFileSize(document.taille)}</span>
                          <span>•</span>
                          <span>{formatDate(document.created_at)}</span>
                        </div>
                        <div className="text-xs text-slate-400">
                          Téléchargé par {document.uploaded_by === 'admin' ? 'Admin' : 'Client'}
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                </div>
                
                {/* Badges de statut */}
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">
                    {document.type.includes('pdf') ? 'PDF' :
                     document.type.includes('image') ? 'Image' :
                     document.type.includes('word') ? 'Word' : 'Document'}
                  </Badge>
                  {document.requires_signature && (
                    <Badge className={document.is_signed ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                      {document.is_signed ? 'Signé' : 'À signer'}
                    </Badge>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditDocument(document)}
                    title="Modifier le document"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(document)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Télécharger
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer le document</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer le document "{document.nom}" ? 
                          Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(document.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {documents.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Aucun document</p>
            <p className="mb-4">Commencez par télécharger votre premier document.</p>
            <AddButton onClick={() => setIsUploadDialogOpen(true)}>
              Télécharger un document
            </AddButton>
          </div>
        )}
      </div>

      {/* Edit Document Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le document</DialogTitle>
            <DialogDescription>
              Modifiez le nom et les options du document
            </DialogDescription>
          </DialogHeader>
          {editingDocument && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-document-name">Nom du document</Label>
                <Input
                  id="edit-document-name"
                  value={editingDocument.name}
                  onChange={(e) => setEditingDocument({
                    ...editingDocument,
                    name: e.target.value
                  })}
                  placeholder="Nom descriptif pour le client"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-requires-signature"
                  checked={editingDocument.requiresSignature}
                  onCheckedChange={(checked) => setEditingDocument({
                    ...editingDocument,
                    requiresSignature: !!checked
                  })}
                />
                <Label htmlFor="edit-requires-signature" className="text-blue-600">
                  Doit être signé par le client
                </Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveEdit}>
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}