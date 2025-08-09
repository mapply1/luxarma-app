"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Star } from "lucide-react";
import { Review, Project } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCreateReview } from "@/hooks/use-client-data";

const reviewSchema = z.object({
  note: z.number().min(1, "Veuillez donner une note").max(5, "La note maximum est 5"),
  commentaire: z.string().min(10, "Votre commentaire doit contenir au moins 10 caractères"),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  project: Project;
  onReviewSubmitted: (review: Review) => void;
}

export function ReviewForm({ project, onReviewSubmitted }: ReviewFormProps) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  
  const createReviewMutation = useCreateReview();

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      note: 0,
      commentaire: "",
    },
  });

  const onSubmit = async (data: ReviewFormData) => {
    createReviewMutation.mutate({
      ...data,
      projet_id: project.id,
    }, {
      onSuccess: (reviewData) => {
        onReviewSubmitted(reviewData);
      }
    });
  };

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
    form.setValue('note', rating);
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Très insatisfait';
      case 2: return 'Insatisfait';
      case 3: return 'Neutre';
      case 4: return 'Satisfait';
      case 5: return 'Très satisfait';
      default: return 'Sélectionnez une note';
    }
  };

  return (
    <Card>
    <CardHeader>
    </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Note avec étoiles */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note globale</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={cn(
                              "p-1 rounded transition-colors",
                              "hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            )}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => handleStarClick(star)}
                          >
                            <Star
                              className={cn(
                                "h-8 w-8 transition-colors",
                                (hoverRating >= star || selectedRating >= star)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-slate-300"
                              )}
                            />
                          </button>
                        ))}
                      </div>
                      <p className="text-sm font-medium text-slate-600">
                        {getRatingText(hoverRating || selectedRating)}
                      </p>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Cliquez sur les étoiles pour donner votre note (1 = très insatisfait, 5 = très satisfait)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Commentaire */}
            <FormField
              control={form.control}
              name="commentaire"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Votre commentaire</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Partagez votre expérience : qu'avez-vous apprécié ? Qu'est-ce qui pourrait être amélioré ? Vos suggestions sont précieuses pour moi."
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Rappel sur l'utilisation */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">À quoi sert votre évaluation ?</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Améliorer la qualité de mes services</li>
                <li>• Identifier les points forts et axes d'amélioration</li>
                <li>• Vous proposer une meilleure expérience sur vos futurs projets</li>
                <li>• Témoigner de mon travail auprès d'autres clients (avec votre accord)</li>
              </ul>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={createReviewMutation.isPending || selectedRating === 0}>
                {createReviewMutation.isPending ? "Envoi en cours..." : "Envoyer mon évaluation"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}