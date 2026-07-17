"use client";

import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/IncidentGlassCard";

export type CapaSummaryProps = Readonly<{
  totalCount?: number;
  inProgressCount?: number;
  verifiedCount?: number;
  planningCount?: number;
  className?: string;
}>;

export function IncidentDetailCapaSummaryCard(
  props: Readonly<CapaSummaryProps>,
) {
  const {
    totalCount = 3,
    inProgressCount = 1,
    verifiedCount = 1,
    planningCount = 1,
    className = "",
  } = props;

  const stats = [
    { label: "Total CAPAs", value: totalCount },
    { label: "In progress", value: inProgressCount },
    { label: "Verified", value: verifiedCount },
    { label: "Planning", value: planningCount },
  ];

  return (
    <IncidentGlassCard
      paddingClassName="p-4 sm:p-5"
      className={className}
    >
      <Text
        as="h3"
        className="text-ehs-dark-bg border-b border-[rgba(15,23,42,0.06)] pb-2.5 text-[14.8px] font-bold"
      >
        CAPA summary
      </Text>

      <div className="grid grid-cols-2 gap-3 pt-3.5">
        {stats.map((item) => (
          <div
            key={item.label}
            className="flex flex-col rounded-[10px] border border-[rgba(15,23,42,0.06)] bg-white/50 p-3 shadow-sm"
          >
            <span className="text-[22px] font-extrabold text-ehs-dark-bg leading-none">
              {item.value}
            </span>
            <span className="text-[11px] font-medium text-ehs-muted-text mt-1.5 leading-tight">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </IncidentGlassCard>
  );
}
