"use client";

import { useParams } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { AuditReportHeader } from "@/components/audits/report/AuditReportHeader";
import { AuditReportView } from "@/components/audits/report/AuditReportView";
import { getAuditReport } from "../audit-report-data";

export default function AuditReportPage() {
  const params = useParams();
  const templateId = params.templateId as string;

  const report = getAuditReport(decodeURIComponent(templateId));

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader
        searchPlaceholder="Search incidents, actions, docs..."
        searchonleft={true}
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
      />

      <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
        <AuditReportHeader auditId={report.auditId} subtitle={report.title} />

        <AuditReportView report={report} />
      </div>
    </div>
  );
}
