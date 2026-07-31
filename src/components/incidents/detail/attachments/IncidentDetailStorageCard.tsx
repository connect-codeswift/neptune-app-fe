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
  const {
    usedBytes = 0,
    maxBytes = 50 * 1024 * 1024,
    className = "",
  } = props;

  const usedMB = Math.round(usedBytes / (1024 * 1024));
  const maxMB = Math.round(maxBytes / (1024 * 1024));
  const percentage = Math.min(
    100,
    maxBytes > 0 ? Math.round((usedBytes / maxBytes) * 100) : 0,
  );

  return (
    <IncidentGlassCard
      paddingClassName="p-[19px]"
      incidentGlassCardClassName="gap-[14px]"
      className={className}
    >
      <div className="flex flex-col gap-0.5">
        <Text
          as="h3"
          className="text-[14px] leading-normal font-bold tracking-[-0.14px] text-[#0b1320]"
        >
          Storage
        </Text>
        <span className="text-[11px] leading-normal text-[#8892a3]">
          Per incident
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-[rgba(15,23,42,0.06)]">
          <div
            className="h-full rounded-full bg-[#0891a6] transition-all duration-300"
            style={{ width: `${String(percentage)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-semibold text-[#8892a3]">
          <span className="text-[#566072]">
            {usedMB} MB of {maxMB} MB
          </span>
          <span>{percentage}%</span>
        </div>
      </div>
    </IncidentGlassCard>
  );
}
