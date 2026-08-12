import { MetricCardsRowSkeleton } from "@/components/ui/MetricCard";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Whole-route placeholder used by `app/dashboard/capa/loading.tsx`.
 * Mirrors CapaPageClient + CapaDashboardView layout (Figma 7123:41912).
 */
export function CapaPageSkeleton() {
  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <header className="flex min-w-0 flex-col gap-3 px-3 py-4 sm:px-4 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-4">
        <Skeleton className="h-7 w-44" />
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3 lg:ml-auto lg:justify-end">
          <Skeleton className="h-10 w-full rounded-lg sm:w-72" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </header>

      <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-4 pb-8">
        <MetricCardsRowSkeleton />

        <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
          <Skeleton className="h-74 rounded-2xl" />
          <Skeleton className="h-74 rounded-2xl" />
        </div>

        <Skeleton className="h-13.25 rounded-2xl" />

        <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <Skeleton className="h-105 rounded-2xl" />
          <Skeleton className="h-130 rounded-2xl" />
        </div>

        <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-2">
          <Skeleton className="h-70 rounded-2xl" />
          <Skeleton className="h-70 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
