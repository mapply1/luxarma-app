"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Send } from "lucide-react";
import { useCreateComment } from "@/hooks/use-comments";
import { useCurrentClient } from "@/hooks/use-client-data";

const commentSchema = z.object({
  content: z.string().min(5, "Le commentaire doit contenir au moins 5 caractères"),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentFormProps {
  projectId: string;
  taskId?: string;
  milestoneId?: string;
  onCommentAdded?: () => void;
}

export function CommentForm({ projectId, taskId, milestoneId, onCommentAdded }: CommentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: currentClient } = useCurrentClient();
  const createCommentMutation = useCreateComment();

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = async (data: CommentFormData) => {
    if (!currentClient) return;
    
    setIsSubmitting(true);
    
    try {
      await createCommentMutation.mutateAsync({
        projet_id: projectId,
        task_id: taskId,
        milestone_id: milestoneId,
        content: data.content,
        created_by_client_id: currentClient.id,
      });
      
      form.reset();
      onCommentAdded?.();
    } catch (error) {
      // Error handling is done in the mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-blue-600" />
          Ajouter un commentaire
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="Partagez vos questions, suggestions ou remarques..."
                      className="min-h-[80px] resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting || !form.watch('content')?.trim()}
                size="sm"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? "Envoi..." : "Envoyer"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}