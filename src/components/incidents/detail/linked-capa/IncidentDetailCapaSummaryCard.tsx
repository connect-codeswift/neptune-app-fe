"use client";

import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import type { CapaSummaryCounts } from "@/components/incidents/detail/linked-capa/capa-types";

export type IncidentDetailCapaSummaryCardProps = Readonly<
  CapaSummaryCounts & {
    isLoading?: boolean;
    className?: string;
  }
>;

export function IncidentDetailCapaSummaryCard(
  props: Readonly<IncidentDetailCapaSummaryCardProps>,
) {
  const {
    totalCount = 0,
    inProgressCount = 0,
    verifiedCount = 0,
    planningCount = 0,
    isLoading = false,
    className = "",
  } = props;

  const stats = [
    { label: "Total CAPAs", value: totalCount, emphasize: true },
    { label: "In progress", value: inProgressCount, emphasize: false },
    { label: "Verified", value: verifiedCount, emphasize: false },
    { label: "Planning", value: planningCount, emphasize: false },
  ];

  return (
    <IncidentGlassCard
      paddingClassName="p-[19px]"
      incidentGlassCardClassName="gap-[14px]"
      className={["bg-white/62", className].filter(Boolean).join(" ")}
    >
      <Text
        as="h3"
        className="text-ehs-dark-bg text-lg font-semibold"
      >
        CAPA summary
      </Text>

      <div className="grid grid-cols-2 gap-2.5">
        {stats.map((item) => (
          <div
            key={item.label}
            className="flex flex-col gap-[5px] rounded-[10px] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.62)] p-[15px]"
          >
            <span
              className={[
                "text-2xl font-bold",
                item.emphasize ? "text-ehs-dark-bg" : "text-ehs-gray",
                isLoading ? "opacity-40" : "",
              ].join(" ")}
            >
              {isLoading ? "—" : item.value}
            </span>
            <span className="text-sm leading-normal text-ehs-muted-text">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </IncidentGlassCard>
  );
}
