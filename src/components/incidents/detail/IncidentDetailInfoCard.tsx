"use client";

import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/IncidentGlassCard";

export type IncidentDetailInfoItem = Readonly<{
  label: string;
  value: string;
}>;

export type IncidentDetailInfoCardProps = Readonly<{
  items?: readonly IncidentDetailInfoItem[];
  className?: string;
}>;

const DEFAULT_INFO_ITEMS: readonly IncidentDetailInfoItem[] = [
  { label: "Equipment", value: "Hydraulic Press #4 - ASSET-PRS-014" },
  { label: "Energy involved", value: "Hydraulic - 2,800 psi" },
  { label: "Hose age", value: "14 months (warranty: 24)" },
  { label: "Last inspection", value: "2026-03-12 (passed)" },
  { label: "Operator on shift", value: "Maria Lopez - EMP-04821" },
  { label: "Supervisor", value: "Alicia Chen" },
  { label: "Weather", value: "Indoor - n/a" },
  { label: "Lighting", value: "Adequate" },
];

export function IncidentDetailInfoCard(
  props: Readonly<IncidentDetailInfoCardProps>,
) {
  const { items = DEFAULT_INFO_ITEMS, className = "" } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-4 sm:p-5"
      className={className}
    >
      <Text
        as="h3"
        className="text-ehs-dark-bg border-b border-[rgba(15,23,42,0.06)] pb-2.5 text-[15px] font-bold"
      >
        Incident details
      </Text>

      <div className="grid grid-cols-1 gap-x-6 gap-y-4 pt-3.5 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex flex-col gap-0.5 border-b border-[rgba(15,23,42,0.03)] pb-2 last:border-0 sm:pb-3"
          >
            <span className="text-ehs-muted-text text-[9.5px] font-bold tracking-[0.8px] uppercase">
              {item.label}
            </span>
            <span className="text-[13px] font-semibold text-[#2a3446]">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </IncidentGlassCard>
  );
}
