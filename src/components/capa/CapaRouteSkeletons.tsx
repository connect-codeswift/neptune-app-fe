import type { ReactNode } from "react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Skeleton } from "@/components/ui/Skeleton";

const glassCardClass =
  "relative overflow-hidden rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white/62 shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_0px_rgba(15,23,42,0.14)] backdrop-blur-2.5 before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']";

function PageShell(
  props: Readonly<{
    title: string;
    children: ReactNode;
  }>,
) {
  return (
    <div
      className="flex min-h-screen min-w-0 flex-1 flex-col"
      aria-busy="true"
      aria-label={props.title}
    >
      <header className="flex min-w-0 flex-col gap-3 px-3 py-4 sm:px-4 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-4">
        <Skeleton className="h-7 w-44 max-w-full rounded-md" />
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3 lg:ml-auto lg:justify-end">
          <Skeleton className="h-10 w-full max-w-72 rounded-lg sm:w-72" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </header>
      {props.children}
    </div>
  );
}

function DetailHeaderSkeleton() {
  return (
    <div className={glassCardClass}>
      <div className="relative z-1 flex flex-col gap-3 px-4 pt-3.5 pb-4 sm:px-5.5">
        <Skeleton className="hidden h-3 w-48 rounded-md md:block" />
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Skeleton className="rounded-2.5 size-8 shrink-0 md:hidden" />
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-7 w-28 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>
              <Skeleton className="h-4 w-40 max-w-full rounded-md opacity-60" />
            </div>
          </div>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
            <Skeleton className="rounded-2.5 h-9 w-20" />
            <Skeleton className="rounded-2.5 h-9 w-32 bg-[#0891a6]/25" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressCardSkeleton() {
  return (
    <IncidentGlassCard paddingClassName="p-5" className="min-w-0 rounded-2xl">
      <div className="-mx-1 mb-5 overflow-x-auto px-1">
        <div className="flex min-w-max items-start gap-2 sm:w-full sm:min-w-0">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex min-w-16 flex-1 flex-col items-center gap-2"
            >
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-3 w-12 rounded-md" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-14 shrink-0 rounded-md" />
        <Skeleton className="h-2.5 min-w-0 flex-1 rounded-full" />
        <Skeleton className="h-4 w-10 shrink-0 rounded-md" />
      </div>
    </IncidentGlassCard>
  );
}

function SidebarSkeleton() {
  return (
    <IncidentGlassCard
      paddingClassName="p-5.25"
      className="min-w-0 rounded-2xl"
    >
      <Skeleton className="mb-4 h-4 w-28 rounded-md" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex items-start justify-between gap-3">
            <Skeleton className="h-4 w-16 rounded-md opacity-60" />
            <Skeleton className="h-4 w-24 rounded-md" />
          </div>
        ))}
      </div>
    </IncidentGlassCard>
  );
}

function TabsPanelSkeleton() {
  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex gap-0 overflow-x-auto border-b border-white/90">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            key={index}
            className="mx-2 my-2.5 h-6 w-20 shrink-0 rounded-md"
          />
        ))}
      </div>
      <div
        className={`${glassCardClass} rounded-tr-3.5 rounded-br-3.5 rounded-bl-3.5 rounded-tl-none`}
      >
        <div className="relative z-1 flex flex-col gap-4 px-5.25 pt-5.25 pb-5">
          <Skeleton className="h-3 w-24 rounded-md" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-3 w-28 rounded-md" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-3 w-32 rounded-md" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/** CAPA detail body skeleton (also used while client queries load). */
export function CapaDetailSkeleton() {
  return (
    <div
      className="flex min-w-0 flex-col gap-3.5 px-4 pb-8"
      aria-busy="true"
      aria-label="Loading CAPA detail"
    >
      <DetailHeaderSkeleton />
      <ProgressCardSkeleton />
      <div className="grid grid-cols-1 items-start gap-3.5 xl:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]">
        <TabsPanelSkeleton />
        <SidebarSkeleton />
      </div>
    </div>
  );
}

/** Whole-route CAPA detail placeholder. */
export function CapaDetailPageSkeleton() {
  return (
    <PageShell title="Loading CAPA detail">
      <CapaDetailSkeleton />
    </PageShell>
  );
}

