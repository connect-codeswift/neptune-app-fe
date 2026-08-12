"use client";

import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";

export type IncidentDetailStorageCardProps = Readonly<{
  usedBytes?: number;
  maxBytes?: number;
  className?: string;
}>;

export function IncidentDetailStorageCard(
  props: Readonly<IncidentDetailStorageCardProps>,
) {
  const { usedBytes = 0, maxBytes = 50 * 1024 * 1024, className = "" } = props;

  const usedMB = Math.round(usedBytes / (1024 * 1024));
  const maxMB = Math.round(maxBytes / (1024 * 1024));
  const percentage = Math.min(
    100,
    maxBytes > 0 ? Math.round((usedBytes / maxBytes) * 100) : 0,
  );

  return (
    <IncidentGlassCard
      paddingClassName="p-[19px]"
      incidentGlassCardClassName="gap-3.5"
      className={className}
    >
      <div className="flex flex-col gap-0.5">
        <Text as="h3" className="text-ehs-dark-bg text3">
          Storage
        </Text>
        <span className="text-ehs-muted-text text4 leading-normal">
          Per incident
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-[rgba(15,23,42,0.06)]">
          <div
            className="bg-ehs-normal-blue h-full rounded-full transition-all duration-300"
            style={{ width: `${String(percentage)}%` }}
          />
        </div>

        <div className="text-ehs-muted-text flex items-center justify-between text4 font-semibold">
          <span className="text-ehs-gray">
            {usedMB} MB of {maxMB} MB
          </span>
          <span>{percentage}%</span>
        </div>
      </div>
    </IncidentGlassCard>
  );
}
