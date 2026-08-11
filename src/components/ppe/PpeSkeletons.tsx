import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Skeleton } from "@/components/ui/Skeleton";

function repeat(count: number, render: (index: number) => React.ReactNode) {
  return Array.from({ length: count }, (_, index) => render(index));
}

function PpeGlassShell(
  props: Readonly<{
    children: React.ReactNode;
    className?: string;
    paddingClassName?: string;
  }>,
) {
  const { children, className = "", paddingClassName = "p-4" } = props;

  return (
    <IncidentGlassCard
      paddingClassName={paddingClassName}
      className={["min-w-0", className].filter(Boolean).join(" ")}
    >
      {children}
    </IncidentGlassCard>
  );
}

/** Page breadcrumb + title bar placeholder. */
export function PpePageHeaderSkeleton(props: Readonly<{ actions?: number }>) {
  const { actions = 2 } = props;

  return (
    <PpeGlassShell paddingClassName="px-4 py-4 md:px-[22px]">
      <div className="flex flex-col gap-3">
        <div className="hidden items-center gap-1.5 md:flex">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="size-3 rounded-full" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="size-3 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Skeleton className="size-8 shrink-0 rounded-[10px] md:hidden" />
            <div className="flex min-w-0 flex-col gap-1.5">
              <Skeleton className="h-6 w-44 max-w-full md:h-7 md:w-56" />
              <Skeleton className="hidden h-3 w-64 max-w-full md:block" />
            </div>
          </div>
          <div className="flex w-full shrink-0 flex-wrap gap-2.5 sm:w-auto">
            {repeat(actions, (index) => (
              <Skeleton
                key={`ppe-header-action-${String(index)}`}
                className="h-10 flex-1 rounded-[10px] sm:w-28 sm:flex-none"
              />
            ))}
          </div>
        </div>
      </div>
    </PpeGlassShell>
  );
}

/** Two KPI metric cards — matches PPE management overview. */
export function PpeMetricsSkeleton() {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
      {repeat(2, (index) => (
        <PpeGlassShell key={`ppe-kpi-${String(index)}`}>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-3 w-24 sm:w-28" />
            <Skeleton className="h-8 w-14 sm:h-9 sm:w-16" />
          </div>
        </PpeGlassShell>
      ))}
    </div>
  );
}

/** Search bar placeholder. */
export function PpeSearchBarSkeleton() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Skeleton className="h-11 w-full max-w-md rounded-xl" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

