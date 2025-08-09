import { PageSkeleton } from "@/components/ui/page-skeleton";

export default function TasksLoading() {
  return (
    <PageSkeleton 
      showStats={true}
      showTable={true}
      showFilters={true}
      title="Chargement des tâches..."
    />
  );
}