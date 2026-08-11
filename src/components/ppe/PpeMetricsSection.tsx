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
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
      {metrics.map((metric) => (
        <StatMetricCard
          key={metric.title}
          title={metric.title}
          value={metric.value}
        />
      ))}
    </div>
  );
}
