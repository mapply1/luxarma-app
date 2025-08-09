"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Prospect } from "@/types";
import { supabase } from "@/lib/supabase";
import { useCreateProspect } from "@/hooks/use-prospects";
import { toast } from "sonner";

const prospectSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  telephone: z.string().optional(),
  entreprise: z.string().optional(),
  ville: z.string().optional(),
  type_demande: z.enum(["landing_framer", "site_multipage_framer", "refonte_framer", "integration_design_framer", "ux_ui_figma", "formation_framer", "partenariats", "autres", "site", "formation", "partenariat", "autre"]),
  budget_range: z.string().optional(),
  echeance_souhaitee: z.string().optional(),
  description_projet: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  source: z.string().min(1, "La source est requise"),
  notes_internes: z.string().optional(),
});

type ProspectFormData = z.infer<typeof prospectSchema>;

interface ProspectFormProps {
  prospect?: Prospect;
  isOpen: boolean;
  onClose: () => void;
  onProspectSaved: (prospect: Prospect) => void;
}

const typeDemandeLabels = {
  landing_framer: 'Création Landing Page Framer',
  site_multipage_framer: 'Création d\'un site multipage Framer',
  refonte_framer: 'Refonte d\'un site internet sur Framer',
  integration_design_framer: 'Intégration d\'un design sur Framer',
  ux_ui_figma: 'UX/UI design sur Figma',
  formation_framer: 'Formation sur Framer',
  partenariats: 'Partenariats et collaborations',
  autres: 'Autres',
};

export function ProspectForm({ prospect, isOpen, onClose, onProspectSaved }: ProspectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!prospect;
  const createProspectMutation = useCreateProspect();

  const form = useForm<ProspectFormData>({
    resolver: zodResolver(prospectSchema),
    defaultValues: {
      nom: prospect?.nom || "",
      prenom: prospect?.prenom || "",
      email: prospect?.email || "",
      telephone: prospect?.telephone || "",
      entreprise: prospect?.entreprise || "",
      ville: prospect?.ville || "",
      type_demande: prospect?.type_demande || "site",
      budget_range: prospect?.budget_range || "",
      echeance_souhaitee: prospect?.echeance_souhaitee || "",
      description_projet: prospect?.description_projet || "",
      source: prospect?.source || "Manuel",
      notes_internes: prospect?.notes_internes || "",
    },
  });

  const onSubmit = async (data: ProspectFormData) => {
    setIsSubmitting(true);
    
    try {
      // Convert empty date strings to null for proper database handling
      const cleanedData = {
        ...data,
        echeance_souhaitee: data.echeance_souhaitee || null,
        telephone: data.telephone || null,
        entreprise: data.entreprise || null,
        ville: data.ville || null,
        budget_range: data.budget_range || null,
        notes_internes: data.notes_internes || null,
      };

      if (isEditing && prospect) {
        const { data: prospectData, error } = await supabase
          .from('prospects')
          .update(cleanedData)
          .eq('id', prospect.id)
          .select()
          .single();
        
        if (error) throw error;
        onProspectSaved(prospectData);
      } else {
        // Use the hook for creation to automatically update the cache
        const prospectData = await createProspectMutation.mutateAsync({
          ...cleanedData,
          statut: 'nouveau'
        });
        onProspectSaved(prospectData);
      }

      form.reset();
      onClose();
      if (isEditing) {
        toast.success("Prospect mis à jour avec succès !");
      }
      // Success toast is already handled by the mutation hook for creation
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du prospect:', error);
      toast.error("Erreur lors de la sauvegarde du prospect");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-luxarma-text">
            {isEditing ? 'Modifier le prospect' : 'Nouveau prospect'}
          </DialogTitle>
          <DialogDescription className="text-luxarma-subtext">
            {isEditing ? 'Modifiez les informations du prospect.' : 'Créez un nouveau prospect pour votre CRM.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informations personnelles */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-luxarma-text">Informations personnelles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="prenom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-luxarma-text font-medium">Prénom</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Jean"
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
                  name="nom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-luxarma-text font-medium">Nom</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Dupont"
                          className="border-gray-300 focus:border-luxarma-accent1 focus:ring-luxarma-accent1"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-luxarma-text font-medium">Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="jean.dupont@entreprise.fr"
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
                  name="telephone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-luxarma-text font-medium">Téléphone</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+33 1 23 45 67 89"
                          className="border-gray-300 focus:border-luxarma-accent1 focus:ring-luxarma-accent1"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="entreprise"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-luxarma-text font-medium">Entreprise</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nom de l'entreprise"
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
                  name="ville"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-luxarma-text font-medium">Ville</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Paris"
                          className="border-gray-300 focus:border-luxarma-accent1 focus:ring-luxarma-accent1"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Projet */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-luxarma-text">Projet</h3>
              
              <FormField
                control={form.control}
                name="type_demande"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-luxarma-text font-medium">Type de demande</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:border-luxarma-accent1 focus:ring-luxarma-accent1">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(typeDemandeLabels).map(([key, label]) => (
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
                name="description_projet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-luxarma-text font-medium">Description du projet</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Décrivez le projet en détail..."
                        className="border-gray-300 focus:border-luxarma-accent1 focus:ring-luxarma-accent1 min-h-[100px]"
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
                  name="budget_range"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-luxarma-text font-medium">Budget</FormLabel>
                      <FormControl>
                        <Input 
                          type="text"
                          placeholder="Budget"
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
                  name="echeance_souhaitee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-luxarma-text font-medium">Échéance souhaitée</FormLabel>
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
            </div>

            {/* Suivi */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-luxarma-text">Suivi</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-luxarma-text font-medium">Source</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="LinkedIn, Référence, Site web..."
                          className="border-gray-300 focus:border-luxarma-accent1 focus:ring-luxarma-accent1"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-luxarma-subtext">
                        Comment ce prospect vous a-t-il trouvé ?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes_internes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-luxarma-text font-medium">Notes internes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Notes privées pour votre équipe..."
                        className="border-gray-300 focus:border-luxarma-accent1 focus:ring-luxarma-accent1 min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="text-luxarma-subtext">
                      Ces notes ne sont visibles que par votre équipe
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                className="bg-luxarma-cta hover:bg-gray-800 text-white font-medium transition-colors duration-200"
              >
                {isSubmitting ? "Sauvegarde..." : (isEditing ? 'Sauvegarder' : 'Créer le prospect')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}