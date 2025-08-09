"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Client } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const clientSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  telephone: z.string().optional(),
  entreprise: z.string().optional(),
  linkedin_url: z.string().url("URL LinkedIn invalide").optional().or(z.literal("")),
  ville: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  client?: Client;
  isOpen: boolean;
  onClose: () => void;
  onClientSaved: (client: Client) => void;
}

export function ClientForm({ client, isOpen, onClose, onClientSaved }: ClientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!client;

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      nom: client?.nom || "",
      prenom: client?.prenom || "",
      email: client?.email || "",
      telephone: client?.telephone || "",
      entreprise: client?.entreprise || "",
      linkedin_url: client?.linkedin_url || "",
      ville: client?.ville || "",
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true);
    
    try {
      if (isEditing && client) {
        const { data: clientData, error } = await supabase
          .from('clients')
          .update(data)
          .eq('id', client.id)
          .select()
          .single();
        
        if (error) throw error;
        onClientSaved(clientData);
      } else {
        const { data: clientData, error } = await supabase
          .from('clients')
          .insert(data)
          .select()
          .single();
        
        if (error) throw error;
        onClientSaved(clientData);
      }

      form.reset();
      onClose();
      toast.success(isEditing ? "Client mis à jour avec succès !" : "Client créé avec succès !");
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du client:', error);
      toast.error("Erreur lors de la sauvegarde du client");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-luxarma-text">
            {isEditing ? 'Modifier le client' : 'Nouveau client'}
          </DialogTitle>
          <DialogDescription className="text-luxarma-subtext">
            {isEditing ? 'Modifiez les informations du client.' : 'Créez un nouveau client pour votre portefeuille.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="linkedin_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-luxarma-text font-medium">LinkedIn (optionnel)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://linkedin.com/in/jean-dupont"
                        className="border-gray-300 focus:border-luxarma-accent1 focus:ring-luxarma-accent1"
                        {...field} 
                      />
                    </FormControl>
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
                className="bg-luxarma-accent1 hover:bg-blue-700 text-white font-medium"
              >
                {isSubmitting ? "Sauvegarde..." : (isEditing ? 'Sauvegarder' : 'Créer le client')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}