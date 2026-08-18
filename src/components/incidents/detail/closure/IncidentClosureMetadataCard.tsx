"use client";

import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import type { IncidentClosureData } from "@/components/incidents/detail/incident-detail-types";

export type IncidentClosureMetadataCardProps = Readonly<{
  data: IncidentClosureData;
}>;

export function IncidentClosureMetadataCard(
  props: Readonly<IncidentClosureMetadataCardProps>,
) {
  const { data } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-5.5"
      incidentGlassCardClassName="gap-4"
      className="backdrop-blur-2.5 h-fit bg-white/[0.62] shadow-none"
    >
      <div className="flex items-center justify-between">
        <Text
          as="h3"
          className="text4 text-ehs-dark-bg leading-normal font-bold"
        >
          Closure Metadata
        </Text>
        <span className="text8 text-ehs-gray rounded bg-[rgba(15,23,42,0.08)] px-2 py-0.5 font-semibold">
          Auto-generated
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <Text as="span" className="text8 text-ehs-muted-text font-normal">
            Closed by
          </Text>
          <Text as="span" className="text7 text-ehs-dark-bg">
            {data.closedBy}
          </Text>
        </div>

        <div className="flex items-start justify-between gap-2">
          <Text as="span" className="text8 text-ehs-muted-text font-normal">
            Role
          </Text>
          <Text as="span" className="text8 text-ehs-dark-bg font-semibold">
            {data.closedByRole}
          </Text>
        </div>

        <div className="flex items-start justify-between gap-2">
          <Text as="span" className="text8 text-ehs-muted-text font-normal">
            Closure date
          </Text>
          <Text as="span" className="text8 text-ehs-dark-bg font-semibold">
            {data.closureDate}
          </Text>
        </div>

        <div className="flex items-start justify-between gap-2">
          <Text as="span" className="text8 text-ehs-muted-text font-normal">
            Duration open
          </Text>
          <Text as="span" className="text7 text-ehs-dark-bg">
            {data.durationOpen}
          </Text>
        </div>
      </div>
    </IncidentGlassCard>
  );
}
