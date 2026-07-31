"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { AuditTemplateCard } from "@/components/audits/templates/AuditTemplateCard";
import { AuditTemplatesSkeleton } from "@/components/audits/templates/AuditTemplatesSkeleton";
import {
  AuditTemplatesHeader,
  type TemplateStatusFilter,
} from "@/components/audits/templates/AuditTemplatesHeader";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useAuditTemplatesQuery } from "@/hooks/use-audit-template-queries";
import { mapAuditTemplateDtoToCard } from "@/lib/map-audit-template";
import { useAppDispatch } from "@/store/hooks";
import { setSelectedTemplate } from "@/store/audit-template-slice";

const START_AUDIT_ROUTE = "/dashboard/audits/start";
const PAGE_SIZE = 10;

export default function AuditTemplatesPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [pageNumber, setPageNumber] = useState(1);
  const [status, setStatus] = useState<TemplateStatusFilter>("Published");

  const templatesQuery = useAuditTemplatesQuery({
    pageNumber,
    pageSize: PAGE_SIZE,
    status,
  });

  const page = templatesQuery.data?.dataModel;
  const templates = useMemo(
    () => (page?.data ?? []).map(mapAuditTemplateDtoToCard),
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
        actionLabel="Start Audit"
        onActionClick={() => router.push(START_AUDIT_ROUTE)}
      />

      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        <AuditTemplatesHeader
          status={status}
          onStatusChange={handleStatusChange}
          onCreateTemplate={() =>
            router.push("/dashboard/audits/template/create")
          }
        />

        {templatesQuery.isPending ? (
          <AuditTemplatesSkeleton />
        ) : templatesQuery.isError ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-ehs-red text-sm">
              {getMutationErrorMessage(
                templatesQuery.error,
                "Could not load audit templates.",
              )}
            </p>
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-ehs-muted-text">
              {`No ${status.toLowerCase()} audit templates yet.`}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {templates.map((template) => (
                <AuditTemplateCard
                  key={template.id}
                  template={template}
                  onUse={(used) => {
                    // Stash the template so Start Audit can label the
                    // preselected option before its page loads.
                    const dto = (page?.data ?? []).find(
                      (row) => String(row.id) === used.id,
                    );
                    if (dto) dispatch(setSelectedTemplate(dto));
                    router.push(
                      `${START_AUDIT_ROUTE}?templateId=${encodeURIComponent(used.id)}`,
                    );
                  }}
                  onEdit={(edited) => {
                    const dto = (page?.data ?? []).find(
                      (row) => String(row.id) === edited.id,
                    );
                    if (dto) dispatch(setSelectedTemplate(dto));
                    router.push(
                      `/dashboard/audits/template/edit/${encodeURIComponent(edited.id)}`,
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
