"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Circle, Calendar, ArrowRight, MessageCircle } from "lucide-react";
import { Milestone } from "@/types";

interface MilestoneTimelineProps {
  milestones: Milestone[];
  projectId?: string;
}

const statusIcons = {
  termine: CheckCircle,
  en_cours: Clock,
  a_faire: Circle
};

const statusLabels = {
  termine: 'Terminé',
  en_cours: 'En Cours',
  a_faire: 'À Faire'
};

const statusColors = {
  termine: 'bg-green-100 text-green-800 border-green-200',
  en_cours: 'bg-blue-100 text-blue-800 border-blue-200',
  a_faire: 'bg-slate-100 text-slate-800 border-slate-200'
};

const timelineColors = {
  termine: 'bg-green-500',
  en_cours: 'bg-blue-500',
  a_faire: 'bg-slate-300'
};

export function MilestoneTimeline({ milestones, projectId }: MilestoneTimelineProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const sortedMilestones = [...milestones].sort((a, b) => a.ordre - b.ordre);

  return (
    <div className="space-y-8">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200"></div>
        
        {sortedMilestones.map((milestone, index) => {
          const StatusIcon = statusIcons[milestone.statut];
          const isLast = index === sortedMilestones.length - 1;
          
          return (
            <div key={milestone.id} className="relative pb-8">
              {/* Timeline dot */}
              <div className={`absolute left-4 w-4 h-4 rounded-full border-2 border-white ${timelineColors[milestone.statut]} shadow-md`}></div>
              
              {/* Milestone card */}
              <div className="ml-16">
                <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group">
                  <Link href={`/app/milestones/${milestone.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`h-5 w-5 ${
                              milestone.statut === 'termine' ? 'text-green-600' :
                              milestone.statut === 'en_cours' ? 'text-blue-600' : 'text-slate-400'
                            }`} />
                            <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">{milestone.titre}</CardTitle>
                          </div>
                          <Badge className={statusColors[milestone.statut]}>
                            {statusLabels[milestone.statut]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              // Could open a comment modal or navigate to milestone page
                            }}
                            title="Commenter cette étape"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MessageCircle className="h-4 w-4 text-blue-600" />
                          </Button>
                          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="h-4 w-4" />
                        <span>Échéance: {formatDate(milestone.date_prevue)}</span>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <CardDescription className="text-base leading-relaxed">
                        {milestone.description}
                      </CardDescription>
                      
                      {milestone.date_completee && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm text-green-700 font-medium">
                            ✅ Complété le {formatDate(milestone.date_completee)}
                          </p>
                        </div>
                      )}
                      
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <Button variant="ghost" size="sm" className="group-hover:bg-blue-50 group-hover:text-blue-600">
                          Voir les détails
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              </div>
            </div>
          );
        })}
      </div>
      
      {milestones.length === 0 && (
        <div className="text-center py-12">
          <Circle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Aucun jalon défini</h3>
          <p className="text-slate-600">
            La feuille de route de ce projet sera bientôt disponible.
          </p>
        </div>
      )}
    </div>
  );
}