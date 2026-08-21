"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuditChecklistView } from "@/components/audits/detail/AuditChecklistView";
import { AuditDetailHeader } from "@/components/audits/detail/AuditDetailHeader";
import { AuditFindingsView } from "@/components/audits/detail/AuditFindingsView";
import { Tabs } from "@/components/ui/Tabs";
import { SkeletonTable } from "@/components/ui/skeletons";
import {
  useAuditDetailQuery,
  useAuditFindingsQuery,
} from "@/hooks/use-audit-queries";
import { mapFindingDtoToFinding } from "@/lib/map-audit";

type DetailTab = "checklist" | "findings";

export default function AuditDetailPage() {
  const router = useRouter();
  const params = useParams();
  const auditRunId = decodeURIComponent(params.id as string);
  const [tab, setTab] = useState<DetailTab>("checklist");

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
      <AuditDetailHeader
        auditId={audit ? `A-${String(audit.id)}` : `A-${auditRunId}`}
        subtitle={audit?.auditTitle ?? audit?.snapshot?.templateName ?? ""}
        onGenerateReport={handleGenerateReport}
      />

      <Tabs
        aria-label="Audit detail"
        value={tab}
        onChange={(value) => setTab(value as DetailTab)}
        tabs={[
          { value: "checklist", label: "Checklist" },
          { value: "findings", label: "Findings", count: findings.length },
        ]}
      />

      {isPending ? (
        <SkeletonTable rows={8} columns={5} />
      ) : detailQuery.isError || !audit ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-ehs-red text-sm">Could not load this audit.</p>
        </div>
      ) : tab === "checklist" ? (
        <AuditChecklistView audit={audit} />
      ) : findingsQuery.isError ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-ehs-red text-sm">Could not load findings.</p>
        </div>
      ) : (
        <AuditFindingsView findings={findings} />
      )}
    </div>
  );
}
