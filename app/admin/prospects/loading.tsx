import { PageSkeleton } from "@/components/ui/page-skeleton";

export default function ProspectsLoading() {
  return (
    <PageSkeleton 
      showStats={true}
      showTable={true}
      showFilters={true}
      title="Chargement des prospects..."
    />
  );
}