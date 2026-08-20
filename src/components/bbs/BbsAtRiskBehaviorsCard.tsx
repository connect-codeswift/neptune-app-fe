"use client";
import { EmptyState } from "@/components/ui/EmptyState";

import { useMemo } from "react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { useBbsAtRiskCategoriesQuery } from "@/hooks/use-bbs-queries";
import { toBbsAtRiskBehaviors } from "@/lib/map-bbs";
import type {
  BehaviorCategory,
  BehaviorTone,
} from "@/app/dashboard/bbs/bbs-data";

const toneColor: Record<BehaviorTone, string> = {
  risk: "var(--ehs-red)",
  info: "var(--ehs-normal-blue)",
};

/** One category: label + count above a proportional bar. */
function BehaviorRow(
  props: Readonly<{ category: BehaviorCategory; max: number }>,
) {
  const { category, max } = props;
  const percent = max > 0 ? (category.count / max) * 100 : 0;

  return (
    <li className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-ehs-dark-bg min-w-0 truncate">
          {category.label}
        </span>
        <span className="text-ehs-dark-bg shrink-0 text-sm font-bold tabular-nums">
          {category.count}
        </span>
      </div>

      <span
        className="bg-ehs-form-classes-bg h-2.5 w-full overflow-hidden rounded-full"
        aria-hidden="true"
      >
        <span
          className="block h-full rounded-full"
          style={{
            width: `${String(percent)}%`,
            backgroundColor: toneColor[category.tone],
          }}
        />
      </span>
    </li>
  );
}

export type BbsAtRiskBehaviorsCardProps = Readonly<{
  className?: string;
}>;

export function BbsAtRiskBehaviorsCard(props: BbsAtRiskBehaviorsCardProps) {
  const { className = "" } = props;
  const atRiskQuery = useBbsAtRiskCategoriesQuery();

  const categories = useMemo(
    () => toBbsAtRiskBehaviors(atRiskQuery.data?.dataModel),
    [atRiskQuery.data?.dataModel],
  );

  // Bars are scaled against the biggest category, so the top one fills the track.
  const max = categories.reduce(
    (highest, category) => Math.max(highest, category.count),
    0,
  );

  return (
    <IncidentGlassCard
      paddingClassName="p-6"
      className={["min-w-0", className].filter(Boolean).join(" ")}
      incidentGlassCardClassName="gap-4"
    >
      <header className="flex flex-col gap-0.5">
        <h3 className="text-ehs-dark-bg text-lg font-bold">
          At-risk behaviors
        </h3>
        <p className="text-ehs-muted-text text-sm">Top categories observed</p>
      </header>

      {atRiskQuery.isPending ? (
        <p className="text-ehs-muted-text text-sm">Loading…</p>
      ) : categories.length === 0 ? (
        <EmptyState
          variant="plain"
          icon="mdi:shield-check-outline"
          title="No at-risk behaviors observed"
          message="Behaviors flagged during observations appear here."
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {categories.map((category) => (
            <BehaviorRow key={category.label} category={category} max={max} />
          ))}
        </ul>
      )}
    </IncidentGlassCard>
  );
}
