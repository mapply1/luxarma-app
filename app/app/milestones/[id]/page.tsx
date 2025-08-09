import { mockMilestones } from "@/lib/mockData";
import { MilestoneDetailsContent } from "./MilestoneDetailsContent";

export async function generateStaticParams() {
  return mockMilestones.map((milestone) => ({
    id: milestone.id,
  }));
}

interface MilestonePageProps {
  params: { id: string };
}

export default function MilestonePage({ params }: MilestonePageProps) {
  return <MilestoneDetailsContent milestoneId={params.id} />;
}