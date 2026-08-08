import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Loading placeholders for the command center.
 *
 * Each one mirrors the real component's layout rather than centring a spinner,
 * so the page holds its shape while data lands instead of collapsing and
 * snapping back. The KPI row is the one that mattered most: it used to render
 * a single full-width spinner card that became four cards on load.
 */

function KpiMetricCardSkeleton() {
  return (
    <GlassCard className="flex-1 justify-between">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="mt-px h-3.5 w-28" />
        <Skeleton className="h-[21px] w-14 rounded-full" />
      </div>

      <div className="flex items-baseline gap-[10px]">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-3.5 w-8" />
      </div>

      <div className="flex items-end justify-between gap-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-[22px] w-[70px] rounded-md" />
      </div>
    </GlassCard>
  );
}

export function KpiMetricsRowSkeleton() {
  // Staggered to match KpiMetricsRow, so the loading row and the real row
  // settle in with the same rhythm rather than switching cadence.
  return (
    <div className="stagger-cards grid gap-[14px] sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <KpiMetricCardSkeleton key={`kpi-skeleton-${String(index)}`} />
      ))}
    </div>
  );
}

/** Body placeholder for the Incident Trends card — axis, plot, legend. */
export function TrendChartSkeleton() {
  return (
    <div className="flex min-h-[220px] w-full flex-col gap-3">
      <div className="flex min-h-[190px] flex-1 gap-3">
        <div className="flex w-6 shrink-0 flex-col justify-between py-1">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton
              key={`trend-y-${String(index)}`}
              className="h-2.5 w-full"
            />
          ))}
        </div>

        <div className="flex flex-1 flex-col justify-between gap-3">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton
              key={`trend-grid-${String(index)}`}
              className="h-px w-full rounded-none opacity-70"
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pl-9">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={`trend-x-${String(index)}`} className="h-2.5 w-6" />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={`trend-legend-${String(index)}`}
            className="flex items-center gap-1.5"
          >
            <Skeleton className="size-[6px] rounded-full" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Body placeholder for the list cards — My Actions, Deadlines, Activity. */
export function ListCardSkeleton(props: Readonly<{ rows?: number }>) {
  const { rows = 5 } = props;

  return (
    <div className="mt-[7px] flex flex-col gap-[14px]">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={`list-skeleton-${String(index)}`}
          className="flex items-start justify-between gap-3"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
            <Skeleton className="h-3.5 w-[70%]" />
            <Skeleton className="h-2.5 w-[45%]" />
          </div>
          <Skeleton className="h-[22px] w-11 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** Header placeholder for a card that hasn't rendered its own heading yet. */
function CardHeadingSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-col gap-[2px]">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-2.5 w-28" />
      </div>
      <Skeleton className="h-6 w-16 rounded-[10px]" />
    </div>
  );
}

function BarChartCardSkeleton() {
  const heights = ["h-32", "h-26", "h-22", "h-16", "h-14", "h-10"];

  return (
    <GlassCard>
      <CardHeadingSkeleton />
      <div className="flex min-h-[200px] flex-1 items-end justify-between gap-3 pt-4">
        {heights.map((height, index) => (
          <div
            key={`bar-skeleton-${String(index)}`}
            className="flex flex-1 flex-col items-center gap-2"
          >
            <Skeleton className="h-2.5 w-5" />
            <Skeleton className={`w-full rounded-md ${height}`} />
            <Skeleton className="h-2.5 w-12" />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function ProgressCardSkeleton() {
  return (
    <GlassCard>
      <CardHeadingSkeleton />
      <div className="mt-[7px] flex flex-col gap-3">
        {Array.from({ length: 7 }, (_, index) => (
          <div
            key={`progress-skeleton-${String(index)}`}
            className="flex flex-col gap-[5px]"
          >
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-[6px] w-full rounded-full" />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

/**
 * Whole-route placeholder used by `app/dashboard/loading.tsx` so navigating to
 * the dashboard paints its shape immediately. Mirrors the page's grid exactly.
 */
export function DashboardPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <header className="flex min-w-0 flex-col gap-3 px-3 py-4 sm:px-4 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-4">
        <Skeleton className="h-8 w-64" />
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3 lg:ml-auto lg:justify-end">
          <Skeleton className="h-10 w-full rounded-lg sm:w-88" />
          <Skeleton className="h-10 w-44 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
          <Skeleton className="h-10 w-9 rounded-lg" />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-[14px] px-4 pb-8">
        <KpiMetricsRowSkeleton />

        <div className="grid gap-[14px] lg:grid-cols-13">
          <GlassCard className="lg:col-span-8">
            <CardHeadingSkeleton />
            <TrendChartSkeleton />
          </GlassCard>
          <div className="lg:col-span-5">
            <BarChartCardSkeleton />
          </div>
        </div>

        <div className="grid gap-[14px] lg:grid-cols-2">
          <ProgressCardSkeleton />
          <GlassCard>
            <CardHeadingSkeleton />
            <ListCardSkeleton />
          </GlassCard>
        </div>

        <div className="grid gap-[14px] lg:grid-cols-2">
          <GlassCard>
            <CardHeadingSkeleton />
            <ListCardSkeleton />
          </GlassCard>
          <GlassCard>
            <CardHeadingSkeleton />
            <ListCardSkeleton rows={6} />
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
