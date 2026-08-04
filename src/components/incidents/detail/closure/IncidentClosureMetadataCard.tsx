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
          className="text-sm leading-tight font-bold text-ehs-dark-bg"
        >
          Closure Metadata
        </Text>
        <span className="rounded bg-[rgba(15,23,42,0.08)] px-2 py-0.5 text-xs font-semibold text-ehs-gray">
          Auto-generated
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <Text as="span" className="text-sm font-normal text-ehs-muted-text">
            Closed by
          </Text>
          <Text as="span" className="text-sm font-bold text-ehs-dark-bg">
            {data.closedBy}
          </Text>
        </div>

        <div className="flex items-start justify-between gap-2">
          <Text as="span" className="text-sm font-normal text-ehs-muted-text">
            Role
          </Text>
          <Text as="span" className="text-sm font-semibold text-ehs-dark-bg">
            {data.closedByRole}
          </Text>
        </div>

        <div className="flex items-start justify-between gap-2">
          <Text as="span" className="text-sm font-normal text-ehs-muted-text">
            Closure date
          </Text>
          <Text as="span" className="text-sm font-semibold text-ehs-dark-bg">
            {data.closureDate}
          </Text>
        </div>

        <div className="flex items-start justify-between gap-2">
          <Text as="span" className="text-sm font-normal text-ehs-muted-text">
            Duration open
          </Text>
          <Text as="span" className="text-sm font-bold text-ehs-dark-bg">
            {data.durationOpen}
          </Text>
        </div>
      </div>
    </IncidentGlassCard>
  );
}
