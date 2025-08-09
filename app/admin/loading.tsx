import { PageSkeleton } from "@/components/ui/page-skeleton";

export default function AdminLoading() {
  return (
    <PageSkeleton 
      showStats={true}
      showTable={true}
      showFilters={false}
      title="Chargement du tableau de bord..."
    />
  );
}