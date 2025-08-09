"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Project, Client } from "@/types";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const projectSchema = z.object({
  titre: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  statut: z.enum(["en_attente", "en_cours", "en_revision", "termine", "suspendu"]),
  date_debut: z.string().min(1, "La date de début est requise"),
  date_fin_prevue: z.string().min(1, "La date de fin prévue est requise"),
  budget: z.number().min(0, "Le budget doit être positif").optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  client: Client;
  project?: Project;
  isOpen: boolean;
  onClose: () => void;
  onProjectSaved: (project: Project) => void;
}

export function ProjectForm({ client, project, isOpen, onClose, onProjectSaved }: ProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminLinks, setAdminLinks] = useState<{ name: string; url: string }[]>(
    project?.liens_admin || []
  );
  const isEditing = !!project;

  // Sync adminLinks when project changes
  useEffect(() => {
    if (project?.liens_admin) {
      setAdminLinks(project.liens_admin);
    } else {
      setAdminLinks([]);
    }
  }, [project]);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      titre: project?.titre || "",
      description: project?.description || "",
      statut: project?.statut || "en_attente",
      date_debut: project?.date_debut || "",
      date_fin_prevue: project?.date_fin_prevue || "",
      budget: project?.budget || 0,
    },
  });

  // Reset form when project changes or modal opens/closes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        titre: project?.titre || "",
        description: project?.description || "",
        statut: project?.statut || "en_attente",
        date_debut: project?.date_debut || "",
        date_fin_prevue: project?.date_fin_prevue || "",
        budget: project?.budget || 0,
      });
      setAdminLinks(project?.liens_admin || []);
    }
  }, [project, isOpen, form]);

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    
    try {
      let projectData;
      
      if (isEditing && project) {
        const { data: response_data, error } = await supabase
          .from('projects')
          .update({
            ...data,
            liens_admin: adminLinks.filter(link => link.name.trim() && link.url.trim()),
          })
          .eq('id', project.id)
          .select('*, client:clients(*)')
          .single();
        
        if (error) throw error;
        projectData = response_data;
      } else {
        const { data: response_data, error } = await supabase
          .from('projects')
          .insert({ 
            ...data, 
            client_id: client.id,
            liens_admin: adminLinks.filter(link => link.name.trim() && link.url.trim()),
          })
          .select('*, client:clients(*)')
          .single();
        
        if (error) throw error;
        projectData = response_data;
      }

      onProjectSaved(projectData);
      form.reset();
      onClose();
      toast.success(isEditing ? "Projet mis à jour avec succès !" : "Projet créé avec succès !");
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du projet:', error);
      toast.error("Erreur lors de la sauvegarde du projet");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAdminLink = () => {
    setAdminLinks([...adminLinks, { name: '', url: '' }]);
  };

  const updateAdminLink = (index: number, field: 'name' | 'url', value: string) => {
    const newLinks = [...adminLinks];
    newLinks[index][field] = value;
    setAdminLinks(newLinks);
  };

  const removeAdminLink = (index: number) => {
    const newLinks = adminLinks.filter((_, i) => i !== index);
    setAdminLinks(newLinks);
  };

  const statusLabels = {
    en_attente: 'En Attente',
    en_cours: 'En Cours',
    en_revision: 'En Révision',
    termine: 'Terminé',
    suspendu: 'Suspendu'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-luxarma-text">
            {isEditing ? 'Modifier le projet' : `Nouveau projet pour ${client.prenom} ${client.nom}`}
          </DialogTitle>
          <DialogDescription className="text-luxarma-subtext">
            {isEditing ? 'Modifiez les informations du projet.' : 'Créez un nouveau projet pour ce client.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="titre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-luxarma-text font-medium">Titre du projet</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Site e-commerce pour Dubois Design"
                      className="border-gray-300 focus:border-luxarma-accent1 focus:ring-luxarma-accent1"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-luxarma-text font-medium">Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Décrivez les objectifs et spécifications du projet..."
                      className="border-gray-300 focus:border-luxarma-accent1 focus:ring-luxarma-accent1 min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription className="text-luxarma-subtext">
                    Une description détaillée aidera le client à mieux comprendre les enjeux du projet.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="statut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-luxarma-text font-medium">Statut</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:border-luxarma-accent1 focus:ring-luxarma-accent1">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_debut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-luxarma-text font-medium">Date de début</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        className="border-gray-300 focus:border-luxarma-accent1 focus:ring-luxarma-accent1"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_fin_prevue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-luxarma-text font-medium">Date de fin prévue</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        className="border-gray-300 focus:border-luxarma-accent1 focus:ring-luxarma-accent1"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-luxarma-text font-medium">Budget (€)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      min="0"
                      step="100"
                      placeholder="15000"
                      className="border-gray-300 focus:border-luxarma-accent1 focus:ring-luxarma-accent1"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                    />
                  </FormControl>
                  <FormDescription className="text-luxarma-subtext">
                    Budget estimé pour le projet en euros (optionnel).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Liens Admin Nommés */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Liens Administrateur</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={addAdminLink}>
                  Ajouter un lien
                </Button>
              </div>
              <FormDescription className="text-luxarma-subtext">
                Ajoutez des liens utiles pour ce projet (Figma, staging, documentation, etc.)
              </FormDescription>
              
              {adminLinks.map((link, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 p-4 border rounded-lg">
                  <div>
                    <Label htmlFor={`link-name-${index}`} className="text-sm">Nom du lien</Label>
                    <Input
                      id={`link-name-${index}`}
                      placeholder="Ex: Figma Design"
                      value={link.name}
                      onChange={(e) => updateAdminLink(index, 'name', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`link-url-${index}`} className="text-sm">URL</Label>
                    <Input
                      id={`link-url-${index}`}
                      placeholder="https://figma.com/..."
                      value={link.url}
                      onChange={(e) => updateAdminLink(index, 'url', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeAdminLink(index)}
                      className="w-full"
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
              
              {adminLinks.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-500 mb-3">Aucun lien administrateur configuré</p>
                  <Button type="button" variant="outline" size="sm" onClick={addAdminLink}>
                    Ajouter le premier lien
                  </Button>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="border-gray-300 text-luxarma-text hover:bg-gray-50"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-luxarma-accent1 hover:bg-blue-700 text-white font-medium"
              >
                {isSubmitting ? "Sauvegarde..." : (isEditing ? 'Sauvegarder' : 'Créer le projet')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}