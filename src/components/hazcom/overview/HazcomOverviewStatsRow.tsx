"use client";

import { MetricCard } from "@/components/ui/MetricCard";
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
  const { sds, trainingCompliance } = overview;

  return (
    <div
      className={[
        "stagger-cards grid min-w-0 gap-3.5 sm:grid-cols-2 xl:grid-cols-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <MetricCard
        title="Total Chemicals"
        value={overview.totalChemicals}
        icon="mdi:flask-outline"
        description="On the site inventory"
      />
      <MetricCard
        title="Missing SDS"
        value={sds.missing}
        icon="mdi:file-alert-outline"
        // Zero is the only acceptable number here, so the target owns the
        // colour: any missing sheet turns the badge red.
        target={0}
        isMorePositive={false}
        signalOwnedBy="target"
        description={
          overview.totalChemicals === 0
            ? // "Every chemical has a sheet" is vacuously true of an empty
              // inventory and reads like a clean bill of health.
              "Nothing on the inventory yet"
            : sds.missing > 0
              ? "No sheet linked"
              : "Every chemical has a sheet"
        }
      />
      <MetricCard
        title="Training Sessions"
        value={overview.totalTrainingSessions}
        icon="mdi:account-school-outline"
        description="Logged to date"
      />
      <MetricCard
        title="Never Trained"
        value={trainingCompliance?.neverTrained ?? 0}
        icon="mdi:account-alert-outline"
        isMorePositive={false}
        description="No training on record"
      />
    </div>
  );
}
