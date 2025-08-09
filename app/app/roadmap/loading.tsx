import { PageSkeleton } from "@/components/ui/page-skeleton";

export default function ClientRoadmapLoading() {
  return (
    <PageSkeleton 
      showStats={true}
      showTable={false}
      showFilters={false}
      title="Chargement de la feuille de route..."
    />
  );
}