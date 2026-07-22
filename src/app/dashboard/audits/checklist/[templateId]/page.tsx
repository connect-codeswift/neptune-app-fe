"use client";
import { DashboardHeader } from "@/components/DashboardHeader";
import { AuditChecklistContent } from "@/components/audits/checklist/AuditChecklistContent";
import { useParams, useRouter } from "next/navigation";

export default function AuditChecklistPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.templateId as string;

  const START_AUDIT_ROUTE = "/dashboard/audits/start";

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader
        searchPlaceholder="Search incidents, actions, docs..."
        searchonleft={true}
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
        actionLabel="Start Audit"
        onActionClick={() => router.push(START_AUDIT_ROUTE)}
      />

      <AuditChecklistContent templateId={decodeURIComponent(templateId)} />
    </div>
  );
}
