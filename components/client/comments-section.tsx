"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { MessageCircle, Clock } from "lucide-react";
import { Comment } from "@/types";

interface CommentsSectionProps {
  comments: Comment[];
  title?: string;
}

export function CommentsSection({ comments, title = "Commentaires" }: CommentsSectionProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (comments.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-slate-400" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-slate-500">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">Aucun commentaire pour le moment</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-blue-600" />
          {title} ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
            <Avatar className="h-8 w-8">
              <div className="bg-blue-100 text-blue-600 text-sm font-medium h-full w-full flex items-center justify-center">
                {comment.client?.prenom?.[0]}{comment.client?.nom?.[0]}
              </div>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-slate-900 text-sm">
                  {comment.client?.prenom} {comment.client?.nom}
                </span>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="h-3 w-3" />
                  {formatDate(comment.created_at)}
                </div>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}