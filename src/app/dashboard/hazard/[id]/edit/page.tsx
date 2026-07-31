import { EditHazardContent } from "@/components/hazard/edit/EditHazardContent";

export default async function EditHazardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EditHazardContent hazardId={decodeURIComponent(id)} />;
}
