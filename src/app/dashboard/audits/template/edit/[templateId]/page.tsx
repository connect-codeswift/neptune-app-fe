"use client";

import { useParams } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { EditTemplateContent } from "@/components/audits/templates/edit/EditTemplateContent";

export default function EditAuditTemplatePage() {
  const params = useParams();
  const templateId = params.templateId as string;

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader
        searchPlaceholder="Search incidents, actions, docs..."
        searchonleft={true}
        dateRangeLabel="March 25 — April 24, 2026"      />

      <EditTemplateContent templateId={decodeURIComponent(templateId)} />
    </div>
  );
}
