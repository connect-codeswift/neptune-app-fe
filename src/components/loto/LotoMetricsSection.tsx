import { StatMetricCard } from "@/components/StatMetricCard";
import { LOTO_METRICS } from "@/app/dashboard/lockout-tagout/loto-data";

/** KPI strip — same StatMetricCard / text6+text2 scale as Near Miss & Hazard. */
export function LotoMetricsSection() {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {LOTO_METRICS.map((metric) => (
        <StatMetricCard
          key={metric.label}
          title={metric.label}
          value={metric.value}
        />
      ))}
    </div>
  );
}
