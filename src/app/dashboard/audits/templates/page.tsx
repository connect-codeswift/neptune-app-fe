"use client";

import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { AuditTemplateCard } from "@/components/audits/templates/AuditTemplateCard";
import { AuditTemplatesHeader } from "@/components/audits/templates/AuditTemplatesHeader";
import { AUDIT_TEMPLATES } from "./audit-templates-data";

const START_AUDIT_ROUTE = "/dashboard/audits/new";

export default function AuditTemplatesPage() {
  const router = useRouter();

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

      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        <AuditTemplatesHeader
          onCreateTemplate={() =>
            router.push("/dashboard/audits/templates/create")
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {AUDIT_TEMPLATES.map((template) => (
            <AuditTemplateCard
              key={template.id}
              template={template}
              onUse={(used) =>
                router.push(
                  `/dashboard/audits/checklist/${encodeURIComponent(used.id)}`,
                )
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
