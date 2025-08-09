import { PageSkeleton } from "@/components/ui/page-skeleton";

export default function ClientTasksLoading() {
  return (
    <PageSkeleton 
      showStats={true}
      showTable={true}
      showFilters={false}
      title="Chargement des tâches..."
    />
  );
}