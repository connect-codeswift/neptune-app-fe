"use client";

import { useParams } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { InspectionReportHeader } from "@/components/inspections/report/InspectionReportHeader";
import { InspectionReportView } from "@/components/inspections/report/InspectionReportView";
import { getInspectionReport } from "../inspection-report-data";

export default function InspectionReportPage() {
  const params = useParams();
  const templateId = params.templateId as string;

  const report = getInspectionReport(decodeURIComponent(templateId));

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader
        searchPlaceholder="Search incidents, actions, docs..."
        searchonleft={true}
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
      />

      <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
        <InspectionReportHeader inspectionId={report.inspectionId} subtitle={report.title} />

        <InspectionReportView report={report} />
      </div>
    </div>
  );
}
