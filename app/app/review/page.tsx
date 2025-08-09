"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReviewForm } from "@/components/client/review-form";
import { Star, Award, Calendar, DollarSign, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Review } from "@/types";
import { useClientProject, useClientReviews } from "@/hooks/use-client-data";

// Dynamic import for better performance
const ClientCommandPalette = dynamic(() => import("@/components/client/client-command-palette").then((mod) => ({ default: mod.ClientCommandPalette })), { ssr: false });

function ClientReviewContent() {
  const searchParams = useSearchParams();
  const selectedProjectId = searchParams.get('project');
  const { data: project } = useClientProject(selectedProjectId || undefined);
  const { data: reviews = [], isLoading: loading } = useClientReviews(project?.id);
  
  const existingReview = reviews.length > 0 ? reviews[0] : null;

  const handleReviewSubmitted = (review: Review) => {
    // React Query will automatically update the cache
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-slate-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-24 bg-slate-200 rounded"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Projet non trouvé</h1>
          <p className="text-slate-600 mt-2">Le projet demandé n'existe pas ou vous n'y avez pas accès.</p>
        </div>
      </div>
    );
  }

  // Vérifier si le projet est terminé
  const isProjectCompleted = project.statut === 'termine';

  return (
    <>
      <ClientCommandPalette projectId={project.id} />
      
      <div className="p-8 space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-6 w-6 text-yellow-600" />
            <h1 className="text-3xl font-bold text-gray-900">Évaluation du Projet</h1>
          </div>
          <p className="text-gray-600">
            Votre avis m'aide à améliorer mes services. Merci de prendre quelques minutes pour évaluer votre expérience.
          </p>
        </div>

        {/* Aperçu du projet */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {project.titre}
              <Badge className={
                isProjectCompleted 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }>
                {isProjectCompleted ? 'Terminé' : 'En cours'}
              </Badge>
            </CardTitle>
            <CardDescription>
              {project.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="h-4 w-4" />
                <span>Début: {formatDate(project.date_debut)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="h-4 w-4" />
                <span>Fin prévue: {formatDate(project.date_fin_prevue)}</span>
              </div>
              {project.budget && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <DollarSign className="h-4 w-4" />
                  <span>{project.budget.toLocaleString('fr-FR')} €</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contenu selon l'état du projet */}
        {!isProjectCompleted ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Évaluation non disponible
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Projet en cours de développement
                </h3>
                <p className="text-slate-600 mb-4">
                  L'évaluation sera disponible une fois que votre projet sera marqué comme terminé.
                </p>
                <p className="text-sm text-slate-500">
                  Vous recevrez une notification par email lorsque le projet sera finalisé.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : existingReview ? (
          /* Affichage de l'évaluation existante */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Votre évaluation
              </CardTitle>
              <CardDescription>
                Merci pour votre retour ! Voici l'évaluation que vous avez soumise.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Note attribuée</h4>
                  <div className="flex items-center gap-3">
                    {renderStars(existingReview.note)}
                    <span className="text-lg font-semibold text-slate-900">
                      {existingReview.note}/5
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Votre commentaire</h4>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg">
                    {existingReview.commentaire}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="h-4 w-4" />
                  <span>Évaluation soumise le {formatDate(existingReview.created_at)}</span>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-green-700 text-sm">
                    🙏 Merci pour votre temps et vos commentaires constructifs ! 
                    Votre avis m'aide à améliorer continuellement mes services
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Formulaire d'évaluation */
          <ReviewForm 
            project={project}
            onReviewSubmitted={handleReviewSubmitted}
          />
        )}
      </div>
    </>
  );
}

export default function ClientReviewPage() {
  return (
    <Suspense fallback={
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-24 bg-slate-200 rounded"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    }>
      <ClientReviewContent />
    </Suspense>
  );
}