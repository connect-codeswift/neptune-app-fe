import { MetricCardsRowSkeleton } from "@/components/ui/MetricCard";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Skeleton } from "@/components/ui/Skeleton";

/** KPI card placeholder: label + trend dot, then a value bar. */
/** One placeholder row in the register: title/scope, site, auditor, meter… */
function TableRowSkeleton() {
  return (
    <div className="border-ehs-border/45 flex items-center gap-4 border-b p-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-2 w-28" />
      </div>
      <Skeleton className="h-2.5 w-16" />
      <Skeleton className="h-2.5 w-24" />
      <Skeleton className="h-1.5 w-20 rounded-full" />
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-2.5 w-16" />
    </div>
  );
}

/** Donut + legend placeholder for the selected record's breakdown. */
export function AuditDetailPanelSkeleton() {
  return (
    <IncidentGlassCard className="min-w-0" incidentGlassCardClassName="gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-2.5 w-28" />
        </div>
        <Skeleton className="rounded-2.5 h-8 w-28" />
      </div>

      <div className="flex items-center gap-5">
        <Skeleton className="size-32 shrink-0 rounded-full" />

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <Skeleton className="size-2.5 shrink-0 rounded-sm" />
              <Skeleton className="h-2.5 flex-1" />
              <Skeleton className="h-2.5 w-5" />
            </div>
          ))}
        </div>
      </div>
    </IncidentGlassCard>
  );
}

/**
 * Full-page loading placeholder for the Audits dashboard. Mirrors the real
 * layout (4 KPIs, register toolbar + table, detail panel) so the swap to real
 * content doesn't shift the page around.
 */
export function AuditPageSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
      {/* KPI Metrics */}
      <MetricCardsRowSkeleton />

      {/* Register + selected record breakdown */}
      <div className="grid min-w-0 items-start gap-3.5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <IncidentGlassCard
          paddingClassName="p-0 overflow-hidden"
          className="min-w-0"
        >
          {/* Toolbar: title, status segments, Templates button */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <Skeleton className="h-3 w-28" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-56 rounded-xl" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>

          {/* Column headers */}
          <div className="border-ehs-border/45 flex items-center gap-4 border-y px-4 py-3">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-2.5 w-14" />
          </div>

          {Array.from({ length: 6 }).map((_, index) => (
            <TableRowSkeleton key={index} />
          ))}
        </IncidentGlassCard>

        <AuditDetailPanelSkeleton />
      </div>
    </div>
  );
}
