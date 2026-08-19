import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Skeleton } from "@/components/ui/Skeleton";

/** KPI tile — Figma 4818:19425. */
function CapaKpiCardSkeleton() {
  return (
    <IncidentGlassCard
      paddingClassName="p-4.75"
      className="min-w-0"
      incidentGlassCardClassName="gap-3"
    >
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-2 w-22.5 rounded-md opacity-60" />
        <Skeleton className="size-4 rounded-full" />
      </div>
      <div className="flex h-10 items-end justify-between gap-3">
        <Skeleton className="h-7 w-12.5 rounded-md" />
        <Skeleton className="h-5.5 w-17.5 rounded opacity-50" />
      </div>
      <Skeleton className="h-2 w-20 rounded-md opacity-40" />
    </IncidentGlassCard>
  );
}

/** Lifecycle donut card — Figma 4818:19458. */
function LifecycleCardSkeleton() {
  return (
    <IncidentGlassCard
      paddingClassName="p-4.75"
      className="min-w-0"
      incidentGlassCardClassName="gap-3"
    >
      <Skeleton className="h-3 w-25 rounded-md" />
      <Skeleton className="h-2 w-15 rounded-md opacity-50" />
      <div className="flex min-h-40 items-center gap-5">
        <Skeleton className="size-27.5 shrink-0 rounded-full opacity-50" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <Skeleton className="size-2 shrink-0 rounded-sm" />
              <Skeleton className="h-2 w-15 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </IncidentGlassCard>
  );
}

/** Opened vs closed chart card — Figma 4818:19476. */
function OpenedClosedCardSkeleton() {
  return (
    <IncidentGlassCard
      paddingClassName="p-4.75"
      className="min-w-0"
      incidentGlassCardClassName="gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-3 w-35 rounded-md" />
          <Skeleton className="h-2 w-45 rounded-md opacity-50" />
        </div>
        <Skeleton className="size-5 rounded-full" />
      </div>
      <Skeleton className="h-16 w-full rounded-lg opacity-30" />
      <div className="flex items-start justify-between gap-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-2 w-6 rounded-md opacity-40" />
        ))}
      </div>
    </IncidentGlassCard>
  );
}

/** Filter / status pills bar — Figma 4818:19493. */
function FiltersBarSkeleton() {
  return (
    <div className="rounded-5 border-ehs-hairline/90 bg-ehs-surface/60 flex w-full flex-wrap items-center gap-4 border p-3 shadow-sm backdrop-blur-md">
      <Skeleton className="h-2.5 w-10 rounded-md opacity-60" />
      <div className="flex flex-wrap items-center gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-6 w-15 rounded-md opacity-80" />
        ))}
      </div>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Skeleton className="rounded-2.5 h-9 w-22" />
        <Skeleton className="rounded-2.5 bg-ehs-normal-blue/30 h-9 w-25" />
      </div>
    </div>
  );
}

/** Workload-by-owner rows — Figma 4818:19620. */
function WorkloadCardSkeleton() {
  return (
    <IncidentGlassCard
      paddingClassName="p-4.75"
      className="min-w-0"
      incidentGlassCardClassName="gap-3"
    >
      <Skeleton className="h-3 w-30 rounded-md" />
      <div className="flex flex-col gap-3 py-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-2 w-17.5 rounded-md" />
              <Skeleton className="h-2 w-5 rounded-md" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    </IncidentGlassCard>
  );
}

/** Pending reviews list placeholder (pairs with workload in live layout). */
function PendingReviewsCardSkeleton() {
  return (
    <IncidentGlassCard
      paddingClassName="p-4.75"
      className="min-w-0"
      incidentGlassCardClassName="gap-3"
    >
      <Skeleton className="h-3 w-40 rounded-md" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="border-ehs-border-ink/6 flex items-center justify-between gap-3 border-t pt-3 first:border-t-0 first:pt-0"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Skeleton className="h-2.5 w-40 rounded-md" />
              <Skeleton className="h-2 w-28 rounded-md opacity-50" />
            </div>
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>
        ))}
      </div>
    </IncidentGlassCard>
  );
}

