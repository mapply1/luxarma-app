import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Circle } from "lucide-react";
import { Milestone } from "@/types";

interface MilestoneCardProps {
  milestone: Milestone;
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
  termine: 'bg-green-100 text-green-800',
  en_cours: 'bg-blue-100 text-blue-800',
  a_faire: 'bg-slate-100 text-slate-800'
};

export function MilestoneCard({ milestone }: MilestoneCardProps) {
  const StatusIcon = statusIcons[milestone.statut];
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{milestone.titre}</CardTitle>
          <StatusIcon className={`h-5 w-5 ${
            milestone.statut === 'termine' ? 'text-green-600' :
            milestone.statut === 'en_cours' ? 'text-blue-600' : 'text-slate-400'
          }`} />
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[milestone.statut]}>
            {statusLabels[milestone.statut]}
          </Badge>
          <span className="text-sm text-slate-500">
            Échéance: {formatDate(milestone.date_prevue)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription>{milestone.description}</CardDescription>
        {milestone.date_completee && (
          <p className="text-sm text-green-600 mt-2">
            Complété le {formatDate(milestone.date_completee)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}