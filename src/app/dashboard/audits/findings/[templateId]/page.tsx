"use client";

import { useParams, useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { AuditFindingCard } from "@/components/audits/findings/AuditFindingCard";
import { AuditFindingsHeader } from "@/components/audits/findings/AuditFindingsHeader";
import { getAuditFindings } from "../audit-findings-data";

export default function AuditFindingsPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.templateId as string;

  const { auditId, subtitle, findings } = getAuditFindings(
    decodeURIComponent(templateId),
  );

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
          auditId={auditId}
          subtitle={subtitle}
          onGenerateReport={() =>
            router.push(
              `/dashboard/audits/report/${encodeURIComponent(templateId)}`,
            )
          }
        />

        {findings.map((finding) => (
          <AuditFindingCard key={finding.id} finding={finding} />
        ))}
      </div>
    </div>
  );
}
