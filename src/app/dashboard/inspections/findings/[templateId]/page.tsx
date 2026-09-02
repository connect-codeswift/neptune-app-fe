"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { EmptyState } from "@/components/ui/EmptyState";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { InspectionFindingCard } from "@/components/inspections/findings/InspectionFindingCard";
import { InspectionFindingsHeader } from "@/components/inspections/findings/InspectionFindingsHeader";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { SkeletonDetailPage } from "@/components/ui/skeletons";
import {
  useInspectionDetailQuery,
  useInspectionFindingsQuery,
} from "@/hooks/use-inspection-queries";
import { detailSummaryErrorMessage } from "@/lib/audit-inspection-errors";
import { mapFindingDtoToFinding } from "@/lib/map-inspection";

export default function InspectionFindingsPage() {
  const router = useRouter();
  const params = useParams();
  // Route segment is named templateId historically; dashboard passes the run id.
  const inspectionRunId = decodeURIComponent(params.templateId as string);

  const detailQuery = useInspectionDetailQuery(inspectionRunId);
  const findingsQuery = useInspectionFindingsQuery(inspectionRunId);

  const inspection = detailQuery.data?.dataModel ?? null;

  const findings = useMemo(() => {
    const rows = findingsQuery.data?.dataModel;
    return Array.isArray(rows) ? rows.map(mapFindingDtoToFinding) : [];
  }, [findingsQuery.data]);

  const isPending =
    detailQuery.isPending ||
    (inspectionRunId !== "" && findingsQuery.isPending);

  const displayId = inspection
    ? `I-${String(inspection.id)}`
    : `I-${inspectionRunId}`;

  const subtitle =
    inspection?.inspectionTitle ?? inspection?.snapshot?.templateName ?? "";

  const handleGenerateReport = () => {
    router.push(
      `/dashboard/inspections/report?inspectionid=${encodeURIComponent(inspectionRunId)}`,
    );
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5 px-4 pt-4 pb-8">
      <InspectionFindingsHeader
        inspectionId={displayId}
        subtitle={subtitle}
        onGenerateReport={handleGenerateReport}
      />

      <div className="mx-auto flex w-full max-w-200 flex-col gap-3.5">
        {isPending ? (
          <SkeletonDetailPage />
        ) : findingsQuery.isError ? (
          <IncidentGlassCard
            className="min-h-55 text-center"
            incidentGlassCardClassName="items-center justify-center gap-2"
          >
            <Icon
              icon="mdi:alert-circle-outline"
              className="text-ehs-red size-8"
              aria-hidden="true"
            />
            <Text as="p" className="text4 text-ehs-darker">
              Could not load findings
            </Text>
            <Text as="p" className="text4 text-ehs-muted-text max-w-xs">
              {detailSummaryErrorMessage(findingsQuery.error)}
            </Text>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void findingsQuery.refetch()}
              className="mt-1"
            >
              Try again
            </Button>
          </IncidentGlassCard>
        ) : findings.length === 0 ? (
          <EmptyState
            icon="mdi:clipboard-check-outline"
            title="No findings raised"
            message="No findings were raised on this inspection."
            action={
              <Link
                href="/dashboard/inspections"
                className="text4 text-ehs-normal-blue hover:underline"
              >
                Back to Inspections
              </Link>
            }
          />
        ) : (
          findings.map((finding) => (
            <InspectionFindingCard key={finding.id} finding={finding} />
          ))
        )}
      </div>
    </div>
  );
}
