"use client";

import { HazcomOverviewStatCard } from "@/components/hazcom/overview/HazcomOverviewStatCard";
import type { HazcomOverviewState } from "@/hooks/use-hazcom-overview";

export type HazcomOverviewStatsRowProps = Readonly<{
  overview: HazcomOverviewState;
  className?: string;
}>;

/**
 * The four KPI tiles, each counted from a real list endpoint.
 *
 * Was a static fixture (142 chemicals / 7 missing SDS / 14 training overdue /
 * 5 expiring) with a "+3 this month" caption, none of it connected to the site's
 * data — the inventory could hold nothing and this row still read 142. The
 * "Training Overdue" tile is gone rather than rewired: overdue is a per-employee
 * judgement and the training endpoint returns sessions, with an attendee count
 * and no roster, so there is nothing to count it from. Sessions logged is what
 * the endpoint can actually answer.
 */
export function HazcomOverviewStatsRow(
  props: Readonly<HazcomOverviewStatsRowProps>,
) {
  const { overview, className = "" } = props;
  const { sds } = overview;

  // A count taken from one page can only be a floor when more rows exist.
  const sampledCaption = overview.isSampled
    ? "In the most recent records"
    : "Across the inventory";

  return (
    <div
      className={["my-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className]
        .filter(Boolean)
        .join(" ")}
    >
      <HazcomOverviewStatCard
        label="Total Chemicals"
        value={overview.totalChemicals}
        icon="mdi:flask-outline"
        caption="On the site inventory"
      />
      <HazcomOverviewStatCard
        label="Missing SDS"
        value={sds.missing}
        icon="mdi:file-alert-outline"
        tone={sds.missing > 0 ? "danger" : "neutral"}
        caption={
          overview.totalChemicals === 0
            ? // "Every chemical has a sheet" is vacuously true of an empty
              // inventory and reads like a clean bill of health.
              "Nothing on the inventory yet"
            : sds.missing > 0
              ? "No sheet linked"
              : "Every chemical has a sheet"
        }
      />
      <HazcomOverviewStatCard
        label="SDS Expiring Soon"
        value={sds.dueSoon}
        icon="mdi:clock-alert-outline"
        caption={sampledCaption}
      />
      <HazcomOverviewStatCard
        label="Training Sessions"
        value={overview.totalTrainingSessions}
        icon="mdi:account-school-outline"
        caption="Logged to date"
      />
    </div>
  );
}
