import { PageSkeleton } from "@/components/ui/page-skeleton";

export default function ClientReviewLoading() {
  return (
    <PageSkeleton 
      showStats={false}
      showTable={false}
      showFilters={false}
      title="Chargement de l'évaluation..."
    />
  );
}