import { Text } from "@/components/Text";
import {
  MetricCardsRow,
  MetricCardsRowSkeleton,
} from "@/components/ui/MetricCard";
import type { LotoDashboardKpisDto } from "@/dtos/res/loto-response.dto";
import { toLotoMetrics } from "@/services/mappers/loto.mapper";

export type LotoMetricsSectionProps = Readonly<{
  kpis: LotoDashboardKpisDto | null;
  isLoading: boolean;
  isError: boolean;
}>;

/** KPI strip — same MetricCard as every other module header, fed by GET /api/Loto/dashboard-kpis. */
export function LotoMetricsSection(props: Readonly<LotoMetricsSectionProps>) {
  const { kpis, isLoading, isError } = props;

  if (isLoading) {
    return <MetricCardsRowSkeleton count={4} />;
  }

  if (isError || !kpis) {
    return (
      <Text as="p" className="text4 text-ehs-muted-text px-1">
        Couldn&apos;t load LOTO metrics.
      </Text>
    );
  }

  return <MetricCardsRow metrics={toLotoMetrics(kpis)} />;
}
