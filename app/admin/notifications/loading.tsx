import { PageSkeleton } from "@/components/ui/page-skeleton";

export default function NotificationsLoading() {
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