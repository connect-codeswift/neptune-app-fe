"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { EditTemplateContent } from "@/components/inspections/templates/edit/EditTemplateContent";

/** Reads the id from `?templateid=`, so it needs a Suspense boundary. */
function EditInspectionTemplate() {
  const searchParams = useSearchParams();
  const templateId = decodeURIComponent(searchParams.get("templateid") ?? "");

  return <EditTemplateContent templateId={templateId} />;
}

export default function EditInspectionTemplatePage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader
        searchPlaceholder="Search incidents, actions, docs..."
        searchonleft={true}
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
      />

      <Suspense fallback={null}>
        <EditInspectionTemplate />
      </Suspense>
    </div>
  );
}
