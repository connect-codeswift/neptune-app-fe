import { VersionHistoryContent } from "@/components/policy-maker/version-history/VersionHistoryContent";

export default async function PolicyMakerVersionHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <VersionHistoryContent documentIdParam={decodeURIComponent(id)} />
  );
}
