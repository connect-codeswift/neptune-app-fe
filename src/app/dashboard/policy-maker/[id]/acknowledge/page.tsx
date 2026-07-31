import { AcknowledgeDocumentContent } from "@/components/policy-maker/acknowledge/AcknowledgeDocumentContent";

export default async function PolicyMakerAcknowledgeDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AcknowledgeDocumentContent documentIdParam={decodeURIComponent(id)} />
  );
}
