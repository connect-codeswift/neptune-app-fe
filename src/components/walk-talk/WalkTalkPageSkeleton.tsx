import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Skeleton } from "@/components/ui/Skeleton";

/** KPI card: label + trend pill, then value bar — matches Figma 4818:20719. */
function KpiCardSkeleton() {
  return (
    <IncidentGlassCard
      paddingClassName="p-4"
      className="min-w-0"
      incidentGlassCardClassName="gap-2"
    >
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-2 w-30 rounded-md opacity-60" />
        <Skeleton className="h-3.5 w-6 rounded-md opacity-40" />
      </div>
      <Skeleton className="h-5 w-20 rounded-md" />
    </IncidentGlassCard>
  );
}

/** Trends chart placeholder — title, chart block, legend. */
function TrendsCardSkeleton() {
  return (
    <IncidentGlassCard
      paddingClassName="p-4"
      className="min-w-0"
      incidentGlassCardClassName="gap-3"
    >
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3.5 w-35 rounded-md" />
        <Skeleton className="h-2 w-40 rounded-md opacity-50" />
      </div>
      <Skeleton className="h-37.5 w-full rounded-lg opacity-40" />
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Skeleton className="size-2 rounded-sm" />
          <Skeleton className="h-2 w-20 rounded-md opacity-50" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="size-2 rounded-sm opacity-50" />
          <Skeleton className="h-2 w-20 rounded-md opacity-50" />
        </div>
      </div>
    </IncidentGlassCard>
  );
}

/** One top-findings row: label + count, then a thin bar. */
function FindingRowSkeleton() {
  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-2.5 w-25 rounded-md" />
        <Skeleton className="h-2.5 w-6 rounded-md" />
      </div>
      <Skeleton className="h-1.5 w-full rounded-full" />
    </div>
  );
}

/** Top findings placeholder — title + five bar rows. */
function FindingsCardSkeleton() {
  return (
    <IncidentGlassCard
      paddingClassName="p-4"
      className="min-w-0"
      incidentGlassCardClassName="gap-3"
    >
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3.5 w-25 rounded-md" />
        <Skeleton className="h-2 w-37.5 rounded-md opacity-50" />
      </div>
      <div className="flex flex-col gap-2.5 pt-2.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <FindingRowSkeleton key={index} />
        ))}
      </div>
    </IncidentGlassCard>
  );
}

/** One placeholder row in the recent sessions table. */
function SessionRowSkeleton() {
  return (
    <div className="border-ehs-border/45 flex items-center gap-5 border-b px-4 py-3.5">
      <Skeleton className="h-2.5 w-20" />
      <Skeleton className="h-4.5 w-20 rounded-md opacity-40" />
      <Skeleton className="h-2.5 w-30" />
      <div className="flex w-45 flex-col gap-1">
        <Skeleton className="h-2.5 w-35" />
        <Skeleton className="h-2 w-22.5 opacity-50" />
      </div>
      <Skeleton className="h-2.5 w-30" />
    </div>
  );
}

/**
 * Full-page loading placeholder for the Walk & Talk dashboard.
 * Mirrors Figma node 4818:20706 (KPIs, trends, top findings, sessions).
 */
export function WalkTalkPageSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
      {/* KPI Metrics — 2 cards */}
      <div className="grid gap-3.5 sm:grid-cols-2">
        <KpiCardSkeleton />
        <KpiCardSkeleton />
      </div>

      {/* Trends + top findings — stacked on mobile, side-by-side from lg */}
      <div className="grid min-w-0 gap-3.5 lg:grid-cols-2">
        <TrendsCardSkeleton />
        <FindingsCardSkeleton />
      </div>

      {/* Recent sessions — header + table */}
      <IncidentGlassCard
        paddingClassName="p-4"
        className="min-w-0"
        incidentGlassCardClassName="gap-3"
      >
        <div className="border-ehs-border/45 flex items-center justify-between gap-4 border-b pb-2">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-6 w-22.5 rounded-md opacity-40" />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-5">
            <Skeleton className="h-2 w-20" />
            <Skeleton className="h-2 w-30" />
            <Skeleton className="h-2 w-30" />
            <Skeleton className="h-2 w-45" />
            <Skeleton className="h-2 w-30" />
          </div>
          {Array.from({ length: 3 }).map((_, index) => (
            <SessionRowSkeleton key={index} />
          ))}
        </div>
      </IncidentGlassCard>
    </div>
  );
}
