import { ConvertHazardToIncidentContent } from "@/components/hazard/convert/ConvertHazardToIncidentContent";

export default async function ConvertHazardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ConvertHazardToIncidentContent hazardId={decodeURIComponent(id)} />;
}
