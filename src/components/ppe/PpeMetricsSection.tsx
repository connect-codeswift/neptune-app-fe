"use client";

import { StatMetricCard } from "@/components/StatMetricCard";
import { Text } from "@/components/Text";
import { usePpeKpiQuery } from "@/hooks/use-ppe-queries";
import { PpeMetricsSkeleton } from "./PpeSkeletons";

/** KPI row — Active assignments + Items low stock. */
export function PpeMetricsSection() {
  const { metrics, isLoading, errorMessage } = usePpeKpiQuery();

  if (isLoading) {
    return <PpeMetricsSkeleton />;
  }

  if (errorMessage) {
    return (
      <Text as="p" className="text-ehs-muted-text text-sm">
        {errorMessage}
      </Text>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-ehs-muted-text text-[11px] font-bold tracking-wide uppercase md:hidden">
        Overview
      </p>
      <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
        {metrics.map((metric) => (
          <StatMetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
          />
        ))}
      </div>
    </div>
  );
}