/** CAPA verification body skeleton. */
export function CapaVerificationSkeleton() {
  return (
    <div
      className="flex min-w-0 flex-col gap-5 px-4 pb-8"
      aria-busy="true"
      aria-label="Loading CAPA verification"
    >
      <DetailHeaderSkeleton />
      <div className={`${glassCardClass} px-5.25 pt-5.25 pb-5`}>
        <div className="relative z-1 flex flex-col gap-3">
          <Skeleton className="h-5 w-48 rounded-md" />
          <Skeleton className="h-4 w-full max-w-xl rounded-md opacity-60" />
          <Skeleton className="mt-2 h-4 w-40 rounded-md" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-4 w-36 rounded-md" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <div className="mt-2 flex flex-wrap justify-end gap-2">
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-10 w-40 rounded-xl bg-[#10b981]/25" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Whole-route CAPA verification placeholder. */
export function CapaVerificationPageSkeleton() {
  return (
    <PageShell title="Loading CAPA verification">
      <CapaVerificationSkeleton />
    </PageShell>
  );
}

/** CAPA RCA body skeleton. */
export function CapaRcaSkeleton() {
  return (
    <div
      className="flex min-w-0 flex-col gap-4 px-4 pb-8"
      aria-busy="true"
      aria-label="Loading RCA"
    >
      <div className={glassCardClass}>
        <div className="relative z-1 flex flex-col">
          <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-5 sm:px-6">
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
              <Skeleton className="rounded-2.5 size-8 shrink-0 md:hidden" />
              <Skeleton className="rounded-3.25 size-11.5 shrink-0" />
              <div className="flex min-w-0 flex-col gap-2">
                <Skeleton className="h-3 w-40 rounded-md" />
                <Skeleton className="h-6 w-56 max-w-full rounded-md sm:w-80" />
              </div>
            </div>
            <div className="flex w-full flex-wrap items-center gap-4 sm:w-auto sm:gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex flex-col items-center gap-1">
                  <Skeleton className="h-7 w-8 rounded-md" />
                  <Skeleton className="h-3 w-16 rounded-md opacity-60" />
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 border-t border-[rgba(15,23,42,0.08)] md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex gap-3 px-4 py-4 sm:px-6">
                <Skeleton className="size-9 shrink-0 rounded-lg" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Skeleton className="h-3 w-20 rounded-md opacity-60" />
                  <Skeleton className="h-4 w-28 rounded-md" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-3 border-t border-[rgba(15,23,42,0.08)] px-4 py-4 sm:px-6">
            <Skeleton className="size-9 shrink-0 rounded-lg" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className="h-3 w-32 rounded-md opacity-60" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      <Skeleton className="h-4 w-full max-w-xl rounded-md opacity-50" />

      <div className={`${glassCardClass} max-w-full overflow-x-auto`}>
        <div className="relative z-1 min-w-max p-4 md:min-w-275">
          <div className="mb-3 flex gap-2.5">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-36 shrink-0 rounded-md" />
            ))}
          </div>
          {Array.from({ length: 4 }).map((_, row) => (
            <div key={row} className="mb-3 flex gap-2.5">
              {Array.from({ length: 8 }).map((_, col) => (
                <Skeleton key={col} className="h-24 w-36 shrink-0 rounded-xl" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Whole-route CAPA RCA placeholder. */
export function CapaRcaPageSkeleton() {
  return (
    <PageShell title="Loading Root Cause Analysis">
      <CapaRcaSkeleton />
    </PageShell>
  );
}

/** Create CAPA body skeleton. */
export function CapaCreateSkeleton() {
  return (
    <div
      className="flex min-w-0 flex-col gap-3.5 px-4 pb-8"
      aria-busy="true"
      aria-label="Loading create CAPA"
    >
      <DetailHeaderSkeleton />
      <IncidentGlassCard
        paddingClassName="p-0 overflow-hidden"
        className="min-w-0"
      >
        <div className="flex flex-col gap-8 px-6 pt-8 pb-6 md:flex-row md:items-start md:gap-12 md:px-8">
          <section className="w-full shrink-0 md:w-85 lg:w-98">
            <Skeleton className="mb-2 h-5 w-40 rounded-md" />
            <Skeleton className="mb-6 h-4 w-56 max-w-full rounded-md opacity-60" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          </section>
          <section className="min-w-0 flex-1">
            <Skeleton className="mb-6 h-5 w-48 rounded-md" />
            <div className="flex flex-col gap-4">
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          </section>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#cfd6d9] px-6 py-5 md:px-8">
          <Skeleton className="h-4 w-40 rounded-md opacity-50" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl bg-[#0891a6]/25" />
          </div>
        </div>
      </IncidentGlassCard>
    </div>
  );
}

/** Whole-route create CAPA placeholder. */
export function CapaCreatePageSkeleton() {
  return (
    <PageShell title="Loading create CAPA">
      <CapaCreateSkeleton />
    </PageShell>
  );
}

/** My CAPAs body skeleton. */
export function CapaMineSkeleton() {
  return (
    <div
      className="flex min-w-0 flex-col gap-6 px-4 pb-8"
      aria-busy="true"
      aria-label="Loading My CAPAs"
    >
      <DetailHeaderSkeleton />
      <div className="grid grid-cols-1 items-stretch gap-3.5 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <IncidentGlassCard
            key={index}
            paddingClassName="p-4.25"
            className="min-h-37.25 min-w-0 rounded-2xl"
          >
            <Skeleton className="mb-3 h-4 w-32 rounded-md" />
            <div className="flex flex-col gap-2.5">
              {Array.from({ length: 3 }).map((_, row) => (
                <Skeleton key={row} className="rounded-2.5 h-16 w-full" />
              ))}
            </div>
          </IncidentGlassCard>
        ))}
      </div>
    </div>
  );
}

/** Whole-route My CAPAs placeholder. */
export function CapaMinePageSkeleton() {
  return (
    <PageShell title="Loading My CAPAs">
      <CapaMineSkeleton />
    </PageShell>
  );
}
