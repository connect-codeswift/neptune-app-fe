"use client";

import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import type { PolicyDocument } from "@/components/policy-maker/policy-maker-types";

export type PolicyMakerDetailPanelProps = Readonly<{
  document: PolicyDocument | null;
  className?: string;
}>;

function MetaRow(props: Readonly<{ label: string; value: string }>) {
  const { label, value } = props;

  return (
    <div className="flex w-full items-start justify-between gap-3">
      <Text as="span" className="shrink-0 text-[11px] text-[#8892a3]">
        {label}
      </Text>
      <Text as="span" className="text-right text-[11px] text-[#0b1320]">
        {value}
      </Text>
    </div>
  );
}

function versionBadgeClass(badge: "review" | "archived" | "current"): string {
  if (badge === "review") {
    return "bg-[rgba(59,130,246,0.14)] text-[#3b82f6]";
  }
  if (badge === "current") {
    return "bg-[rgba(8,145,166,0.14)] text-[#056e7e]";
  }
  return "bg-[rgba(86,96,114,0.14)] text-[#566072]";
}

export function PolicyMakerDetailPanel(
  props: Readonly<PolicyMakerDetailPanelProps>,
) {
  const { document, className = "" } = props;

  if (!document) {
    return (
      <IncidentGlassCard
        paddingClassName="p-[18.49px]"
        className={["min-h-[240px] min-w-0", className]
          .filter(Boolean)
          .join(" ")}
        incidentGlassCardClassName="items-center justify-center"
      >
        <Text as="p" className="text-center text-sm text-[#8892a3]">
          Select a document to view details.
        </Text>
      </IncidentGlassCard>
    );
  }

  const reviewProgress =
    document.reviewersTotal === 0
      ? 0
      : Math.round((document.reviewersDone / document.reviewersTotal) * 100);

  return (
    <IncidentGlassCard
      paddingClassName="p-[18.49px]"
      incidentGlassCardClassName="gap-0"
      className={["min-w-0 self-start", className].filter(Boolean).join(" ")}
    >
      <div className="flex flex-col gap-[1.95px]">
        <Text
          as="h3"
          className="text-3.5 font-bold tracking-[-0.14px] text-[#0b1320]"
        >
          {document.title}
        </Text>
        <Text as="p" className="text-[10px] text-[#8892a3]">
          {`${document.code} · ${document.version} (${document.status.toLowerCase()})`}
        </Text>
      </div>

      <div className="flex flex-col gap-[7.78px] pt-3.5 pb-[11.68px]">
        <MetaRow label="Owner" value={document.ownerFullName} />
        <MetaRow label="Site" value={document.site} />
        <MetaRow label="Updated" value={document.updated} />
        <MetaRow
          label="Reviewers"
          value={`${String(document.reviewersDone)} of ${String(document.reviewersTotal)} done`}
        />
      </div>

      <div className="h-[5.84px] w-full overflow-hidden rounded-full bg-[rgba(136,146,163,0.2)]">
        <div
          className="h-full rounded-full bg-[#0891a6]"
          style={{ width: `${String(reviewProgress)}%` }}
        />
      </div>

      <div className="pt-[14.6px] pb-[0.97px]">
        <Text
          as="p"
          className="text-[10px] font-bold tracking-[0.82px] text-[#8892a3] uppercase"
        >
          Version history
        </Text>
      </div>

      <div className="flex flex-col">
        {document.versions.map((entry) => (
          <div
            key={`${entry.version}-${entry.date}`}
            className="flex items-center gap-[9.73px] border-t border-[rgba(15,23,42,0.08)] pt-[6.81px] pb-[5.84px]"
          >
            <Text
              as="span"
              className="w-[27.24px] shrink-0 text-[10px] font-bold text-[#0b1320]"
            >
              {entry.version}
            </Text>
            <Text
              as="span"
              className="min-w-0 flex-1 text-[10px] text-[#566072]"
            >
              {`${entry.author} · ${entry.date}`}
            </Text>
            <span
              className={[
                "inline-flex shrink-0 items-center rounded-full px-[8.76px] pt-[2.43px] pb-[2.81px] text-[10px] font-bold tracking-[0.21px]",
                versionBadgeClass(entry.badge),
              ].join(" ")}
            >
              {entry.badge}
            </span>
          </div>
        ))}
      </div>
    </IncidentGlassCard>
  );
}
