"use client";

import { MetricCard, MetricCardsRowSkeleton } from "@/components/ui/MetricCard";
import type { ComplianceKpiItem } from "./regulatory-compliance-types";

export type RegulatoryComplianceKpiGridProps = Readonly<{
  items: readonly ComplianceKpiItem[];
  isLoading?: boolean;
  className?: string;
}>;

export function RegulatoryComplianceKpiGrid(
  props: RegulatoryComplianceKpiGridProps,
) {
  const { items, isLoading = false, className = "" } = props;

  if (isLoading) {
    return <MetricCardsRowSkeleton className={className} />;
  }

  return (
    <div
      className={[
        "stagger-cards grid min-w-0 grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {items.map((kpi) => (
        <MetricCard key={kpi.id} {...kpi} />
      ))}
    </div>
  );
}
