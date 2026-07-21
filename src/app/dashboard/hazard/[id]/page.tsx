import { HazardDetailContent } from "@/components/hazard/detail/HazardDetailContent";

export default async function HazardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <HazardDetailContent hazardId={decodeURIComponent(id)} />;
}
