"use client";

import { useParams } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { EditTemplateContent } from "@/components/audits/templates/edit/EditTemplateContent";

export default function EditAuditTemplatePage() {
  const params = useParams();
  const templateId = params.templateId as string;

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader />

      <EditTemplateContent templateId={decodeURIComponent(templateId)} />
    </div>
  );
}
