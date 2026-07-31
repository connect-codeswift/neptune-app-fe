import { HAZCOM_OVERVIEW_STATS } from "@/components/hazcom/shared";
import { HazcomOverviewStatCard } from "@/components/hazcom/overview/HazcomOverviewStatCard";

/**
 * Decorative sub-captions shown under each stat value. Purely presentational
 * copy (not business data) — the values themselves always come from
 * `HAZCOM_OVERVIEW_STATS`.
 */
const CAPTION_BY_STAT_ID: Record<string, string> = {
  "total-chemicals": "+3 this month",
  "missing-sds": "Needs attention",
  "training-overdue": "Employees",
  "sds-expiring-soon": "Within 90 days",
};

export type HazcomOverviewStatsRowProps = Readonly<{
  className?: string;
}>;

export function HazcomOverviewStatsRow(
  props: Readonly<HazcomOverviewStatsRowProps>,
) {
  const { className = "" } = props;

  return (
    <div
      className={["my-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className]
        .filter(Boolean)
        .join(" ")}
    >
      {HAZCOM_OVERVIEW_STATS.map((stat) => (
        <HazcomOverviewStatCard
          key={stat.id}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          caption={CAPTION_BY_STAT_ID[stat.id] ?? ""}
        />
      ))}
    </div>
  );
}
