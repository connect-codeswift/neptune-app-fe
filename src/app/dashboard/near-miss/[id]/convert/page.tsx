import { ConvertToIncidentContent } from "@/components/near-miss/convert/ConvertToIncidentContent";

export default async function ConvertNearMissPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ConvertToIncidentContent nearMissId={decodeURIComponent(id)} />;
}
