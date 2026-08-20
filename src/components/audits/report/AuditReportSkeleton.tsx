import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Loading placeholder for the report body: the summary card (title, meta,
 * executive summary).
 */
export function AuditReportSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-3.5 xl:max-w-4xl">
      {/* Summary */}
      <IncidentGlassCard
        paddingClassName="p-6"
        incidentGlassCardClassName="gap-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex min-w-0 flex-col gap-1.5">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>

        <div className="bg-ehs-form-classes-bg/70 flex flex-col gap-2.5 rounded-xl p-4">
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-2.5 w-full" />
          <Skeleton className="h-2.5 w-full" />
          <Skeleton className="h-2.5 w-3/4" />
        </div>
      </IncidentGlassCard>
    </div>
  );
}
