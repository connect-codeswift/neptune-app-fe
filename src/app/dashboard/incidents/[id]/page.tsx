import { IncidentDetailContent } from "@/components/incidents/detail/IncidentDetailContent";

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <IncidentDetailContent incidentIdParam={decodeURIComponent(id)} />;
}
