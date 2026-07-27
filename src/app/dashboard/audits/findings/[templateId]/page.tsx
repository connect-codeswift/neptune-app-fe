"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { AuditFindingCard } from "@/components/audits/findings/AuditFindingCard";
import { AuditFindingsHeader } from "@/components/audits/findings/AuditFindingsHeader";
import {
  useAuditFindingsQuery,
  useAuditForTemplate,
} from "@/hooks/use-audit-queries";
import { mapFindingDtoToFinding } from "@/lib/map-audit";
import { getAuditReport } from "@/services/audit.service";

export default function AuditFindingsPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = decodeURIComponent(params.templateId as string);

  // The findings endpoint is keyed by audit, so resolve this template's run.
  const { audit, isPending: isAuditPending } = useAuditForTemplate(templateId);
  const findingsQuery = useAuditFindingsQuery(
    audit ? String(audit.id) : null,
  );

  const findings = useMemo(
    () => (findingsQuery.data?.dataModel ?? []).map(mapFindingDtoToFinding),
    [findingsQuery.data],
  );

  const isPending = isAuditPending || (audit !== null && findingsQuery.isPending);

  /** Fetch this audit's report, then open the report page. */
  const handleGenerateReport = () => {
    if (audit) {
      getAuditReport(String(audit.id)).catch((error: unknown) => {
        console.error("Could not load audit report", error);
      });
    }

    router.push(`/dashboard/audits/report/${encodeURIComponent(templateId)}`);
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader
        searchPlaceholder="Search incidents, actions, docs..."
        searchonleft={true}
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
      />

      <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
        <AuditFindingsHeader
          auditId={audit ? `A-${String(audit.id)}` : "—"}
          subtitle={audit?.auditTitle ?? audit?.templateName ?? ""}
          onGenerateReport={handleGenerateReport}
        />

        {isPending ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-ehs-muted-text text-sm">Loading findings...</p>
          </div>
        ) : findingsQuery.isError ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-ehs-red text-sm">Could not load findings.</p>
          </div>
        ) : findings.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-ehs-muted-text text-sm">
              No findings raised on this audit.
            </p>
          </div>
        ) : (
          findings.map((finding) => (
            <AuditFindingCard key={finding.id} finding={finding} />
          ))
        )}
      </div>
    </div>
  );
}
