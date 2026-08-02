import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";

const FILTER_SHELL =
  "relative flex w-full min-w-0 flex-wrap items-center gap-x-5 gap-y-3.5 rounded-2xl border border-white/80 bg-white/60 p-3 shadow-sm backdrop-blur-md sm:px-4 sm:py-3.5";

const TABLE_ROWS = 8;
const TABLE_COLUMNS = 8;

function CapaKpiTileSkeleton() {
  return (
    <GlassCard className="gap-[6px]">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="size-7 rounded-full" />
      </div>
      <Skeleton className="h-9 w-16" />
    </GlassCard>
  );
}

/**
 * Placeholder for the CAPA register, mirroring the real layout so the page
 * doesn't reflow when data lands: KPI row, filter bar, then the table.
 */
export function CapaListSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-[14px]">
      <div className="grid gap-[14px] sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <CapaKpiTileSkeleton key={`capa-kpi-skeleton-${String(index)}`} />
        ))}
      </div>

      <div className={FILTER_SHELL}>
        <Skeleton className="h-8 w-20 rounded-lg" />
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={`capa-filter-skeleton-${String(index)}`}
              className="flex min-w-fit flex-1 items-center gap-2.5"
            >
              <Skeleton className="h-3 w-14 shrink-0" />
              <Skeleton className="h-9 min-w-40 flex-1 rounded-xl" />
            </div>
          ))}
        </div>
      </div>

      <GlassCard className="gap-0 p-0">
        <div className="border-ehs-border/60 flex items-center gap-4 border-b px-5 py-3.5">
          {Array.from({ length: TABLE_COLUMNS }, (_, index) => (
            <Skeleton
              key={`capa-head-skeleton-${String(index)}`}
              className="h-3 flex-1"
            />
          ))}
        </div>

        {Array.from({ length: TABLE_ROWS }, (_, rowIndex) => (
          <div
            key={`capa-row-skeleton-${String(rowIndex)}`}
            className="border-ehs-border/40 flex items-center gap-4 border-b px-5 py-4 last:border-b-0"
          >
            {Array.from({ length: TABLE_COLUMNS }, (_, cellIndex) => (
              <Skeleton
                key={`capa-cell-skeleton-${String(rowIndex)}-${String(cellIndex)}`}
                className="h-3.5 flex-1"
              />
            ))}
          </div>
        ))}
      </GlassCard>
    </div>
  );
}
