import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getAllAudits,
  getAuditById,
  getAuditFindings,
} from "@/services/audit.service";
import { useAppSelector } from "@/store/hooks";

/** Fetches a paged list of audits from GET /api/Audit. */
export function useAuditsQuery(
  params?: Readonly<{ pageNumber: number; pageSize: number }>,
) {
  return useQuery({
    queryKey: ["audit", "list", params] as const,
    queryFn: () => getAllAudits(params),
  });
}

/** Fetches a single audit's detail from GET /api/Audit/{id}. */
export function useAuditDetailQuery(auditId: string | null) {
  return useQuery({
    queryKey: ["audit", "detail", auditId] as const,
    enabled: auditId !== null,
    queryFn: () => getAuditById(auditId ?? ""),
  });
}

/** Fetches an audit's findings from GET /api/Audit/{id}/findings. */
export function useAuditFindingsQuery(auditId: string | null) {
  return useQuery({
    queryKey: ["audit", "findings", auditId] as const,
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
  const auditsQuery = useAuditsQuery();

  const audit = useMemo(() => {
    if (storedAudit && String(storedAudit.templateId) === templateId) {
      return storedAudit;
    }
    const matches = (auditsQuery.data?.dataModel.data ?? []).filter(
      (row) => String(row.templateId) === templateId,
    );
    // Highest id is the most recently created run.
    return matches.reduce<(typeof matches)[number] | null>(
      (newest, row) => (!newest || row.id > newest.id ? row : newest),
      null,
    );
  }, [storedAudit, auditsQuery.data, templateId]);

  return { audit, isPending: auditsQuery.isPending };
}
