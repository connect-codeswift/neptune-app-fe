"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { InspectionTemplateCard } from "@/components/inspections/templates/InspectionTemplateCard";
import {
  InspectionTemplatesHeader,
  type TemplateStatusFilter,
} from "@/components/inspections/templates/InspectionTemplatesHeader";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useInspectionTemplatesQuery } from "@/hooks/use-inspection-template-queries";
import { mapInspectionTemplateDtoToCard } from "@/lib/map-inspection-template";

const START_INSPECTION_ROUTE = "/dashboard/inspections/start";
const PAGE_SIZE = 10;

export default function InspectionTemplatesPage() {
  const router = useRouter();
  const [pageNumber, setPageNumber] = useState(1);
  const [status, setStatus] = useState<TemplateStatusFilter>("Published");

  const templatesQuery = useInspectionTemplatesQuery({
    pageNumber,
    pageSize: PAGE_SIZE,
    status,
  });

  const page = templatesQuery.data?.dataModel;
  const templates = useMemo(
    () => (page?.data ?? []).map(mapInspectionTemplateDtoToCard),
    [page],
  );

  /** Switching status re-queries from page 1 — the old page may not exist. */
  const handleStatusChange = (next: TemplateStatusFilter) => {
    setStatus(next);
    setPageNumber(1);
  };

  const totalRecords = page?.totalRecords ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));

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
          status={status}
          onStatusChange={handleStatusChange}
          onCreateTemplate={() =>
            router.push("/dashboard/inspections/template/create")
          }
        />

        {templatesQuery.isPending ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-ehs-muted-text text-sm">Loading templates...</p>
          </div>
        ) : templatesQuery.isError ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-ehs-red text-sm">
              {getMutationErrorMessage(
                templatesQuery.error,
                "Could not load inspection templates.",
              )}
            </p>
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-ehs-muted-text">
              {`No ${status.toLowerCase()} inspection templates yet.`}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {templates.map((template) => (
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

            {totalPages > 1 ? (
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber((current) => current - 1)}
                  className="text-ehs-dark-bg cursor-pointer rounded-lg border border-slate-900/12 bg-white px-3 py-1.5 text-sm font-medium transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-ehs-gray text-sm tabular-nums">
                  {`Page ${String(pageNumber)} of ${String(totalPages)}`}
                </span>
                <button
                  type="button"
                  disabled={pageNumber >= totalPages}
                  onClick={() => setPageNumber((current) => current + 1)}
                  className="text-ehs-dark-bg cursor-pointer rounded-lg border border-slate-900/12 bg-white px-3 py-1.5 text-sm font-medium transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
