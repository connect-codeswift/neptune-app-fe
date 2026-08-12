import { MetricCardsRow } from "@/components/ui/MetricCard";
import { LOTO_METRICS } from "@/app/dashboard/lockout-tagout/loto-data";

/** KPI strip — same MetricCard as every other module header. */
export function LotoMetricsSection() {
  return <MetricCardsRow metrics={LOTO_METRICS} />;
}
