"use client";

import { IncidentGlassCard, IncidentBadge } from "@/components/incidents";
import { Text } from "@/components/Text";
import type { ComplianceKpiItem } from "./regulatory-compliance-types";

export type RegulatoryComplianceKpiGridProps = Readonly<{
  items: readonly ComplianceKpiItem[];
  isLoading?: boolean;
  className?: string;
}>;

function KpiCardSkeleton() {
  return (
    <IncidentGlassCard
      paddingClassName="p-[19px]"
      className="min-w-0 bg-[rgba(255,255,255,0.62)] backdrop-blur-[10px]"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="h-3 w-[90px] animate-pulse rounded-[6px] bg-[#e2e8f0]" />
        </div>
        <div className="h-[34px] w-[60px] animate-pulse rounded-[6px] bg-[#e2e8f0]" />
      </div>
    </IncidentGlassCard>
  );
}

export function RegulatoryComplianceKpiGrid(
  props: RegulatoryComplianceKpiGridProps,
) {
  const { items, isLoading = false, className = "" } = props;

  if (isLoading) {
    return (
      <div
        className={[
          "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {Array.from({ length: 4 }, (_, index) => (
          <KpiCardSkeleton key={`kpi-skeleton-${String(index)}`} />
        ))}
      </div>
    );
  }

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
              {kpi.badgeValue.trim() ? (
                <IncidentBadge
                  label={kpi.badgeValue}
                  tone={kpi.badgeTone === "coral" ? "danger" : "success"}
                />
              ) : null}
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
