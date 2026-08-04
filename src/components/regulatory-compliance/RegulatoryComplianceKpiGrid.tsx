"use client";

import { IncidentGlassCard } from "@/components/incidents";
import { Text } from "@/components/Text";
import type { ComplianceKpiItem } from "./regulatory-compliance-types";
import {
  ComplianceDeltaBadge,
  complianceGlassCardClass,
} from "./compliance-ui";

export type RegulatoryComplianceKpiGridProps = Readonly<{
  items: readonly ComplianceKpiItem[];
  isLoading?: boolean;
  className?: string;
}>;

function KpiCardSkeleton() {
  return (
    <IncidentGlassCard
      paddingClassName="p-[15.57px]"
      className={["min-w-0", complianceGlassCardClass].join(" ")}
    >
      <div className="flex flex-col gap-[16px]">
        <div className="flex h-[20.244px] items-center justify-between gap-2">
          <div className="h-[14px] w-[90px] animate-pulse rounded-[6px] bg-[#e2e8f0]" />
          <div className="h-5 w-8 animate-pulse rounded-full bg-[#e2e8f0]" />
        </div>
        <div className="h-[30px] w-[60px] animate-pulse rounded-[6px] bg-[#e2e8f0]" />
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
          "grid grid-cols-1 gap-[13.62px] sm:grid-cols-2 lg:grid-cols-4",
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
        "grid grid-cols-1 gap-[13.62px] sm:grid-cols-2 lg:grid-cols-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {items.map((kpi) => (
        <IncidentGlassCard
          key={kpi.id}
          paddingClassName="p-[15.57px]"
          className={["min-w-0", complianceGlassCardClass].join(" ")}
        >
          <div className="flex flex-col gap-[16px]">
            <div className="flex h-[20.244px] items-center justify-between">
              <Text
                as="span"
                className="text-[10px] leading-none font-bold tracking-[0.21px] text-[#566072] uppercase"
              >
                {kpi.label}
              </Text>
              <ComplianceDeltaBadge
                value={kpi.badgeValue}
                tone={kpi.badgeTone}
              />
            </div>

            <Text
              as="p"
              className="text-[30px] leading-[29px] font-normal tracking-[-0.58px] text-[#0b1320]"
            >
              {String(kpi.count)}
            </Text>
          </div>
        </IncidentGlassCard>
      ))}
    </div>
  );
}
