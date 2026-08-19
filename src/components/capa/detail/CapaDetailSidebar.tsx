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
      <Text as="span" className="text-ehs-muted-text shrink-0 text-base">
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
      paddingClassName="p-5.25"
      className="min-w-0 rounded-2xl"
    >
      <Text as="h3" className="text-ehs-dark-bg mb-4 text-base font-semibold">
        CAPA Details
      </Text>

      <div className="flex flex-col gap-3">
        <MetaRow label="Type">
          <Text as="span" className="text-ehs-dark-bg text-base">
            {record.typeLabel}
          </Text>
        </MetaRow>

        <MetaRow label="Priority">
          <span className="bg-ehs-red/16 text-ehs-red-ink inline-flex items-center rounded-md px-2 py-0.5 text-base font-semibold tracking-[0.11px]">
            {record.priority}
          </span>
        </MetaRow>

        <MetaRow label="Status">
          <span className="bg-ehs-yellow/12 text-ehs-yellow-ink inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm font-semibold tracking-[0.11px]">
            <span className="rounded-0.75 bg-ehs-yellow size-1.5" aria-hidden />
            {record.statusLabel}
          </span>
        </MetaRow>

        <MetaRow label="Owner">
          <Text as="span" className="text-ehs-dark-bg text-base">
            {record.owner}
          </Text>
        </MetaRow>

        <MetaRow label="Verifier">
          <Text as="span" className="text-ehs-dark-bg text-base">
            {record.verifier}
          </Text>
        </MetaRow>

        <MetaRow label="Due Date">
          <Text as="span" className="text-ehs-dark-bg text-base tabular-nums">
            {record.dueDate}
          </Text>
        </MetaRow>

        <MetaRow label="Days left">
          <Text
            as="span"
            className={[
              "text-base tabular-nums",
              record.daysLeftLabel === "Overdue"
                ? "text-ehs-red-ink-soft font-semibold"
                : "text-ehs-dark-bg",
            ].join(" ")}
          >
            {record.daysLeftLabel}
          </Text>
        </MetaRow>

        <MetaRow label="Source">
          <Text as="span" className="text-ehs-normal-blue text-base">
            {record.source}
          </Text>
        </MetaRow>

        <MetaRow label="Module">
          <Text as="span" className="text-ehs-dark-bg text-base">
            {record.module}
          </Text>
        </MetaRow>
      </div>
    </IncidentGlassCard>
  );
}
