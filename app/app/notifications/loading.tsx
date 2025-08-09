import { PageSkeleton } from "@/components/ui/page-skeleton";

export default function ClientNotificationsLoading() {
  return (
    <PageSkeleton 
      showStats={true}
      showTable={false}
      showTabs={true}
      showFilters={false}
      title="Chargement des notifications..."
    />
  );
}