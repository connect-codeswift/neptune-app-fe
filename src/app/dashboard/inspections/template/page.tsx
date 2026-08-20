"use client";
import { EmptyState } from "@/components/ui/EmptyState";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { InspectionTemplateCard } from "@/components/inspections/templates/InspectionTemplateCard";
import { InspectionTemplatesSkeleton } from "@/components/inspections/templates/InspectionTemplatesSkeleton";
import {
  InspectionTemplatesHeader,
  type TemplateStatusFilter,
} from "@/components/inspections/templates/InspectionTemplatesHeader";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useInspectionTemplatesQuery } from "@/hooks/use-inspection-template-queries";
import { mapInspectionTemplateDtoToCard } from "@/lib/map-inspection-template";
import { setSelectedInspectionTemplate } from "@/store/inspection-template-slice";
import { useAppDispatch } from "@/store/hooks";

const START_INSPECTION_ROUTE = "/dashboard/inspections/start";
const PAGE_SIZE = 10;

export default function InspectionTemplatesPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
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
      <DashboardHeader title="Inspections" />

      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        <InspectionTemplatesHeader
          status={status}
          onStatusChange={handleStatusChange}
          onCreateTemplate={() =>
            router.push("/dashboard/inspections/template/create")
          }
        />

        {templatesQuery.isPending ? (
          <InspectionTemplatesSkeleton />
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
          <EmptyState
            icon="mdi:clipboard-text-outline"
            title={`No ${status.toLowerCase()} inspection templates`}
            message="Templates you create appear here, ready to start an inspection from."
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {templates.map((template) => (
                <InspectionTemplateCard
                  key={template.id}
                  template={template}
                  onUse={(used) =>
                    router.push(
                      `${START_INSPECTION_ROUTE}?templateId=${encodeURIComponent(used.id)}`,
                    )
                  }
                  onEdit={(edited) => {
                    // Stash the template so the edit wizard can seed its basic
                    // info without refetching the whole list.
                    const dto = (page?.data ?? []).find(
                      (row) => String(row.id) === edited.id,
                    );
                    if (dto) dispatch(setSelectedInspectionTemplate(dto));
                    router.push(
                      `/dashboard/inspections/template/edit?templateid=${encodeURIComponent(edited.id)}`,
                    );
                  }}
                />
              ))}
            </div>

            {totalPages > 1 ? (
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber((current) => current - 1)}
                  className="text-ehs-dark-bg border-ehs-border-ink/12 bg-ehs-surface hover:bg-ehs-surface-inverse/5 cursor-pointer rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
                  className="text-ehs-dark-bg border-ehs-border-ink/12 bg-ehs-surface hover:bg-ehs-surface-inverse/5 cursor-pointer rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
