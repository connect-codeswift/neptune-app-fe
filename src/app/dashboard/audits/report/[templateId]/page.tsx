"use client";

import { useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { AuditReportHeader } from "@/components/audits/report/AuditReportHeader";
import { AuditReportView } from "@/components/audits/report/AuditReportView";
import { useAuditForTemplate } from "@/hooks/use-audit-queries";
import { useAuditTemplateDetailQuery } from "@/hooks/use-audit-template-queries";
import { exportElementToPdf } from "@/lib/export-pdf";
import { buildAuditReport, type ReportSection } from "@/lib/map-audit";
import { toast } from "@/lib/toast";
import { useAppSelector } from "@/store/hooks";

export default function AuditReportPage() {
  const params = useParams();
  const templateId = decodeURIComponent(params.templateId as string);

  // Section titles and their items come from the template.
  const storedSummary = useAppSelector((state) => state.auditTemplate.selected);
  const summary =
    storedSummary && String(storedSummary.id) === templateId
      ? storedSummary
      : null;
  const detailQuery = useAuditTemplateDetailQuery(templateId, summary);

  // Who ran it and when comes from the audit; the score and status from the
  // submission, whose answers drive the per-section breakdown.
  const { audit } = useAuditForTemplate(templateId);
  const result = useAppSelector((state) => state.audit.result);
  const answers = useAppSelector((state) => state.audit.answers);

  const sections = useMemo<ReportSection[]>(() => {
    const detail = detailQuery.data;
    if (!detail) return [];

    return [...detail.sections]
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      .map((section) => ({
        title: section.sectionTitle ?? section.title ?? "Untitled section",
        items: (detail.itemsBySection[String(section.id)] ?? []).map((item) => ({
          id: String(item.id),
        })),
      }));
  }, [detailQuery.data]);

  const report = useMemo(
    () =>
      result
        ? buildAuditReport({
            audit,
            result,
            answers: answers ?? [],
            sections,
          })
        : null,
    [audit, result, answers, sections],
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
        ) : report ? (
          <div ref={reportRef} className="min-w-0">
            <AuditReportView report={report} />
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-ehs-muted-text text-sm">
              No report yet — submit the audit checklist to generate one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
