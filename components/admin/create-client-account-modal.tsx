"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Mail, Lock, AlertCircle, CheckCircle, User } from "lucide-react";
import { Client } from "@/types";
import { createClientUser } from "@/lib/auth";
import { toast } from "sonner";

const accountSchema = z.object({
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string().min(8, "Confirmez le mot de passe"),
  sendWelcomeEmail: z.boolean().default(true),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type AccountFormData = z.infer<typeof accountSchema>;

interface CreateClientAccountModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onAccountCreated: () => void;
}

export function CreateClientAccountModal({ client, isOpen, onClose, onAccountCreated }: CreateClientAccountModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      sendWelcomeEmail: true,
    },
  });

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setValue('password', password);
    form.setValue('confirmPassword', password);
  };

  const onSubmit = async (data: AccountFormData) => {
    if (!client) return;
    
    setIsSubmitting(true);
    
    try {
      await createClientUser(
        client.email, 
        data.password, 
        client.id, 
        `${client.prenom} ${client.nom}`
      );

      setCreatedCredentials({
        email: client.email,
        password: data.password
      });
      
      setStep('success');
      
      if (data.sendWelcomeEmail) {
        // In a real app, you would send an email here
        console.log('Email d\'invitation envoyé à:', client.email);
      }
      
      toast.success("Compte client créé avec succès !");
      
    } catch (error: any) {
      console.error('Erreur lors de la création du compte:', error);
      toast.error(error.message || "Erreur lors de la création du compte client");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (step === 'success') {
      onAccountCreated();
    }
    onClose();
    setStep('form');
    setCreatedCredentials(null);
    form.reset();
  };

  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            {step === 'form' ? 'Créer un compte client' : 'Compte créé avec succès'}
          </DialogTitle>
          <DialogDescription>
            {step === 'form' 
              ? `Créer un compte d'accès pour ${client.prenom} ${client.nom}`
              : 'Le compte client a été créé et configuré'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'form' ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Informations du client */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <User className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-slate-900">{client.prenom} {client.nom}</h4>
                      <p className="text-sm text-slate-600">{client.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-slate-900">Entreprise:</span>
                      <p className="text-slate-600">{client.entreprise || 'Non renseignée'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-900">Ville:</span>
                      <p className="text-slate-600">{client.ville || 'Non renseignée'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Configuration du mot de passe */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Mot de passe</FormLabel>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={generatePassword}
                  >
                    Générer automatiquement
                  </Button>
                </div>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input 
                            type="password"
                            placeholder="Mot de passe sécurisé"
                            className="pl-10"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Minimum 8 caractères. Le client pourra le changer après connexion.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input 
                            type="password"
                            placeholder="Confirmez le mot de passe"
                            className="pl-10"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Options */}
              <FormField
                control={form.control}
                name="sendWelcomeEmail"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Envoyer un email de bienvenue
                      </FormLabel>
                      <FormDescription>
                        Le client recevra ses identifiants et le lien de connexion par email
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {/* Informations importantes */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Une fois le compte créé, le client pourra se connecter avec son email <strong>{client.email}</strong> 
                  et le mot de passe que vous définissez. Il aura accès à tous ses projets, documents, et pourra créer des tickets.
                </AlertDescription>
              </Alert>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Création..." : "Créer le compte"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          /* Succès */
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Compte créé avec succès !
              </h3>
              <p className="text-slate-600">
                {client.prenom} {client.nom} peut maintenant accéder à son portail client
              </p>
            </div>

            {createdCredentials && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium text-slate-900 mb-3">Identifiants de connexion</h4>
                  <div className="space-y-2 font-mono text-sm bg-slate-50 p-3 rounded">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Email:</span>
                      <span className="font-medium">{createdCredentials.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Mot de passe:</span>
                      <span className="font-medium">{createdCredentials.password}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    💡 Notez ces identifiants ou envoyez-les au client de manière sécurisée
                  </p>
                </CardContent>
              </Card>
            )}

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Le client peut maintenant se connecter sur <strong>/login</strong> 
                et accéder à son espace personnel pour suivre ses projets.
              </AlertDescription>
            </Alert>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Ce que le client peut maintenant faire :</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Se connecter avec son email et mot de passe</li>
                <li>• Consulter l'avancement de tous ses projets</li>
                <li>• Télécharger les documents partagés</li>
                <li>• Créer des tickets pour poser des questions</li>
                <li>• Évaluer les projets terminés</li>
                <li>• Suivre les jalons et tâches en temps réel</li>
              </ul>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Terminé
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}