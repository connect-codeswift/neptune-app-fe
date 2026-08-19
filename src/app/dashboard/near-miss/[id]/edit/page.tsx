import { EditNearMissContent } from "@/components/near-miss/edit/EditNearMissContent";

export default async function EditNearMissPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EditNearMissContent nearMissId={decodeURIComponent(id)} />;
}
