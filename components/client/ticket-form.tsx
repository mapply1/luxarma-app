"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { uploadTicketAttachment, saveTicketAttachment } from "@/lib/ticket-storage";
import { useCurrentClient, useCreateTicket } from "@/hooks/use-client-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react";
import { Milestone, Ticket, TicketAttachment } from "@/types";
import { toast } from "sonner";

const ticketSchema = z.object({
  titre: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  priorite: z.enum(["basse", "moyenne", "haute"]),
  milestone_id: z.string().optional(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

interface TicketFormProps {
  milestones: Milestone[];
  projectId: string;
  onTicketCreated?: (ticket: Ticket) => void;
}

export function TicketForm({ milestones, projectId, onTicketCreated }: TicketFormProps) {
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: currentClient } = useCurrentClient();
  const createTicketMutation = useCreateTicket();

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      titre: "",
      description: "",
      priorite: "moyenne",
      milestone_id: "",
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB max
      const isValidType = [
        'image/jpeg', 'image/png', 'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ].includes(file.type);
      
      if (!isValidSize) {
        toast.error(`Le fichier ${file.name} est trop volumineux (max 10MB)`);
        return false;
      }
      if (!isValidType) {
        toast.error(`Le fichier ${file.name} n'est pas d'un type supporté`);
        return false;
      }
      return true;
    });
    
    setAttachedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <ImageIcon className="h-6 w-6 text-green-500" />;
    return <FileText className="h-6 w-6 text-red-500" />;
  };

  const onSubmit = async (data: TicketFormData) => {
    setIsSubmitting(true);
    
    try {
      if (!currentClient) {
        toast.error("Vous devez être connecté pour créer une réclamation");
        return;
      }

      // Create the ticket first and get the real ID
      const newTicket = await createTicketMutation.mutateAsync({
        ...data,
        projet_id: projectId,
        milestone_id: data.milestone_id || undefined,
        statut: 'ouvert' as const,
        created_by: 'client' as const
      });
      
      // Now upload files with the real ticket ID
      if (attachedFiles.length > 0) {
        toast.success("Réclamation créée ! Upload des fichiers en cours...");
        
        const uploadPromises = attachedFiles.map(async (file) => {
          try {
            const uploadResult = await uploadTicketAttachment(file, newTicket.id, currentClient.id);
            const attachment = await saveTicketAttachment(newTicket.id, file, uploadResult, currentClient.id);
            return attachment;
          } catch (error) {
            console.error(`Erreur upload ${file.name}:`, error);
            toast.error(`Erreur lors de l'upload de ${file.name}`);
            throw error;
          }
        });
        
        try {
          await Promise.all(uploadPromises);
          toast.success(`Réclamation créée avec ${attachedFiles.length} fichier(s) joint(s) !`);
        } catch (error) {
          toast.warning("Réclamation créée mais certains fichiers n'ont pas pu être uploadés");
        }
      } else {
        toast.success("Réclamation créée avec succès !");
      }
      
      // Call parent callback if provided
      onTicketCreated?.(newTicket);
      
      // Reset form
      form.reset();
      setAttachedFiles([]);

    } catch (error) {
      console.error("Erreur lors de la création de la réclamation:", error);
      toast.error("Erreur lors de la création de la réclamation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Décrivez votre demande ou problème.</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="titre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre de la réclamation</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Résumez votre demande en quelques mots"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="milestone_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Étape concernée (optionnel)</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value === "general-request" ? "" : value)} 
                    value={field.value || "general-request"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une étape spécifique" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="general-request">Demande générale</SelectItem>
                      {milestones.map((milestone) => (
                        <SelectItem key={milestone.id} value={milestone.id}>
                          {milestone.titre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Sélectionnez une étape si votre demande est spécifique à une étape du projet
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priorite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priorité</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="basse">Basse - Suggestion ou amélioration</SelectItem>
                      <SelectItem value="moyenne">Moyenne - Demande standard</SelectItem>
                      <SelectItem value="haute">Haute - Problème urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description détaillée</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Décrivez votre demande en détail. Plus vous donnerez d'informations, plus je pourrai vous aider efficacement."
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pièces jointes */}
            <div className="space-y-4">
              <Label>Pièces jointes (optionnel)</Label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 mb-2">
                  Joignez des captures d'écran ou documents pour m'aider
                </p>
                <Input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  ref={(ref) => {
                    if (ref) {
                      // Store ref for programmatic access
                      (window as any).fileInputRef = ref;
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  Choisir des fichiers
                </Button>
                <p className="text-xs text-slate-500 mt-2">
                  Images, PDF, DOC - Max 10MB par fichier
                </p>
              </div>

              {/* Liste des fichiers sélectionnés */}
              {attachedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Fichiers sélectionnés ({attachedFiles.length})</Label>
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {getFileIcon(file.type)}
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Création..." : "Créer la réclamation"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}