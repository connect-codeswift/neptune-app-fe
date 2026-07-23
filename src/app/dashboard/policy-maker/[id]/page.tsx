import { PolicyMakerDocumentDetailContent } from "@/components/policy-maker/detail/PolicyMakerDocumentDetailContent";

export default async function PolicyMakerDocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <PolicyMakerDocumentDetailContent
      documentIdParam={decodeURIComponent(id)}
    />
  );
}
