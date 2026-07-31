"use client";

import { useParams, useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { InspectionFindingCard } from "@/components/inspections/findings/InspectionFindingCard";
import { InspectionFindingsHeader } from "@/components/inspections/findings/InspectionFindingsHeader";
import { getInspectionFindings } from "../inspection-findings-data";

export default function InspectionFindingsPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.templateId as string;

  const { inspectionId, subtitle, findings } = getInspectionFindings(
    decodeURIComponent(templateId),
  );

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader
        searchPlaceholder="Search incidents, actions, docs..."
        searchonleft={true}
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
      />

      <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
        <InspectionFindingsHeader
          inspectionId={inspectionId}
          subtitle={subtitle}
          onGenerateReport={() =>
            router.push(
              `/dashboard/inspections/report/${encodeURIComponent(templateId)}`,
            )
          }
        />

        {findings.map((finding) => (
          <InspectionFindingCard key={finding.id} finding={finding} />
        ))}
      </div>
    </div>
  );
}
