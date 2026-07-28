"use client";

import { IncidentGlassCard, IncidentBadge } from "@/components/incidents";
import { Text } from "@/components/Text";
import type { ComplianceKpiItem } from "./regulatory-compliance-types";

export type RegulatoryComplianceKpiGridProps = Readonly<{
  items: readonly ComplianceKpiItem[];
  className?: string;
}>;

export function RegulatoryComplianceKpiGrid(
  props: RegulatoryComplianceKpiGridProps,
) {
  const { items, className = "" } = props;

  return (
    <div
      className={[
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {items.map((kpi) => (
        <IncidentGlassCard
          key={kpi.id}
          paddingClassName="p-[19px]"
          className="min-w-0 bg-[rgba(255,255,255,0.62)] backdrop-blur-[10px]"
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <Text
                as="span"
                className="text-ehs-gray py-px text-[12px] font-semibold tracking-[0.22px] uppercase"
              >
                {kpi.label}
              </Text>
              <IncidentBadge
                label={kpi.badgeValue}
                tone={kpi.badgeTone === "coral" ? "danger" : "success"}
              />
            </div>

            <Text
              as="p"
              className="text-ehs-dark-bg text-[34px] leading-none font-bold tracking-tight"
            >
              {String(kpi.count)}
            </Text>
          </div>
        </IncidentGlassCard>
      ))}
    </div>
  );
}
