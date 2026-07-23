"use client";

import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { InspectionTemplateCard } from "@/components/inspections/templates/InspectionTemplateCard";
import { InspectionTemplatesHeader } from "@/components/inspections/templates/InspectionTemplatesHeader";
import { INSPECTION_TEMPLATES } from "./inspection-templates-data";

const START_INSPECTION_ROUTE = "/dashboard/inspections/start";

export default function InspectionTemplatesPage() {
  const router = useRouter();

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

      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        <InspectionTemplatesHeader
          onCreateTemplate={() =>
            router.push("/dashboard/inspections/template/create")
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {INSPECTION_TEMPLATES.map((template) => (
            <InspectionTemplateCard
              key={template.id}
              template={template}
              onUse={(used) =>
                router.push(
                  `/dashboard/inspections/checklist/${encodeURIComponent(used.id)}`,
                )
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