/** Mobile inventory card placeholders. */
export function PpeInventoryCardsSkeleton(props: Readonly<{ rows?: number }>) {
  const { rows = 4 } = props;

  return (
    <div className="flex flex-col gap-3 md:hidden">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Skeleton className="h-9 w-28 rounded-xl" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-24 rounded-[10px]" />
          <Skeleton className="h-9 w-40 rounded-[10px]" />
          <Skeleton className="h-9 w-28 rounded-[10px]" />
        </div>
      </div>
      <ul className="flex flex-col gap-3">
        {repeat(rows, (index) => (
          <li key={`ppe-inv-card-${String(index)}`}>
            <div className="border-ehs-border flex flex-col gap-3 rounded-xl border bg-white p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <Skeleton className="h-4 w-[70%]" />
                  <Skeleton className="h-3 w-[45%]" />
                </div>
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
              <div className="flex gap-6">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Desktop inventory / issuance table placeholder. */
export function PpeTableSkeleton(
  props: Readonly<{ rows?: number; columns?: number }>,
) {
  const { rows = 6, columns = 6 } = props;

  return (
    <PpeGlassShell
      paddingClassName="overflow-hidden p-0"
      className="hidden md:block"
    >
      <div className="border-b border-[rgba(15,23,42,0.08)] px-4 py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-9 w-40 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-[10px]" />
        </div>
      </div>
      <div className="border-b border-[rgba(15,23,42,0.06)] px-4 py-3">
        <div className="flex gap-4">
          {repeat(columns, (index) => (
            <Skeleton key={`ppe-th-${String(index)}`} className="h-3 flex-1" />
          ))}
        </div>
      </div>
      <div className="flex flex-col">
        {repeat(rows, (rowIndex) => (
          <div
            key={`ppe-tr-${String(rowIndex)}`}
            className="flex gap-4 border-b border-[rgba(15,23,42,0.05)] px-4 py-3.5 last:border-b-0"
          >
            {repeat(columns, (cellIndex) => (
              <Skeleton
                key={`ppe-td-${String(rowIndex)}-${String(cellIndex)}`}
                className="h-3.5 flex-1"
              />
            ))}
          </div>
        ))}
      </div>
    </PpeGlassShell>
  );
}

/** Full PPE management page skeleton (KPIs + inventory). */
export function PpeManagementPageSkeleton() {
  return (
    <div
      className="flex flex-1 flex-col gap-4.5 px-4 pb-8"
      aria-busy="true"
      aria-label="Loading PPE management"
    >
      <PpeMetricsSkeleton />
      <div className="flex min-w-0 flex-col gap-3.5">
        <PpeSearchBarSkeleton />
        <PpeInventoryCardsSkeleton />
        <PpeTableSkeleton rows={7} columns={6} />
      </div>
    </div>
  );
}

/** Catalog detail page skeleton. */
export function PpeCatalogDetailSkeleton() {
  return (
    <div
      className="flex flex-1 flex-col gap-3.5 px-4 pb-8"
      aria-busy="true"
      aria-label="Loading catalog item"
    >
      <PpePageHeaderSkeleton actions={1} />
      <Skeleton className="h-12 w-full rounded-xl md:hidden" />
      <div className="grid min-w-0 gap-3.5 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-3.5">
          <PpeGlassShell paddingClassName="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Skeleton className="h-5 w-[70%] md:h-6" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-16 w-full rounded-xl" />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {repeat(6, (index) => (
                  <div
                    key={`ppe-meta-${String(index)}`}
                    className="flex flex-col gap-1.5 rounded-[10px] bg-[rgba(15,23,42,0.04)] px-3 py-2.5"
                  >
                    <Skeleton className="h-2.5 w-16" />
                    <Skeleton className="h-3.5 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </PpeGlassShell>

          <div className="lg:hidden">
            <PpeGlassShell>
              <div className="flex flex-col gap-3.5">
                <Skeleton className="h-4 w-24" />
                <div className="grid grid-cols-2 gap-2.5">
                  {repeat(4, (index) => (
                    <div
                      key={`ppe-inv-stat-${String(index)}`}
                      className="flex flex-col gap-2 rounded-lg bg-[#f8fafc] p-3"
                    >
                      <Skeleton className="h-7 w-12" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </PpeGlassShell>
          </div>

          <div className="flex flex-col gap-2 md:hidden">
            <Skeleton className="h-4 w-40" />
            {repeat(3, (index) => (
              <div
                key={`ppe-issue-card-${String(index)}`}
                className="border-ehs-border flex flex-col gap-3 rounded-2xl border bg-white p-4"
              >
                <div className="flex justify-between gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-14 rounded-md" />
                </div>
                <Skeleton className="h-px w-full" />
                <div className="flex gap-8">
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-8 w-12" />
                </div>
              </div>
            ))}
          </div>

          <PpeTableSkeleton rows={4} columns={5} />
        </div>

        <div className="hidden lg:block">
          <PpeGlassShell>
            <div className="flex flex-col gap-3.5">
              <Skeleton className="h-4 w-24" />
              <div className="grid grid-cols-2 gap-2.5">
                {repeat(4, (index) => (
                  <div
                    key={`ppe-side-stat-${String(index)}`}
                    className="flex flex-col items-center gap-1 rounded-[10px] bg-[rgba(15,23,42,0.04)] px-2.5 py-2.5"
                  >
                    <Skeleton className="h-5 w-10" />
                    <Skeleton className="h-3 w-14" />
                  </div>
                ))}
              </div>
            </div>
          </PpeGlassShell>
        </div>
      </div>
    </div>
  );
}

/** Employee / issue profile page skeleton. */
export function PpeEmployeeProfileSkeleton() {
  return (
    <div
      className="flex flex-1 flex-col gap-3.5 px-4 pb-8"
      aria-busy="true"
      aria-label="Loading PPE profile"
    >
      <PpePageHeaderSkeleton actions={2} />
      <div className="grid grid-cols-2 gap-3 md:hidden">
        <Skeleton className="h-11 rounded-[10px]" />
        <Skeleton className="h-11 rounded-[10px]" />
      </div>
      <div className="flex w-full max-w-182.75 flex-col gap-3.5">
        <PpeGlassShell>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3 md:gap-4">
              <Skeleton className="md:rounded-3.5 size-12 shrink-0 rounded-full md:size-13" />
              <div className="flex min-w-0 flex-col gap-1.5">
                <Skeleton className="h-4 w-40 md:h-5 md:w-48" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-10" />
            </div>
          </div>
        </PpeGlassShell>

        <div className="flex flex-col gap-2.5 md:hidden">
          <Skeleton className="h-3 w-28" />
          {repeat(2, (index) => (
            <div
              key={`ppe-active-card-${String(index)}`}
              className="border-ehs-border flex flex-col gap-3 rounded-xl border bg-white p-3.5"
            >
              <Skeleton className="h-3.5 w-[60%]" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-px w-full" />
              <Skeleton className="h-6 w-16 rounded-md" />
            </div>
          ))}
        </div>

        <PpeGlassShell
          paddingClassName="overflow-hidden p-0"
          className="hidden md:block"
        >
          <div className="border-b border-[rgba(15,23,42,0.08)] px-4.5 py-3.5">
            <Skeleton className="h-4 w-32" />
          </div>
          {repeat(3, (index) => (
            <div
              key={`ppe-active-row-${String(index)}`}
              className="flex items-center justify-between gap-3 border-b border-[rgba(15,23,42,0.08)] px-[18px] py-3.5 last:border-b-0"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Skeleton className="h-4 w-[55%]" />
                <Skeleton className="h-3 w-[75%]" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </PpeGlassShell>

        <div className="flex flex-col gap-2.5 md:hidden">
          <Skeleton className="h-3 w-36" />
          {repeat(2, (index) => (
            <div
              key={`ppe-hist-card-${String(index)}`}
              className="border-ehs-border flex flex-col gap-3 rounded-[10px] border bg-white p-3.5"
            >
              <div className="flex justify-between gap-3">
                <Skeleton className="h-3.5 w-[50%]" />
                <Skeleton className="h-5 w-14 rounded-md" />
              </div>
              <Skeleton className="h-px w-full" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>

        <PpeTableSkeleton rows={4} columns={5} />
      </div>
    </div>
  );
}

/** Issuance log page skeleton (header is already rendered above). */
export function PpeIssuanceLogSkeleton() {
  return (
    <div
      className="flex flex-col gap-3.5"
      aria-busy="true"
      aria-label="Loading issuance log"
    >
      <PpeSearchBarSkeleton />
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 md:hidden">
        {repeat(3, (index) => (
          <Skeleton
            key={`ppe-chip-${String(index)}`}
            className="h-8 w-20 shrink-0 rounded-[20px]"
          />
        ))}
      </div>
      <ul className="flex flex-col gap-3 md:hidden">
        {repeat(4, (index) => (
          <li key={`ppe-log-card-${String(index)}`}>
            <div className="border-ehs-border flex flex-col gap-3 rounded-xl border bg-white p-3.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-3.5 flex-1" />
                <Skeleton className="h-5 w-14 rounded-md" />
              </div>
              <Skeleton className="h-3.5 w-[60%]" />
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-px w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-14" />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <PpeTableSkeleton rows={6} columns={8} />
    </div>
  );
}

/** Issue / replacement form page skeleton. */
export function PpeFormPageSkeleton(props: Readonly<{ fields?: number }>) {
  const { fields = 6 } = props;

  return (
    <div
      className="flex flex-1 flex-col gap-3.5 px-4 pb-8"
      aria-busy="true"
      aria-label="Loading form"
    >
      <PpePageHeaderSkeleton actions={2} />
      <PpeGlassShell paddingClassName="p-4 md:p-6">
        <div className="flex flex-col gap-5">
          <Skeleton className="h-4 w-40" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {repeat(fields, (index) => (
              <div
                key={`ppe-field-${String(index)}`}
                className="flex flex-col gap-2"
              >
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-11 w-full rounded-[10px]" />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2.5 pt-2">
            <Skeleton className="h-10 w-24 rounded-[10px]" />
            <Skeleton className="h-10 w-36 rounded-[10px]" />
          </div>
        </div>
      </PpeGlassShell>
    </div>
  );
}
