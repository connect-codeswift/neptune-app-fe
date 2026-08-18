import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Loading placeholder for the template wizard: header, step progress, the
 * basic-info form and its preview sidebar.
 */
export function EditTemplateSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white px-6 py-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)]">
        <div className="flex min-w-0 flex-col gap-1.5">
          <Skeleton className="h-2.5 w-48" />
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-2.5 w-72" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* Step progress */}
      <IncidentGlassCard paddingClassName="px-5 py-4" className="min-w-0">
        <div className="flex flex-wrap items-center gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <Skeleton className="size-7 rounded-full" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          ))}
        </div>
      </IncidentGlassCard>

      {/* Form + preview */}
      <div className="grid min-w-0 items-start gap-3.5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <IncidentGlassCard
          paddingClassName="p-6"
          incidentGlassCardClassName="gap-5"
          className="min-w-0"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton className="h-2.5 w-32" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
          ))}
          <Skeleton className="rounded-2.5 h-28 w-full" />
        </IncidentGlassCard>

        <IncidentGlassCard
          paddingClassName="p-5"
          incidentGlassCardClassName="gap-3"
        >
          <Skeleton className="h-2.5 w-20" />
          <div className="flex flex-col gap-2 rounded-xl border border-slate-900/10 bg-white p-4">
            <Skeleton className="h-3.5 w-40" />
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-14 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
          </div>
        </IncidentGlassCard>
      </div>
    </div>
  );
}
