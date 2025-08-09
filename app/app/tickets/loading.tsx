import { PageSkeleton } from "@/components/ui/page-skeleton";

export default function ClientTicketsLoading() {
  return (
    <PageSkeleton 
      showStats={true}
      showTable={false}
      showTabs={true}
      showFilters={false}
      title="Chargement des réclamations..."
    />
  );
}