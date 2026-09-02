"use client";

import { useParams } from "next/navigation";
import { AuditPerformContent } from "@/components/audits/perform/AuditPerformContent";

/**
 * Answering a scheduled audit.
 *
 * Keyed by the run's own id — everything it renders comes from
 * `GET /audits/{id}`: the template snapshot pinned when the audit was created,
 * and the answers recorded so far. It deliberately never reads the live
 * template, which can have moved on since the run was scheduled.
 */
export default function AuditPerformPage() {
  const params = useParams();
  const auditId = decodeURIComponent(params.id as string);

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5 pt-4">
      <AuditPerformContent auditId={auditId} />
    </div>
  );
}
