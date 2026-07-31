"use client";
import { DashboardHeader } from "@/components/DashboardHeader";
import { InspectionChecklistContent } from "@/components/inspections/checklist/InspectionChecklistContent";
import { useParams, useRouter } from "next/navigation";

export default function InspectionChecklistPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.templateId as string;

  const START_INSPECTION_ROUTE = "/dashboard/inspections/start";

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader
        searchPlaceholder="Search incidents, actions, docs..."
        searchonleft={true}
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
        actionLabel="Start Inspection"
        onActionClick={() => router.push(START_INSPECTION_ROUTE)}
      />

      <InspectionChecklistContent templateId={decodeURIComponent(templateId)} />
    </div>
  );
}
