"use client";

import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import type { IncidentClosureData } from "@/components/incidents/detail/incident-detail-types";

export type IncidentClosureMetadataCardProps = Readonly<{
  data: IncidentClosureData;
}>;

export function IncidentClosureMetadataCard(
  props: Readonly<IncidentClosureMetadataCardProps>
) {
  const { data } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-6"
      incidentGlassCardClassName="gap-4"
      className="h-fit rounded-[24px] border border-[rgba(15,23,42,0.06)] shadow-[0px_4px_24px_rgba(0,0,0,0.03)]"
    >
      <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
        <Text
          as="h3"
          className="text-[14px] leading-tight font-bold tracking-tight text-[#0f172a]"
        >
          Closure Metadata
        </Text>
        <span className="rounded-md bg-[#f1f5f9] px-2 py-0.5 text-[11px] font-medium text-[#64748b]">
          Auto-generated
        </span>
      </div>

      <div className="flex flex-col gap-3.5 pt-1">
        <div className="flex items-center justify-between gap-2">
          <Text as="span" className="text-[12px] font-medium text-[#94a3b8]">
            Closed by
          </Text>
          <Text as="span" className="text-[13px] font-bold text-[#0f172a]">
            {data.closedBy}
          </Text>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Text as="span" className="text-[12px] font-medium text-[#94a3b8]">
            Role
          </Text>
          <Text as="span" className="text-[13px] font-semibold text-[#1e293b]">
            {data.closedByRole}
          </Text>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Text as="span" className="text-[12px] font-medium text-[#94a3b8]">
            Closure date
          </Text>
          <Text as="span" className="text-[13px] font-semibold text-[#1e293b]">
            {data.closureDate}
          </Text>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Text as="span" className="text-[12px] font-medium text-[#94a3b8]">
            Duration open
          </Text>
          <Text as="span" className="text-[13px] font-bold text-[#0f172a]">
            {data.durationOpen}
          </Text>
        </div>
      </div>
    </IncidentGlassCard>
  );
}
