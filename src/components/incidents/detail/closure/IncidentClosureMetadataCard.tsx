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
      paddingClassName="p-[22px]"
      incidentGlassCardClassName="gap-4"
      className="h-fit bg-white/[0.62] shadow-none backdrop-blur-[10px]"
    >
      <div className="flex items-center justify-between">
        <Text
          as="h3"
          className="text-[14px] leading-tight font-bold text-[#0b1320]"
        >
          Closure Metadata
        </Text>
        <span className="rounded bg-[rgba(15,23,42,0.08)] px-2 py-0.5 text-[10px] font-semibold text-[#566072]">
          Auto-generated
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <Text as="span" className="text-[12px] font-normal text-[#8892a3]">
            Closed by
          </Text>
          <Text as="span" className="text-[12px] font-bold text-[#0b1320]">
            {data.closedBy}
          </Text>
        </div>

        <div className="flex items-start justify-between gap-2">
          <Text as="span" className="text-[12px] font-normal text-[#8892a3]">
            Role
          </Text>
          <Text as="span" className="text-[12px] font-semibold text-[#0b1320]">
            {data.closedByRole}
          </Text>
        </div>

        <div className="flex items-start justify-between gap-2">
          <Text as="span" className="text-[12px] font-normal text-[#8892a3]">
            Closure date
          </Text>
          <Text as="span" className="text-[12px] font-semibold text-[#0b1320]">
            {data.closureDate}
          </Text>
        </div>

        <div className="flex items-start justify-between gap-2">
          <Text as="span" className="text-[12px] font-normal text-[#8892a3]">
            Duration open
          </Text>
          <Text as="span" className="text-[12px] font-bold text-[#0b1320]">
            {data.durationOpen}
          </Text>
        </div>
      </div>
    </IncidentGlassCard>
  );
}
