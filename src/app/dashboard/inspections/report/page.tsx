"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { InspectionReportHeader } from "@/components/inspections/report/InspectionReportHeader";
import { InspectionReportSkeleton } from "@/components/inspections/report/InspectionReportSkeleton";
import { InspectionReportView } from "@/components/inspections/report/InspectionReportView";
import { Text } from "@/components/Text";
import { useInspectionDetailQuery } from "@/hooks/use-inspection-queries";
import { exportElementToPdf } from "@/lib/export-pdf";
import { buildInspectionReportFromDetail } from "@/lib/map-inspection";
import { toast } from "@/lib/toast";

/** Reads the id from `?inspectionid=`, so it needs a Suspense boundary. */
function InspectionReport() {
  const searchParams = useSearchParams();
  const inspectionId = decodeURIComponent(
    searchParams.get("inspectionid") ?? "",
  );

  // GET /api/Inspection/{id} carries the inspection, its template snapshot and
  // the recorded responses — everything the report needs, from one call.
  const detailQuery = useInspectionDetailQuery(inspectionId);
  const detail = detailQuery.data?.dataModel ?? null;
  const report = useMemo(
    () => (detail ? buildInspectionReportFromDetail(detail) : null),
    [detail],
  );

  // The printable region — captured as-is when exporting.
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = () => {
    const element = reportRef.current;
    if (!element || !report) return;

    setIsExporting(true);
    exportElementToPdf(element, `${report.inspectionId}-inspection-report.pdf`)
      .catch(() => {
        toast.error("Could not export the report. Please try again.");
      })
      .finally(() => {
        setIsExporting(false);
      });
  };

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pt-4 pb-8">
      <InspectionReportHeader
        inspectionId={report?.inspectionId ?? "—"}
        subtitle={report?.title ?? ""}
        isExporting={isExporting}
        onExportPdf={report ? handleExportPdf : undefined}
      />

      {detailQuery.isPending ? (
        <InspectionReportSkeleton />
      ) : detailQuery.isError ? (
        <div className="flex flex-1 items-center justify-center">
          <Text as="p" className="text4 text-ehs-red">
            Could not load this report.
          </Text>
        </div>
      ) : report ? (
        <div ref={reportRef} className="min-w-0">
          <InspectionReportView report={report} />
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <Text as="p" className="text4 text-ehs-muted-text">
            No report found for this inspection.
          </Text>
        </div>
      )}
    </div>
  );
}

export default function InspectionReportPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <Suspense fallback={null}>
        <InspectionReport />
      </Suspense>
    </div>
  );
}
