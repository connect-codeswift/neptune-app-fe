"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import type { IncidentBadgeTone } from "@/components/near-miss/IncidentBadge";
import type { HazardRecord } from "@/app/dashboard/hazard/hazard-data";
import { formatHazardDisplayId } from "@/lib/map-hazard";
import { userNameFor } from "@/lib/map-user";

export type HazardDetailPanelProps = Readonly<{
  record: HazardRecord;
  userNames?: ReadonlyMap<string, string>;
  className?: string;
}>;

function statusTone(status: string): IncidentBadgeTone {
  const normalized = status
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
  if (normalized === "open") return "teal";
  if (normalized === "investigating") return "warn";
  if (normalized === "closed") return "muted";
  return "muted";
}

function severityTone(severity: string): IncidentBadgeTone {
  switch (severity.trim().toLowerCase()) {
    case "high":
    case "critical":
      return "danger";
    case "medium":
    case "moderate":
      return "warn";
    case "low":
      return "teal";
    default:
      return "muted";
  }
}

function MetaField(props: Readonly<{ label: string; value: string }>) {
  const { label, value } = props;

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Text as="p" className="text9 text-ehs-muted-text">
        {label}
      </Text>
      <Text as="p" className="text4 text-ehs-darker truncate">
        {value || "—"}
      </Text>
    </div>
  );
}

export function HazardDetailPanel(props: Readonly<HazardDetailPanelProps>) {
  const { record, userNames, className = "" } = props;
  const displayId = formatHazardDisplayId(record.id);
  const detailsHref = `/dashboard/hazard/${encodeURIComponent(record.id)}`;
  const reporter =
    record.reporterId != null && record.reporterId > 0
      ? userNameFor(userNames, record.reporterId)
      : record.reporter;
  const assignedTo =
    record.assignedToId != null && record.assignedToId > 0
      ? userNameFor(userNames, record.assignedToId)
      : record.assignedTo;

  return (
    <IncidentGlassCard
      paddingClassName="p-0 overflow-hidden"
      className={["flex min-w-0 flex-col", className].filter(Boolean).join(" ")}
    >
      <div className="border-ehs-border border-b px-5 pt-4.5 pb-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Text as="span" className="text7 text-ehs-muted-text">
              {displayId}
            </Text>
            <IncidentBadge
              label={record.severity}
              tone={severityTone(record.severity)}
              showDot
              className="text5 w-fit rounded-md px-2 py-0.5 tracking-normal"
            />
            <IncidentBadge
              label={record.status}
              tone={statusTone(record.status)}
              showDot
              className="text5 w-fit rounded-md px-2 py-0.5 tracking-normal"
            />
          </div>

          <Link
            href={detailsHref}
            className="border-ehs-border text-ehs-normal-blue hover:bg-ehs-light-blue/40 text5 bg-ehs-surface inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 transition-colors"
          >
            Open details
            <Icon
              icon="mdi:arrow-right"
              className="size-3.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        <Text as="h2" className="text3 text-ehs-darker">
          {record.title}
        </Text>
        <Text as="p" className="text8 text-ehs-muted-text mt-1">
          {record.location || record.site || "—"}
        </Text>
      </div>

      <div className="border-ehs-border grid grid-cols-2 gap-x-4 gap-y-3.5 border-b px-5 py-3.5">
        <MetaField label="Type" value={record.hazardType} />
        <MetaField label="Age" value={record.age} />
        <MetaField label="Reporter" value={reporter} />
        <MetaField label="Assigned To" value={assignedTo} />
        <MetaField label="Date Reported" value={record.dateReported} />
        <MetaField label="Status" value={record.status} />
      </div>

      <div className="px-5 py-3.5">
        <Text as="p" className="text9 text-ehs-muted-text mb-2">
          Description
        </Text>
        <Text as="p" className="text4 text-ehs-gray">
          {record.description.trim() || "—"}
        </Text>
      </div>
    </IncidentGlassCard>
  );
}
