"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Prospect, Client, Project } from "@/types";
import { supabase } from "@/lib/supabase";
import { createClientUser } from "@/lib/auth";
import { useDeleteProspect } from "@/hooks/use-prospects";
import { toast } from "sonner";
import { ArrowRight, User, Mail, Lock, CheckCircle, AlertCircle } from "lucide-react";

const projectSchema = z.object({
  titre_projet: z.string().min(5, "Le titre du projet doit contenir au moins 5 caractères"),
  description_projet: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  date_debut: z.string().min(1, "La date de début est requise"),
  date_fin_prevue: z.string().min(1, "La date de fin prévue est requise"),
  budget: z.number().min(0, "Le budget doit être positif").optional(),
});

const accountSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string().min(8, "Confirmez le mot de passe"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type ProjectFormData = z.infer<typeof projectSchema>;
type AccountFormData = z.infer<typeof accountSchema>;

interface ProspectConversionModalProps {
  prospect: Prospect | null;
  isOpen: boolean;
  onClose: () => void;
  onConvert: (project: Project, client: Client) => void;
}

type ConversionStep = 'project_creation' | 'account_creation' | 'success';

export function ProspectConversionModal({ prospect, isOpen, onClose, onConvert }: ProspectConversionModalProps) {
  const [currentStep, setCurrentStep] = useState<ConversionStep>('project_creation');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdClient, setCreatedClient] = useState<Client | null>(null);
  const [createdProject, setCreatedProject] = useState<Project | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);

  const deleteProspectMutation = useDeleteProspect();

  const projectForm = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      titre_projet: prospect ? `Projet ${prospect.entreprise || prospect.nom} - ${prospect.type_demande}` : "",
      description_projet: prospect?.description_projet || "",
      date_debut: "",
      date_fin_prevue: "",
      budget: 0,
    },
  });

  const accountForm = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      email: prospect?.email || "",
      password: "",
      confirmPassword: "",
    },
  });

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    accountForm.setValue('password', password);
    accountForm.setValue('confirmPassword', password);
  };

  const handleProjectSubmit = async (data: ProjectFormData) => {
    if (!prospect) return;
    
    setIsSubmitting(true);
    
    try {
      // Toujours créer un nouveau client à partir du prospect
      const { data: newClientData, error: clientError } = await supabase
        .from('clients')
        .insert({
          nom: prospect.nom,
          prenom: prospect.prenom,
          email: prospect.email,
          telephone: prospect.telephone || null,
          entreprise: prospect.entreprise || null,
          ville: prospect.ville || null,
        })
        .select()
        .single();
      
      if (clientError) throw clientError;

      // Créer le projet
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          titre: data.titre_projet,
          description: data.description_projet,
          client_id: newClientData.id,
          statut: 'en_attente',
          date_debut: data.date_debut,
          date_fin_prevue: data.date_fin_prevue,
          budget: data.budget || null,
        })
        .select('*, client:clients(*)')
        .single();
      
      if (projectError) throw projectError;

      setCreatedClient(newClientData);
      setCreatedProject(projectData);
      setCurrentStep('account_creation');
      
      toast.success("Client et projet créés avec succès !");
      
    } catch (error) {
      console.error('Erreur lors de la création du client/projet:', error);
      toast.error("Erreur lors de la création du client/projet");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccountSubmit = async (data: AccountFormData) => {
    if (!createdClient || !createdProject || !prospect) return;
    
    setIsSubmitting(true);
    
    try {
      // Créer le compte utilisateur dans auth.users
      await createClientUser(
        data.email,
        data.password,
        createdClient.id,
        `${createdClient.prenom} ${createdClient.nom}`
      );

      // Supprimer le prospect de la base de données
      await deleteProspectMutation.mutateAsync(prospect.id);

      setCreatedCredentials({
        email: data.email,
        password: data.password
      });
      
      setCurrentStep('success');
      toast.success("Compte client créé et prospect supprimé avec succès !");
      
    } catch (error) {
      console.error('Erreur lors de la création du compte:', error);
      toast.error("Erreur lors de la création du compte utilisateur");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (currentStep === 'success' && createdProject && createdClient) {
      onConvert(createdProject, createdClient);
    }
    onClose();
    setCurrentStep('project_creation');
    setCreatedClient(null);
    setCreatedProject(null);
    setCreatedCredentials(null);
    projectForm.reset();
    accountForm.reset();
  };

  if (!prospect) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-green-600" />
            {currentStep === 'project_creation' && 'Convertir en projet'}
            {currentStep === 'account_creation' && 'Créer le compte client'}
            {currentStep === 'success' && 'Conversion terminée'}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 'project_creation' && `Étape 1/3 : Créer le projet pour ${prospect.prenom} ${prospect.nom}`}
            {currentStep === 'account_creation' && 'Étape 2/3 : Configurer le compte d\'accès client'}
            {currentStep === 'success' && 'Étape 3/3 : Conversion terminée avec succès'}
          </DialogDescription>
        </DialogHeader>

        {/* Étape 1: Création du projet */}
        {currentStep === 'project_creation' && (
          <Form {...projectForm}>
            <form onSubmit={projectForm.handleSubmit(handleProjectSubmit)} className="space-y-6">
              {/* Informations du prospect */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informations du prospect</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Contact:</strong> {prospect.prenom} {prospect.nom}
                    </div>
                    <div>
                      <strong>Email:</strong> {prospect.email}
                    </div>
                    {prospect.entreprise && (
                      <div>
                        <strong>Entreprise:</strong> {prospect.entreprise}
                      </div>
                    )}
                    <div>
                      <strong>Type:</strong> {prospect.type_demande}
                    </div>
                    {prospect.budget_range && (
                      <div>
                        <strong>Budget:</strong> {prospect.budget_range}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <FormField
                control={projectForm.control}
                name="titre_projet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre du projet</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={projectForm.control}
                name="description_projet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description du projet</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Décrivez les objectifs et spécifications du projet..."
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
                  control={projectForm.control}
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
                  control={projectForm.control}
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

                <FormField
                  control={projectForm.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget final (€)</FormLabel>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Un nouveau client sera créé dans votre base de données. 
                  Le prospect sera supprimé après la conversion complète.
                </AlertDescription>
              </Alert>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Création en cours..." : "Créer le client et projet"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {/* Étape 2: Création du compte utilisateur */}
        {currentStep === 'account_creation' && createdClient && (
          <Form {...accountForm}>
            <form onSubmit={accountForm.handleSubmit(handleAccountSubmit)} className="space-y-6">
              {/* Confirmation de création */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <h4 className="font-medium text-slate-900">Client et projet créés !</h4>
                      <p className="text-sm text-slate-600">
                        Client: {createdClient.prenom} {createdClient.nom} • 
                        Projet: {createdProject?.titre}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Configuration du compte utilisateur */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Créer le compte d'accès client</h3>
                </div>
                
                <FormField
                  control={accountForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email de connexion</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input 
                            type="email"
                            placeholder="Email pour se connecter"
                            className="pl-10"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Le client utilisera cet email pour se connecter (pré-rempli avec l'email du prospect)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                  control={accountForm.control}
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
                  control={accountForm.control}
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

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Une fois le compte créé, le prospect sera définitivement supprimé de votre CRM 
                  et remplacé par le nouveau client dans votre portefeuille.
                </AlertDescription>
              </Alert>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Création du compte..." : "Finaliser la conversion"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {/* Étape 3: Succès */}
        {currentStep === 'success' && createdClient && createdProject && createdCredentials && (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Conversion terminée avec succès !
              </h3>
              <p className="text-slate-600">
                Le prospect a été converti en client et le projet a été créé
              </p>
            </div>

            {/* Résumé */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Nouveau Client</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div><strong>Nom:</strong> {createdClient.prenom} {createdClient.nom}</div>
                  <div><strong>Email:</strong> {createdClient.email}</div>
                  {createdClient.entreprise && (
                    <div><strong>Entreprise:</strong> {createdClient.entreprise}</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Nouveau Projet</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div><strong>Titre:</strong> {createdProject.titre}</div>
                  <div><strong>Statut:</strong> En Attente</div>
                  {createdProject.budget && (
                    <div><strong>Budget:</strong> {createdProject.budget.toLocaleString()} €</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Identifiants de connexion */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Identifiants de connexion client</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 font-mono text-sm bg-slate-50 p-3 rounded border">
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

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Conversion terminée !</strong> Le prospect a été supprimé et remplacé par un client. 
                Le client peut maintenant se connecter sur <strong>/login</strong> pour accéder à son portail.
              </AlertDescription>
            </Alert>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Ce que le client peut maintenant faire :</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Se connecter avec ses identifiants</li>
                <li>• Consulter l'avancement de son projet</li>
                <li>• Télécharger les documents partagés</li>
                <li>• Créer des tickets pour poser des questions</li>
                <li>• Commenter les tâches et jalons</li>
                <li>• Évaluer le projet une fois terminé</li>
              </ul>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Terminer
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}