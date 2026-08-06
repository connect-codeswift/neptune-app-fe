"use client";

import { Suspense } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { AuditChecklistContent } from "@/components/audits/checklist/AuditChecklistContent";
import { useRouter, useSearchParams } from "next/navigation";

const START_AUDIT_ROUTE = "/dashboard/audits/start";

/** Reads the id from `?templateid=`, so it needs a Suspense boundary. */
function AuditChecklist() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateid") ?? "";

  return <AuditChecklistContent templateId={decodeURIComponent(templateId)} />;
}

export default function AuditChecklistPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader
        searchPlaceholder="Search incidents, actions, docs..."
        searchonleft={true}
        dateRangeLabel="March 25 — April 24, 2026"        actionLabel="Start Audit"
        onActionClick={() => router.push(START_AUDIT_ROUTE)}
      />

      <Suspense fallback={null}>
        <AuditChecklist />
      </Suspense>
    </div>
  );
}
