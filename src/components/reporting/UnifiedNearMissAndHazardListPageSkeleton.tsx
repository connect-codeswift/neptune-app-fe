import type { ReactNode } from "react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Skeleton } from "@/components/ui/Skeleton";

/** KPI card placeholder: label + trend dot, then a value bar. */
function KpiCardSkeleton() {
  return (
    <IncidentGlassCard paddingClassName="p-4" className="min-w-0 gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-2 w-24" />
        <Skeleton className="size-3.5 rounded-full" />
      </div>
      <Skeleton className="h-5 w-12" />
    </IncidentGlassCard>
  );
}

/** One placeholder row in the records table. */
function TableRowSkeleton() {
  return (
    <div className="border-ehs-border/45 flex items-center gap-4 border-b p-4">
      <Skeleton className="h-2.5 w-10" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-2 w-28" />
      </div>
      <Skeleton className="h-2.5 w-24" />
      <Skeleton className="h-5 w-16 rounded-[10px]" />
      <Skeleton className="h-5 w-14 rounded-[10px]" />
    </div>
  );
}

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
 * Loading placeholder for Near Miss / Hazard list pages. Mirrors
 * `UnifiedNearMissAndHazardListPage` so content swap does not shift the page.
 */
export function UnifiedNearMissAndHazardListPageSkeleton() {
  return (
    <>
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCardSkeleton />
        <KpiCardSkeleton />
      </div>

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

      <div className="flex w-full items-center gap-4 rounded-3xl bg-white/70 px-4 py-3 shadow-sm">
        <Skeleton className="h-6 w-16 rounded-lg" />
        <span className="h-5 w-px bg-white/90" aria-hidden="true" />
        <Skeleton className="h-6 w-24 rounded-lg" />
        <Skeleton className="ml-auto h-6 w-28 rounded-lg" />
      </div>

      <IncidentGlassCard
        paddingClassName="p-0 overflow-hidden"
        className="min-w-0"
      >
        <div className="border-ehs-border/45 flex items-center gap-4 border-b px-4 py-3">
          <Skeleton className="h-2.5 w-10" />
          <Skeleton className="h-2.5 w-40" />
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="h-2.5 w-20" />
        </div>

        {Array.from({ length: 5 }).map((_, index) => (
          <TableRowSkeleton key={index} />
        ))}
      </IncidentGlassCard>
    </>
  );
}
