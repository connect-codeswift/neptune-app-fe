import { IncidentGlassCard } from "@/components/incidents";
import { Skeleton } from "@/components/ui/Skeleton";

/** KPI card: label + trend pill, then value bar — matches Figma 4818:19714. */
function KpiCardSkeleton() {
  return (
    <IncidentGlassCard
      paddingClassName="p-5"
      className="min-w-0"
      incidentGlassCardClassName="gap-3"
    >
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-2 w-25 rounded-md opacity-60" />
        <Skeleton className="size-4 rounded-full" />
      </div>
      <Skeleton className="h-7 w-17.5 rounded-md" />
    </IncidentGlassCard>
  );
}

/** Engagement chart placeholder — title, chart block, axis ticks. */
function EngagementCardSkeleton() {
  return (
    <IncidentGlassCard
      paddingClassName="p-5"
      className="min-w-0"
      incidentGlassCardClassName="gap-3"
    >
      <div className="flex flex-col gap-1">
        <Skeleton className="h-3 w-25 rounded-md" />
        <Skeleton className="h-2 w-30 rounded-md opacity-50" />
      </div>
      <Skeleton className="h-32.5 w-full rounded-lg opacity-40" />
      <div className="flex items-start justify-between gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-2 w-5 rounded-md opacity-40" />
        ))}
      </div>
    </IncidentGlassCard>
  );
}

/** One at-risk category row: label + count, then a thin bar. */
function AtRiskRowSkeleton() {
  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-2 w-22.5 rounded-md" />
        <Skeleton className="h-2 w-5 rounded-md" />
      </div>
      <Skeleton className="h-1.5 w-full rounded-full" />
    </div>
  );
}

/** At-risk behaviors placeholder — title + five bar rows. */
function AtRiskCardSkeleton() {
  return (
    <IncidentGlassCard
      paddingClassName="p-5"
      className="min-w-0"
      incidentGlassCardClassName="gap-3"
    >
      <Skeleton className="h-3 w-35 rounded-md" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <AtRiskRowSkeleton key={index} />
        ))}
      </div>
    </IncidentGlassCard>
  );
}

/** One placeholder row in the recent sessions table. */
function SessionRowSkeleton() {
  return (
    <div className="border-ehs-border/45 flex items-center gap-4 border-b px-4 py-3.5">
      <Skeleton className="h-2.5 w-14" />
      <Skeleton className="h-2.5 w-16" />
      <Skeleton className="h-2.5 w-28" />
      <Skeleton className="h-2.5 w-24" />
      <Skeleton className="h-2.5 min-w-0 flex-1" />
      <Skeleton className="h-2.5 w-10" />
    </div>
  );
}

/**
 * Full-page loading placeholder for the BBS dashboard.
 * Mirrors Figma node 4818:19703 (KPIs, engagement, at-risk) plus the
 * recent-sessions block so the swap to live content doesn't jump the layout.
 */
export function BbsPageSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
      {/* KPI Metrics — 3 cards */}
      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCardSkeleton />
        <KpiCardSkeleton />
        <KpiCardSkeleton />
      </div>

      {/* Engagement + at-risk */}
      <div className="grid min-w-0 gap-3.5 lg:grid-cols-2">
        <EngagementCardSkeleton />
        <AtRiskCardSkeleton />
      </div>

      {/* Recent sessions — search row + table */}
      <div className="flex min-w-0 flex-col gap-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
            <Skeleton className="h-10 w-full max-w-96 rounded-xl" />
            <Skeleton className="h-10 w-44 rounded-xl" />
          </div>
          <Skeleton className="h-2.5 w-20" />
        </div>

        <IncidentGlassCard
          paddingClassName="p-0 overflow-hidden"
          className="min-w-0"
        >
          <div className="border-ehs-border/45 flex items-center justify-between gap-4 border-b px-4 py-3">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-9 w-40 rounded-[10px]" />
          </div>
          <div className="border-ehs-border/45 flex items-center gap-4 border-b px-4 py-3">
            <Skeleton className="h-2.5 w-14" />
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-2.5 w-28" />
            <Skeleton className="h-2.5 w-24" />
            <Skeleton className="h-2.5 min-w-0 flex-1" />
            <Skeleton className="h-2.5 w-10" />
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <SessionRowSkeleton key={index} />
          ))}
        </IncidentGlassCard>
      </div>
    </div>
  );
}
