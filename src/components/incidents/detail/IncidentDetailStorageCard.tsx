"use client";

import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/IncidentGlassCard";

export type IncidentDetailStorageCardProps = Readonly<{
  usedBytes?: number;
  maxBytes?: number;
  className?: string;
}>;

export function IncidentDetailStorageCard(
  props: Readonly<IncidentDetailStorageCardProps>,
) {
  const {
    usedBytes = 21 * 1024 * 1024, // 21 MB
    maxBytes = 50 * 1024 * 1024, // 50 MB
    className = "",
  } = props;

  const usedMB = Math.round(usedBytes / (1024 * 1024));
  const maxMB = Math.round(maxBytes / (1024 * 1024));
  const percentage = Math.min(100, Math.round((usedBytes / maxBytes) * 100));

  return (
    <IncidentGlassCard
      paddingClassName="p-4 sm:p-5"
      className={className}
    >
      <div className="flex flex-col border-b border-[rgba(15,23,42,0.06)] pb-2.5 mb-3">
        <Text as="h3" className="text-ehs-dark-bg text-[15px] font-bold">
          Storage
        </Text>
        <span className="text-[11px] text-ehs-muted-text">
          Per incident
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {/* Storage Bar */}
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-[rgba(15,23,42,0.06)]">
          <div
            className="h-full rounded-full bg-ehs-normal-blue transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* storage info */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-ehs-muted-text/dark-bg">
          <span>{usedMB} MB of {maxMB} MB</span>
          <span>{percentage}%</span>
        </div>
      </div>
    </IncidentGlassCard>
  );
}
