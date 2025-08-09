import { PageSkeleton } from "@/components/ui/page-skeleton";

export default function ClientDocumentsLoading() {
  return (
    <PageSkeleton 
      showStats={true}
      showTable={false}
      showFilters={false}
      title="Chargement des documents..."
    />
  );
}