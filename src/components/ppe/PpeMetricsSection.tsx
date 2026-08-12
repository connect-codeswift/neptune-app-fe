"use client";

import { MetricCardsRow } from "@/components/ui/MetricCard";
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
      <Text as="p" className="text4 text-ehs-muted-text">
        {errorMessage}
      </Text>
    );
  }

  return <MetricCardsRow metrics={metrics} />;
}
