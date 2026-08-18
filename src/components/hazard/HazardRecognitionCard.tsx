"use client";

import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import { SkeletonListRows } from "@/components/ui/skeletons";
import { useMonthlyHazardUsersQuery } from "@/hooks/use-hazard-queries";

/** "Mian Hamid Ur Rehman" -> "MH". Falls back to "?" for a blank name. */
function initialsOf(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "");

  return letters.join("") || "?";
}

export type HazardRecognitionCardProps = Readonly<{ className?: string }>;

export function HazardRecognitionCard(props: HazardRecognitionCardProps) {
  const { className = "" } = props;

  const now = new Date();
  const monthlyUsersQuery = useMonthlyHazardUsersQuery({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });
  const reporters = monthlyUsersQuery.data?.dataModel ?? [];

  return (
    <IncidentGlassCard className={className}>
      <header className="mb-3 flex flex-col gap-0.5">
        <Text as="h3" className="text3 text-ehs-darker">
          Recognition
        </Text>
        <Text as="p" className="text8 text-ehs-muted-text">
          Top reporters this month
        </Text>
      </header>

      {reporters.length > 0 ? (
        <ul className="flex flex-col">
          {reporters.map((reporter) => (
            <li
              key={reporter.userId}
              className="flex items-center gap-2.5 border-t border-slate-900/10 py-3"
            >
              <Text
                as="span"
                className="text7 bg-ehs-normal-blue/18 text-ehs-dark-blue flex size-7 shrink-0 items-center justify-center rounded-lg font-bold"
              >
                {initialsOf(reporter.userName)}
              </Text>
              <Text
                as="span"
                className="text4 text-ehs-darker min-w-0 flex-1 truncate"
              >
                {reporter.userName}
              </Text>
              <Text as="span" className="text4 text-ehs-darker tabular-nums">
                {String(reporter.hazardCount)}
              </Text>
            </li>
          ))}
        </ul>
      ) : monthlyUsersQuery.isPending ? (
        <div className="border-t border-slate-900/10 pt-3">
          <SkeletonListRows rows={4} />
        </div>
      ) : (
        <Text
          as="p"
          className="text8 text-ehs-muted-text border-t border-slate-900/10 py-2"
        >
          No reporters yet this month.
        </Text>
      )}
    </IncidentGlassCard>
  );
}
