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

/**
 * Full-page loading placeholder for the Hazard dashboard. Mirrors the real
 * layout (2 KPIs, filter bar, table + insights) so the swap to real content
 * doesn't shift the page around.
 */
export function HazardPageSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
      {/* KPI Metrics */}
      <div className="grid gap-4 sm:grid-cols-2">
        <KpiCardSkeleton />
        <KpiCardSkeleton />
      </div>

      {/* Filter Bar */}
      <div className="flex w-full items-center gap-4 rounded-3xl bg-white/70 px-4 py-3 shadow-sm">
        <Skeleton className="h-6 w-16 rounded-lg" />
        <span className="h-5 w-px bg-white/90" aria-hidden="true" />
        <Skeleton className="h-6 w-24 rounded-lg" />
        <Skeleton className="ml-auto h-6 w-28 rounded-lg" />
      </div>

      {/* Table + Insights */}
      <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <IncidentGlassCard
          paddingClassName="p-0 overflow-hidden"
          className="min-w-0"
        >
          {/* Header row */}
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

        <div className="flex min-w-0 flex-col gap-5">
          {/* Heatmap placeholder */}
          <IncidentGlassCard incidentGlassCardClassName="min-w-0 gap-3">
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
          </IncidentGlassCard>

          {/* Recognition placeholder */}
          <IncidentGlassCard className="min-w-0 gap-3">
            <Skeleton className="h-3 w-28" />
            <div className="flex flex-col">
              <RecognitionRowSkeleton />
              <RecognitionRowSkeleton />
              <RecognitionRowSkeleton />
            </div>
          </IncidentGlassCard>
        </div>
      </div>
    </div>
  );
}
