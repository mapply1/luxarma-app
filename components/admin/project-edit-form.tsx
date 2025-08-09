"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Project } from "@/types";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const projectSchema = z.object({
  titre: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  statut: z.enum(["en_attente", "en_cours", "en_revision", "termine", "suspendu"]),
  date_debut: z.string().min(1, "La date de début est requise"),
  date_fin_prevue: z.string().min(1, "La date de fin prévue est requise"),
  budget: z.number().min(0, "Le budget doit être positif").optional(),
  liens_admin: z.array(z.string()).optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectEditFormProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onProjectUpdated: (project: Project) => void;
}

export function ProjectEditForm({ project, isOpen, onClose, onProjectUpdated }: ProjectEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminLinks, setAdminLinks] = useState<{ name: string; url: string }[]>(
    project?.liens_admin || []
  );

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

  // Reset form when project changes
  useEffect(() => {
    if (project) {
      form.reset({
        titre: project.titre,
        description: project.description,
        statut: project.statut,
        date_debut: project.date_debut,
        date_fin_prevue: project.date_fin_prevue,
        budget: project.budget || 0,
      });
    }
  }, [project, form]);

  const onSubmit = async (data: ProjectFormData) => {
    if (!project) return;
    
    setIsSubmitting(true);
    
    try {
      const { data: updatedProject, error } = await supabase
        .from('projects')
        .update({
          ...data,
          liens_admin: adminLinks.filter(link => link.name.trim() && link.url.trim()),
        })
        .eq('id', project.id)
        .select('*, client:clients(*)')
        .single();
      
      if (error) throw error;

      onProjectUpdated(updatedProject);
      onClose();
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet:', error);
      toast.error("Erreur lors de la mise à jour du projet");
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

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le projet</DialogTitle>
          <DialogDescription>
            Modifiez les informations du projet "{project.titre}".
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="titre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre du projet</FormLabel>
                  <FormControl>
                    <Input placeholder="Titre du projet" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Description détaillée du projet..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
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
                    <FormLabel>Statut</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
                    <FormLabel>Date de début</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <FormLabel>Date de fin prévue</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                  <FormLabel>Budget (€)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      min="0"
                      step="100"
                      placeholder="15000"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Budget total du projet en euros.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Liens Admin */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Liens Administrateur</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={addAdminLink}>
                  Ajouter un lien
                </Button>
              </div>
              <FormDescription>
                Ajoutez des liens utiles pour ce projet avec des noms descriptifs
              </FormDescription>
              
              {adminLinks.map((link, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 p-4 border rounded-lg">
                  <div>
                    <Label htmlFor={`edit-link-name-${index}`} className="text-sm">Nom du lien</Label>
                    <Input
                      id={`edit-link-name-${index}`}
                      placeholder="Ex: Figma Design"
                      value={link.name}
                      onChange={(e) => updateAdminLink(index, 'name', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`edit-link-url-${index}`} className="text-sm">URL</Label>
                    <Input
                      id={`edit-link-url-${index}`}
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
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-500 mb-3">Aucun lien administrateur configuré</p>
                  <Button type="button" variant="outline" size="sm" onClick={addAdminLink}>
                    Ajouter le premier lien
                  </Button>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sauvegarde..." : 'Sauvegarder les modifications'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}