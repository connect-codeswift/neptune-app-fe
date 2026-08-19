import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { RegisterListParams } from "@/dtos/req/register-list-params.dto";
import {
  getAllAudits,
  getAuditById,
  getAuditDetailSummary,
  getAuditFindings,
  getAuditSummary,
} from "@/services/audit.service";
import { useAppSelector } from "@/store/hooks";

const auditQueryKeys = {
  all: ["audit"] as const,
  summary: (userId: number | null) =>
    [...auditQueryKeys.all, "summary", userId] as const,
  list: (params: RegisterListParams | undefined) =>
    [...auditQueryKeys.all, "list", params] as const,
  detail: (auditId: string | null) =>
    [...auditQueryKeys.all, "detail", auditId] as const,
  detailSummary: (auditId: string | null) =>
    [...auditQueryKeys.all, "detail-summary", auditId] as const,
  findings: (auditId: string | null) =>
    [...auditQueryKeys.all, "findings", auditId] as const,
};

/** Fetches a paged list of audits from GET /api/v1/audits. */
export function useAuditsQuery(params: RegisterListParams) {
  return useQuery({
    queryKey: auditQueryKeys.list(params),
    queryFn: () => getAllAudits(params),
    placeholderData: (previous) => previous,
  });
}

/** KPI tiles from GET /api/v1/audits/summary?kind=Audit — scoped per signed-in user. */
export function useAuditSummaryQuery(userId: number | null, enabled = true) {
  return useQuery({
    queryKey: auditQueryKeys.summary(userId),
    queryFn: () => getAuditSummary(),
    enabled: enabled && userId !== null && userId > 0,
  });
}

/** Fetches a single audit's detail from GET /api/v1/audits/{id}. */
export function useAuditDetailQuery(auditId: string | null) {
  return useQuery({
    queryKey: auditQueryKeys.detail(auditId),
    enabled: auditId !== null,
    queryFn: () => getAuditById(auditId ?? ""),
  });
}

/** Donut + top findings from GET /api/v1/audits/{id}/detail-summary. */
export function useAuditDetailSummaryQuery(auditId: string | null) {
  return useQuery({
    queryKey: auditQueryKeys.detailSummary(auditId),
    enabled: auditId !== null,
    retry: (failureCount, error) => {
      const status =
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof error.status === "number"
          ? error.status
          : undefined;
      if (status === 403 || status === 404 || status === 400) return false;
      return failureCount < 2;
    },
    queryFn: () => getAuditDetailSummary(auditId ?? ""),
  });
}

/** Fetches an audit's findings from GET /api/v1/audits/{id}/findings. */
export function useAuditFindingsQuery(auditId: string | null) {
  return useQuery({
    queryKey: auditQueryKeys.findings(auditId),
    enabled: auditId !== null,
    queryFn: () => getAuditFindings(auditId ?? ""),
  });
}

/**
 * Resolve the audit run for a template: prefer the one just created (stashed in
 * the store), else the newest audit on that template from the list.
 */
export function useAuditForTemplate(templateId: string) {
  const storedAudit = useAppSelector((state) => state.audit.selected);
  const auditsQuery = useAuditsQuery({ pageNumber: 1, pageSize: 100 });

  const audit = useMemo(() => {
    if (storedAudit && String(storedAudit.templateId) === templateId) {
      return storedAudit;
    }
    // `?.` on dataModel too — see StartInspectionForm: the chain stopped one
    // level short, so a null dataModel threw instead of yielding `[]`.
    const matches = (auditsQuery.data?.dataModel?.data ?? []).filter(
      (row) => String(row.templateId) === templateId,
    );
    return matches.reduce<(typeof matches)[number] | null>(
      (newest, row) => (!newest || row.id > newest.id ? row : newest),
      null,
    );
  }, [storedAudit, auditsQuery.data, templateId]);

  return { audit, isPending: auditsQuery.isPending };
}
