import { EditDocumentContent } from "@/components/policy-maker/edit/EditDocumentContent";

export default async function PolicyMakerEditDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EditDocumentContent documentIdParam={decodeURIComponent(id)} />;
}
