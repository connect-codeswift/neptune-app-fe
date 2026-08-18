import { MetricCardsRowSkeleton } from "@/components/ui/MetricCard";
import type { ReactNode } from "react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Skeleton } from "@/components/ui/Skeleton";

/** One placeholder reporter row in the recognition card. */
function RecognitionRowSkeleton() {
  return (
    <div className="border-ehs-border/45 flex items-center gap-3 border-t py-2">
      <Skeleton className="size-7 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Skeleton className="h-2.5 w-24" />
        <Skeleton className="h-2 w-16" />
      </div>
      <Skeleton className="h-3 w-5" />
    </div>
  );
}

function InsightsCardSkeleton(props: Readonly<{ children: ReactNode }>) {
  const { children } = props;
  return (
    <IncidentGlassCard
      incidentGlassCardClassName="min-w-0 gap-3"
      className="min-w-0 gap-3"
    >
      {children}
    </IncidentGlassCard>
  );
}

/**
 * KPI + insights placeholder for Near Miss / Hazard. Filters and the register
 * table render themselves (or `SkeletonTable`) so the page does not jump.
 */
export function UnifiedNearMissAndHazardListPageSkeleton() {
  return (
    <>
      <MetricCardsRowSkeleton count={2} />

      <div className="grid min-w-0 gap-3.5 lg:grid-cols-2">
        <InsightsCardSkeleton>
          <Skeleton className="h-3 w-36" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex gap-1">
                {Array.from({ length: 5 }).map((_, colIndex) => (
                  <Skeleton key={colIndex} className="h-6 flex-1" />
                ))}
              </div>
            ))}
          </div>
        </InsightsCardSkeleton>

        <InsightsCardSkeleton>
          <Skeleton className="h-3 w-28" />
          <div className="flex flex-col">
            <RecognitionRowSkeleton />
            <RecognitionRowSkeleton />
            <RecognitionRowSkeleton />
          </div>
        </InsightsCardSkeleton>
      </div>
    </>
  );
}
