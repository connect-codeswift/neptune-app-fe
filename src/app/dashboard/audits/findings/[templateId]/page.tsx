"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AuditFindingCard } from "@/components/audits/findings/AuditFindingCard";
import { AuditFindingsHeader } from "@/components/audits/findings/AuditFindingsHeader";
import {
  useAuditDetailQuery,
  useAuditFindingsQuery,
} from "@/hooks/use-audit-queries";
import { SkeletonTable } from "@/components/ui/skeletons";
import { EmptyState } from "@/components/ui/EmptyState";
import { mapFindingDtoToFinding } from "@/lib/map-audit";

export default function AuditFindingsPage() {
  const router = useRouter();
  const params = useParams();
  // The route segment is named templateId historically, but every link into this
  // page passes the audit RUN id — see AuditDetailPanel, which builds the href
  // from `detail.id`. Reading it as a template id and then hunting for a run
  // whose templateId matched it was the bug: an audit id never equals a template
  // id, so the lookup found nothing, the findings query stayed disabled, and the
  // page reported "no findings raised" on every audit that had them.
  const auditRunId = decodeURIComponent(params.templateId as string);

  const detailQuery = useAuditDetailQuery(auditRunId);
  const findingsQuery = useAuditFindingsQuery(auditRunId);

  const audit = detailQuery.data?.dataModel ?? null;

  const findings = useMemo(() => {
    const rows = findingsQuery.data?.dataModel;
    return Array.isArray(rows) ? rows.map(mapFindingDtoToFinding) : [];
  }, [findingsQuery.data]);

  const isPending = detailQuery.isPending || findingsQuery.isPending;

  const handleGenerateReport = () => {
    router.push(
      `/dashboard/audits/report?auditid=${encodeURIComponent(auditRunId)}`,
    );
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5 px-4 pt-4 pb-8">
      <AuditFindingsHeader
        auditId={audit ? `A-${String(audit.id)}` : `A-${auditRunId}`}
        subtitle={audit?.auditTitle ?? audit?.snapshot?.templateName ?? ""}
        onGenerateReport={handleGenerateReport}
      />

      <div className="mx-auto flex w-full max-w-200 flex-col gap-3.5">
        {isPending ? (
          <SkeletonTable rows={8} columns={5} />
        ) : findingsQuery.isError ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-ehs-red text-sm">Could not load findings.</p>
          </div>
        ) : findings.length === 0 ? (
          <EmptyState
            icon="mdi:clipboard-check-outline"
            title="No findings raised"
            message="No findings were raised on this audit."
            action={
              <Link
                href="/dashboard/audits"
                className="text4 text-ehs-normal-blue hover:underline"
              >
                Back to Audits
              </Link>
            }
          />
        ) : (
          findings.map((finding) => (
            <AuditFindingCard key={finding.id} finding={finding} />
          ))
        )}
      </div>
    </div>
  );
}
