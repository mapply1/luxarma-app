"use client";

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PenTool, RotateCcw, Download, FileText, Calendar } from "lucide-react";
import { Document } from "@/types";
import { useSignDocument } from "@/hooks/use-client-data";

interface DocumentSignatureModalProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentSignatureModal({ document, isOpen, onClose }: DocumentSignatureModalProps) {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>("");
  const signDocumentMutation = useSignDocument();

  if (!document) return null;

  const clearSignature = () => {
    signatureRef.current?.clear();
    setSignatureDataUrl("");
  };

  const saveSignature = () => {
    if (signatureRef.current?.isEmpty()) {
      return;
    }
    const dataUrl = signatureRef.current?.toDataURL();
    setSignatureDataUrl(dataUrl || "");
  };

  const handleSign = async () => {
    if (!signatureDataUrl) {
      saveSignature();
      if (!signatureRef.current || signatureRef.current.isEmpty()) {
        return;
      }
    }

    const finalSignature = signatureDataUrl || signatureRef.current?.toDataURL();
    if (!finalSignature) return;

    try {
      await signDocumentMutation.mutateAsync({
        documentId: document.id,
        signatureData: finalSignature
      });
      onClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const downloadDocument = () => {
    const link = document.createElement('a');
    link.href = document.url;
    link.download = document.nom;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5 text-blue-600" />
            Signer le document
          </DialogTitle>
          <DialogDescription>
            Signez électroniquement ce document pour valider votre accord
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Info */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-red-500" />
                  <div>
                    <CardTitle className="text-lg">{document.nom}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">PDF</Badge>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(document.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="outline" onClick={downloadDocument}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-orange-700 text-sm">
                  📋 <strong>Instructions :</strong> Veuillez lire attentivement le document avant de le signer. 
                  Votre signature électronique a la même valeur légale qu'une signature manuscrite.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Document Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Aperçu du document</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                <iframe
                  src={`${document.url}#toolbar=0&navpanes=0&scrollbar=1`}
                  className="w-full h-96"
                  title={document.nom}
                />
              </div>
            </CardContent>
          </Card>

          {/* Signature Pad */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <PenTool className="h-4 w-4 text-blue-600" />
                Votre signature électronique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
                  <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{
                      className: "w-full h-32 border rounded bg-white cursor-crosshair",
                    }}
                    backgroundColor="rgb(255, 255, 255)"
                    penColor="rgb(0, 0, 0)"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">
                    Signez dans la zone ci-dessus avec votre souris, trackpad ou écran tactile
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={clearSignature}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Effacer
                    </Button>
                    <Button size="sm" onClick={saveSignature}>
                      Prévisualiser
                    </Button>
                  </div>
                </div>

                {signatureDataUrl && (
                  <div className="border rounded-lg p-4 bg-green-50">
                    <h4 className="font-medium text-green-900 mb-2">Aperçu de votre signature :</h4>
                    <img 
                      src={signatureDataUrl} 
                      alt="Signature" 
                      className="border rounded bg-white"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Legal Notice */}
          <Card>
            <CardContent className="p-4">
              <div className="bg-slate-50 p-4 rounded-lg border">
                <h4 className="font-medium text-slate-900 mb-2">Notice légale</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  En signant ce document électroniquement, vous acceptez son contenu et confirmez votre accord. 
                  Cette signature électronique a la même valeur juridique qu'une signature manuscrite selon 
                  la réglementation en vigueur (eIDAS). La signature sera horodatée et conservée de manière sécurisée.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              onClick={handleSign}
              disabled={signDocumentMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {signDocumentMutation.isPending ? "Signature..." : "Signer le document"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}