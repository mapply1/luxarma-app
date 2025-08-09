import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types";

interface RecentTasksTableProps {
  tasks: Task[];
}

const statusLabels = {
  a_faire: 'À Faire',
  en_cours: 'En Cours',
  termine: 'Terminé'
};

const statusColors = {
  a_faire: 'bg-slate-100 text-slate-800',
  en_cours: 'bg-blue-100 text-blue-800',
  termine: 'bg-green-100 text-green-800'
};

const priorityLabels = {
  basse: 'Basse',
  moyenne: 'Moyenne',
  haute: 'Haute'
};

const priorityColors = {
  basse: 'bg-green-100 text-green-800',
  moyenne: 'bg-yellow-100 text-yellow-800',
  haute: 'bg-red-100 text-red-800'
};

export function RecentTasksTable({ tasks }: RecentTasksTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Priorité</TableHead>
            <TableHead>Échéance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-medium">{task.titre}</TableCell>
              <TableCell>
                <Badge className={statusColors[task.statut]}>
                  {statusLabels[task.statut]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={priorityColors[task.priorite]}>
                  {priorityLabels[task.priorite]}
                </Badge>
              </TableCell>
              <TableCell>
                {task.date_echeance ? formatDate(task.date_echeance) : 'Non définie'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}