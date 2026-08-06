"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { InspectionFindingCard } from "@/components/inspections/findings/InspectionFindingCard";
import { InspectionFindingsHeader } from "@/components/inspections/findings/InspectionFindingsHeader";
import {
  useInspectionDetailQuery,
  useInspectionFindingsQuery,
} from "@/hooks/use-inspection-queries";
import { detailSummaryErrorMessage } from "@/lib/audit-inspection-errors";
import { mapFindingDtoToFinding } from "@/lib/map-inspection";
import { SkeletonTable } from "@/components/ui/skeletons";

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
    inspection?.inspectionTitle ??
    inspection?.snapshot?.templateName ??
    "";

  const handleGenerateReport = () => {
    router.push(
      `/dashboard/inspections/report?inspectionid=${encodeURIComponent(inspectionRunId)}`,
    );
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader
        searchPlaceholder="Search incidents, actions, docs..."
        searchonleft={true}
        dateRangeLabel="March 25 — April 24, 2026"      />

      <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
        <InspectionFindingsHeader
          inspectionId={displayId}
          subtitle={subtitle}
          onGenerateReport={handleGenerateReport}
        />

        {isPending ? (
          <SkeletonTable rows={8} columns={5} />
        ) : findingsQuery.isError ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-ehs-red text-sm">
              {detailSummaryErrorMessage(findingsQuery.error)}
            </p>
          </div>
        ) : findings.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-ehs-muted-text">
              No findings raised on this inspection.
            </p>
          </div>
        ) : (
          findings.map((finding) => (
            <InspectionFindingCard key={finding.id} finding={finding} />
          ))
        )}
      </div>
    </div>
  );
}