/** Register row — ID / Control / Priority / Progress. */
function RegisterRowSkeleton() {
  return (
    <div className="border-ehs-border/45 flex items-center gap-4 border-b px-5 py-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="size-7 rounded-full" />
      </div>
      <Skeleton className="h-3 min-w-0 flex-1" />
      <Skeleton className="h-5 w-16 rounded-full" />
      <div className="flex w-36 flex-col gap-1.5">
        <Skeleton className="h-1.5 w-full rounded-full" />
        <Skeleton className="h-2 w-12" />
      </div>
    </div>
  );
}

/** Side detail panel placeholder. */
function DetailPanelSkeleton() {
  return (
    <IncidentGlassCard
      paddingClassName="p-0 overflow-hidden"
      className="min-w-0"
    >
      <div className="border-ehs-border-ink/8 border-b px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="mt-3 h-4 w-48" />
        <Skeleton className="mt-2 h-3 w-32 opacity-50" />
      </div>
      <div className="border-ehs-border-ink/8 border-b px-5 py-3.5">
        <div className="mb-2 flex items-center justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <div className="border-ehs-border-ink/8 grid grid-cols-2 gap-4 border-b px-5 py-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-1.5">
            <Skeleton className="h-2 w-12 opacity-50" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="px-5 py-4">
        <Skeleton className="mb-3 h-3 w-14" />
        <div className="flex justify-between gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <Skeleton className="size-6.5 rounded-full" />
              <Skeleton className="h-2 w-10" />
            </div>
          ))}
        </div>
      </div>
    </IncidentGlassCard>
  );
}

/**
 * CAPA dashboard body skeleton — Figma 4818:19414.
 * Mirrors live layout (KPIs, charts, footer cards, filters, register + panel).
 */
export function CapaDashboardSkeleton() {
  return (
    <div
      className="flex min-w-0 flex-col gap-4.5"
      aria-busy="true"
      aria-label="Loading CAPA dashboard"
    >
      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <CapaKpiCardSkeleton key={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 items-stretch gap-3.5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
        <LifecycleCardSkeleton />
        <OpenedClosedCardSkeleton />
      </div>

      <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-2">
        <WorkloadCardSkeleton />
        <PendingReviewsCardSkeleton />
      </div>

      <FiltersBarSkeleton />

      <div className="grid grid-cols-1 items-start gap-3.5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <IncidentGlassCard
          paddingClassName="p-0 overflow-hidden"
          className="max-w-full min-w-0"
        >
          <div className="overflow-x-auto">
            <div className="border-ehs-border/60 flex min-w-max items-center gap-4 border-b px-5 py-3.5 sm:min-w-0">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 min-w-0 flex-1" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
            {Array.from({ length: 6 }).map((_, index) => (
              <RegisterRowSkeleton key={index} />
            ))}
          </div>
        </IncidentGlassCard>
        <DetailPanelSkeleton />
      </div>
    </div>
  );
}

/**
 * Whole-route placeholder used by `app/dashboard/capa/loading.tsx`.
 * Header + dashboard body from Figma 4818:19414.
 */
export function CapaPageSkeleton() {
  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <header className="flex min-w-0 flex-col gap-3 px-3 py-4 sm:px-4 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-80 max-w-full rounded-md" />
          <Skeleton className="h-2.5 w-44 rounded-md opacity-60" />
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3 lg:ml-auto lg:justify-end">
          <Skeleton className="rounded-2.5 h-9 w-22" />
          <Skeleton className="rounded-2.5 bg-ehs-normal-blue/30 h-9 w-25" />
        </div>
      </header>

      <div className="flex min-w-0 flex-1 flex-col px-4 pb-8">
        <CapaDashboardSkeleton />
      </div>
    </div>
  );
}
