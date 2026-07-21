import { NearMissDetailContent } from "@/components/near-miss/detail/NearMissDetailContent";

export default async function NearMissDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <NearMissDetailContent nearMissId={decodeURIComponent(id)} />;
}
