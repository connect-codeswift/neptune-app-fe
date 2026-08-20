"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Text } from "@/components/Text";
import { EmptyState } from "@/components/ui/EmptyState";
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
const PAGE_SIZE = 9;

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
    <div className="flex min-h-screen flex-1 flex-col gap-4 px-4 pt-4 pb-8">
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
          <Text as="p" className="text4 text-ehs-red">
            {getMutationErrorMessage(
              templatesQuery.error,
              "Could not load audit templates.",
            )}
          </Text>
        </div>
      ) : templates.length === 0 ? (
        <EmptyState
          icon="mdi:clipboard-text-outline"
          title={`No ${status.toLowerCase()} audit templates`}
          message="Templates you create appear here, ready to start an audit from."
        />
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
                className="text8 text-ehs-gray border-ehs-border bg-ehs-surface hover:bg-ehs-light-bg cursor-pointer rounded-lg border px-3 py-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <Text
                as="span"
                className="text8 text-ehs-muted-text tabular-nums"
              >
                {`Page ${String(pageNumber)} of ${String(totalPages)}`}
              </Text>
              <button
                type="button"
                disabled={pageNumber >= totalPages}
                onClick={() => setPageNumber((current) => current + 1)}
                className="text8 text-ehs-gray border-ehs-border bg-ehs-surface hover:bg-ehs-light-bg cursor-pointer rounded-lg border px-3 py-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
