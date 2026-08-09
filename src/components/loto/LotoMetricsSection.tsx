import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { LOTO_METRICS } from "@/app/dashboard/lockout-tagout/loto-data";

/** KPI strip — value above label, matching Figma 6835:39794. */
export function LotoMetricsSection() {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      {LOTO_METRICS.map((metric) => (
        <IncidentGlassCard
          key={metric.label}
          paddingClassName="px-5 py-[18px]"
          className="min-w-0"
        >
          <div className="flex flex-col gap-1">
            <Text
              as="p"
              className="text-ehs-darker text-[28px] leading-7 font-bold tracking-[-0.56px] tabular-nums"
            >
              {metric.value}
            </Text>
            <Text
              as="p"
              className="text-ehs-darker/70 pt-1 text-base font-semibold"
            >
              {metric.label}
            </Text>
          </div>
        </IncidentGlassCard>
      ))}
    </div>
  );
}
