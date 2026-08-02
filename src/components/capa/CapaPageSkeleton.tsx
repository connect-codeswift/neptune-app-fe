import { CapaListSkeleton } from "@/components/capa/CapaListSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Whole-route placeholder used by `app/dashboard/capa/loading.tsx`, so
 * navigating to CAPA paints the page shape immediately instead of a blank
 * frame. Mirrors CapaPageClient: header row, then the register.
 */
export function CapaPageSkeleton() {
  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <header className="flex min-w-0 flex-col gap-3 px-3 py-4 sm:px-4 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-4">
        <Skeleton className="h-7 w-28" />

        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3 lg:ml-auto lg:justify-end">
          <Skeleton className="h-10 w-full rounded-lg sm:w-88" />
          <Skeleton className="h-10 w-44 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
          <Skeleton className="h-10 w-9 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </header>

      <div className="flex min-w-0 flex-1 flex-col px-4 pb-8">
        <CapaListSkeleton />
      </div>
    </div>
  );
}
