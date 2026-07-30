import { use } from "react";
import { RegulatoryComplianceDetailView } from "@/components/regulatory-compliance";

export type RegulatoryComplianceDetailPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

/** Regulatory Compliance — Obligation Detail page route. */
export default function RegulatoryComplianceDetailPage(
  props: RegulatoryComplianceDetailPageProps,
) {
  const resolvedParams = use(props.params);
  return <RegulatoryComplianceDetailView id={resolvedParams.id} />;
}
