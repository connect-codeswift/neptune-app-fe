import { AcknowledgmentTrackingContent } from "@/components/policy-maker/acknowledgment-tracking/AcknowledgmentTrackingContent";

export default async function PolicyMakerAcknowledgmentTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AcknowledgmentTrackingContent
      documentIdParam={decodeURIComponent(id)}
    />
  );
}
