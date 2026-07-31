import { IncidentGlassCard } from "@/components/incidents";
import { Skeleton } from "@/components/ui/Skeleton";

/** One placeholder section card with its answerable rows. */
function SectionCardSkeleton(props: Readonly<{ rows: number }>) {
  const { rows } = props;

  return (
    <IncidentGlassCard paddingClassName="p-0 overflow-hidden" className="min-w-0">
      <header className="border-b border-white/90 bg-[rgba(238,241,246,0.7)] px-5 py-3">
        <Skeleton className="h-4 w-52" />
      </header>

      <ul className="flex flex-col">
        {Array.from({ length: rows }).map((_, index) => (
          <li
            key={index}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/10 px-5 py-4 last:border-b-0"
          >
            <Skeleton className="h-3 w-64" />
            <div className="flex shrink-0 items-center gap-2">
              {Array.from({ length: 4 }).map((_, answerIndex) => (
                <Skeleton
                  key={answerIndex}
                  className="h-7 w-16 rounded-[10px]"
                />
              ))}
            </div>
          </li>
        ))}
      </ul>
    </IncidentGlassCard>
  );
}

/**
 * Loading placeholder for the audit checklist — header, score summary and the
 * section cards, so the swap to real content doesn't shift the page around.
 */
export function AuditChecklistSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white px-6 py-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)]">
        <div className="flex min-w-0 flex-col gap-1.5">
          <Skeleton className="h-2.5 w-64" />
          <Skeleton className="h-6 w-52" />
          <Skeleton className="h-2.5 w-72" />
        </div>
      </div>

      {/* Score summary */}
      <IncidentGlassCard paddingClassName="px-5 py-4" className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-1.5 w-48 rounded-full" />
        </div>
      </IncidentGlassCard>

      <SectionCardSkeleton rows={4} />
      <SectionCardSkeleton rows={2} />

      <div className="flex">
        <Skeleton className="h-11 w-40 rounded-[10px]" />
      </div>
    </div>
  );
}
