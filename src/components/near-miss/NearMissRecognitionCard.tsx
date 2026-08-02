"use client";

import { IncidentGlassCard } from "@/components/incidents";
import { SkeletonListRows } from "@/components/ui/skeletons";
import { useTopNearMissUsersQuery } from "@/hooks/use-near-miss-queries";

/** "Mian Hamid Ur Rehman" -> "MH". Falls back to "?" for a blank name. */
function initialsOf(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "");

  return letters.join("") || "?";
}

export type NearMissRecognitionCardProps = Readonly<{ className?: string }>;

export function NearMissRecognitionCard(props: NearMissRecognitionCardProps) {
  const { className = "" } = props;

  const topUsersQuery = useTopNearMissUsersQuery();
  const reporters = topUsersQuery.data?.dataModel ?? [];

  return (
    <IncidentGlassCard className={className}>
      <header className="mb-3 flex flex-col gap-0.5">
        <h3 className="text-ehs-dark-bg font-bold">Recognition</h3>
        <p className="text-ehs-muted-text text-sm">Top reporters this month</p>
      </header>

      {reporters.length > 0 ? (
        <ul className="flex flex-col">
          {reporters.map((reporter) => (
            <li
              key={reporter.userId}
              className="flex items-center gap-2.5 border-t border-slate-900/10 py-4"
            >
              <span className="bg-ehs-normal-blue/18 text-ehs-dark-blue flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold">
                {initialsOf(reporter.userName)}
              </span>
              <span className="text-ehs-dark-bg min-w-0 flex-1 truncate text-sm font-bold">
                {reporter.userName}
              </span>
              <span className="text-ehs-dark-bg text-sm font-bold tabular-nums">
                {reporter.nearMissCount}
              </span>
            </li>
          ))}
        </ul>
      ) : topUsersQuery.isPending ? (
        <div className="border-t border-slate-900/10 pt-3">
          <SkeletonListRows rows={4} />
        </div>
      ) : (
        <p className="text-ehs-muted-text border-t border-slate-900/10 py-2 text-sm">
          No reporters yet this month.
        </p>
      )}
    </IncidentGlassCard>
  );
}
