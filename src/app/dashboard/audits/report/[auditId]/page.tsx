"use client";

import { useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { AuditReportHeader } from "@/components/audits/report/AuditReportHeader";
import { AuditReportView } from "@/components/audits/report/AuditReportView";
import { useAuditDetailQuery } from "@/hooks/use-audit-queries";
import { exportElementToPdf } from "@/lib/export-pdf";
import { buildAuditReportFromDetail } from "@/lib/map-audit";
import { toast } from "@/lib/toast";

export default function AuditReportPage() {
  const params = useParams();
  const auditId = decodeURIComponent(params.auditId as string);

  // GET /api/Audit/{id} carries the audit, its template snapshot and the
  // recorded responses — everything the report needs, from one call.
  const detailQuery = useAuditDetailQuery(auditId);
  const detail = detailQuery.data?.dataModel ?? null;
  console.log(detailQuery.data);
  const report = useMemo(
    () => (detail ? buildAuditReportFromDetail(detail) : null),
    [detail],
  );

  // The printable region — captured as-is when exporting.
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = () => {
    const element = reportRef.current;
    if (!element || !report) return;

    setIsExporting(true);
    exportElementToPdf(element, `${report.auditId}-audit-report.pdf`)
      .catch(() => {
        toast.error("Could not export the report. Please try again.");
      })
      .finally(() => {
        setIsExporting(false);
      });
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader
        searchPlaceholder="Search incidents, actions, docs..."
        searchonleft={true}
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
      />

      <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
        <AuditReportHeader
          auditId={report?.auditId ?? "—"}
          subtitle={report?.title ?? ""}
          isExporting={isExporting}
          onExportPdf={report ? handleExportPdf : undefined}
        />

        {detailQuery.isPending ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-ehs-muted-text text-sm">Loading report...</p>
          </div>
        ) : detailQuery.isError ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-ehs-red text-sm">Could not load this report.</p>
          </div>
        ) : report ? (
          <div ref={reportRef} className="min-w-0">
            <AuditReportView report={report} />
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-ehs-muted-text text-sm">
              No report found for this audit.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
