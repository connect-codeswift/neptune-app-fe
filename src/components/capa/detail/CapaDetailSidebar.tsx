"use client";

import type { ReactNode } from "react";
import { IncidentGlassCard } from "@/components/incidents";
import { Text } from "@/components/Text";
import type { CapaDetailRecord } from "@/components/capa/detail/capa-detail-data";

export type CapaDetailSidebarProps = Readonly<{
  record: CapaDetailRecord;
}>;

function MetaRow(props: Readonly<{ label: string; children: ReactNode }>) {
  return (
    <div className="flex items-start justify-between gap-3">
      <Text as="span" className="shrink-0 text-base text-[#8892a3]">
        {`${props.label}:`}
      </Text>
      <div className="min-w-0 text-right">{props.children}</div>
    </div>
  );
}

/** CAPA Details sidebar — Figma 1368:3232. */
export function CapaDetailSidebar(props: CapaDetailSidebarProps) {
  const { record } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-[21px]"
      className="min-w-0 rounded-2xl"
    >
      <Text as="h3" className="mb-4 text-base font-semibold text-[#0b1320]">
        CAPA Details
      </Text>

      <div className="flex flex-col gap-3">
        <MetaRow label="Type">
          <Text as="span" className="text-sm text-[#0b1320]">
            {record.typeLabel}
          </Text>
        </MetaRow>

        <MetaRow label="Priority">
          <span className="inline-flex items-center rounded-md bg-[rgba(239,68,68,0.16)] px-2 py-0.5 text-sm font-semibold tracking-[0.11px] text-[#7f1d1d]">
            {record.priority}
          </span>
        </MetaRow>

        <MetaRow label="Status">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(245,158,11,0.12)] px-2.5 py-0.5 text-sm font-semibold tracking-[0.11px] text-[#92400e]">
            <span className="size-1.5 rounded-[3px] bg-[#f59e0b]" aria-hidden />
            {record.statusLabel}
          </span>
        </MetaRow>

        <MetaRow label="Owner">
          <Text as="span" className="text-sm text-[#0b1320]">
            {record.owner}
          </Text>
        </MetaRow>

        <MetaRow label="Verifier">
          <Text as="span" className="text-sm text-[#0b1320]">
            {record.verifier}
          </Text>
        </MetaRow>

        <MetaRow label="Due Date">
          <Text as="span" className="text-sm text-[#0b1320] tabular-nums">
            {record.dueDate}
          </Text>
        </MetaRow>

        <MetaRow label="Source">
          <Text as="span" className="text-sm text-[#0891a6]">
            {record.source}
          </Text>
        </MetaRow>

        <MetaRow label="Module">
          <Text as="span" className="text-sm text-[#0b1320]">
            {record.module}
          </Text>
        </MetaRow>
      </div>
    </IncidentGlassCard>
  );
}
