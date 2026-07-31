import { SdsViewerPageClient } from "@/components/hazcom/sds";

export default async function HazcomSdsViewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <SdsViewerPageClient sdsIdParam={decodeURIComponent(id)} />;
}
