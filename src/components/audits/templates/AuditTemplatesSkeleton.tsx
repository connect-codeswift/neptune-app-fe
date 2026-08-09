import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Skeleton } from "@/components/ui/Skeleton";

/** One placeholder template card: counts, title, meta, and the Use button. */
function TemplateCardSkeleton() {
  return (
    <IncidentGlassCard
      paddingClassName="p-5"
      className="min-w-0 bg-white!"
      incidentGlassCardClassName="gap-3"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <Skeleton className="h-2.5 w-32" />
        <Skeleton className="size-5 rounded" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-2.5 w-36" />
      </div>

      <Skeleton className="h-2.5 w-28" />
      <Skeleton className="mt-1 h-10 w-full rounded-xl" />
    </IncidentGlassCard>
  );
}

/** Grid of placeholder cards while the template list loads. */
export function AuditTemplatesSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <TemplateCardSkeleton key={index} />
      ))}
    </div>
  );
}
