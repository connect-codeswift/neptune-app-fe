import { useQuery } from "@tanstack/react-query";
import { getAllAudits, getAuditById } from "@/services/audit.service";

/** Fetches a paged list of audits from GET /api/Audit. */
export function useAuditsQuery(
  params: Readonly<{ pageNumber: number; pageSize: number }>,
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
