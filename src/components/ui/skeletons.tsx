import { MetricCardsRowSkeleton } from "@/components/ui/MetricCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Composable loading placeholders.
 *
 * Every page-level load state in the app should use these rather than a
 * centred spinner: a spinner throws away the layout, so the page collapses to
 * one small box and then snaps back to full size when data lands. These hold
 * the real shape, so content just fades in where the grey blocks were.
 *
 * Reach for a spinner only for *actions* whose duration the user initiated —
 * uploads, PDF rendering, form submits — where there's no layout to preserve.
 */

/** Repeats `render` n times with stable keys. */
function repeat(count: number, render: (index: number) => React.ReactNode) {
  return Array.from({ length: count }, (_, index) => render(index));
}

/** Card title + optional subtitle, matching CardHeading. */
function SkeletonCardHeading(props: Readonly<{ action?: boolean }>) {
  const { action = true } = props;

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-col gap-0.5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-2.5 w-28" />
      </div>
      {action ? <Skeleton className="rounded-2.5 h-6 w-16" /> : null}
    </div>
  );
}

/** A row of stat cards — the shape most "Loading KPIs" spinners replaced. */
export function SkeletonKpiRow(props: Readonly<{ count?: number }>) {
  const { count = 4 } = props;

  return <MetricCardsRowSkeleton count={count} />;
}

/** Filter toolbar with n segmented-control groups. */
function SkeletonFilterBar(props: Readonly<{ groups?: number }>) {
  const { groups = 3 } = props;

  return (
    <div className="relative flex w-full min-w-0 flex-wrap items-center gap-x-5 gap-y-3.5 rounded-2xl border border-white/80 bg-white/60 p-3 shadow-sm backdrop-blur-md sm:px-4 sm:py-3.5">
      <Skeleton className="h-8 w-20 shrink-0 rounded-lg" />
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-3">
        {repeat(groups, (index) => (
          <div
            key={`skeleton-filter-${String(index)}`}
            className="flex min-w-fit flex-1 items-center gap-2.5"
          >
            <Skeleton className="h-3 w-14 shrink-0" />
            <Skeleton className="h-9 min-w-40 flex-1 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Data table: header strip plus body rows, inside a card. */
export function SkeletonTable(
  props: Readonly<{ rows?: number; columns?: number; className?: string }>,
) {
  const { rows = 8, columns = 6, className = "" } = props;

  return (
    <GlassCard className={["gap-0 p-0", className].filter(Boolean).join(" ")}>
      <div className="border-ehs-border/60 flex items-center gap-4 border-b px-5 py-3.5">
        {repeat(columns, (index) => (
          <Skeleton
            key={`skeleton-th-${String(index)}`}
            className="h-3 flex-1"
          />
        ))}
      </div>
      {repeat(rows, (rowIndex) => (
        <div
          key={`skeleton-tr-${String(rowIndex)}`}
          className="border-ehs-border/40 flex items-center gap-4 border-b px-5 py-4 last:border-b-0"
        >
          {repeat(columns, (cellIndex) => (
            <Skeleton
              key={`skeleton-td-${String(rowIndex)}-${String(cellIndex)}`}
              className="h-3.5 flex-1"
            />
          ))}
        </div>
      ))}
    </GlassCard>
  );
}

/** Title + meta + badge rows, for feed / list cards. */
export function SkeletonListRows(props: Readonly<{ rows?: number }>) {
  const { rows = 5 } = props;

  return (
    <div className="flex flex-col gap-3.5">
      {repeat(rows, (index) => (
        <div
          key={`skeleton-list-${String(index)}`}
          className="flex items-start justify-between gap-3"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-[70%]" />
            <Skeleton className="h-2.5 w-[45%]" />
          </div>
          <Skeleton className="h-5.5 w-11 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** Label / value pairs, for detail summary panels and read-only forms. */
function SkeletonFieldGrid(
  props: Readonly<{ fields?: number; columns?: 1 | 2 | 3 }>,
) {
  const { fields = 6, columns = 2 } = props;
  const gridClass =
    columns === 1
      ? "grid-cols-1"
      : columns === 3
        ? "sm:grid-cols-3"
        : "sm:grid-cols-2";

  return (
    <div className={`grid grid-cols-1 gap-x-6 gap-y-4 ${gridClass}`}>
      {repeat(fields, (index) => (
        <div
          key={`skeleton-field-${String(index)}`}
          className="flex flex-col gap-1.5"
        >
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="h-4 w-[70%]" />
        </div>
      ))}
    </div>
  );
}

/**
 * Record detail: a banner, a wide details card, and a narrower side column.
 * Covers the incident / hazard / near-miss / document detail screens.
 */
export function SkeletonDetailPage(props: Readonly<{ className?: string }>) {
  const { className = "" } = props;

  return (
    <div
      className={["flex min-w-0 flex-col gap-3.5", className]
        .filter(Boolean)
        .join(" ")}
    >
      <GlassCard className="gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-2">
            <Skeleton className="h-6 w-72 max-w-full" />
            <Skeleton className="h-3 w-52 max-w-full" />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
        </div>
      </GlassCard>

      <div className="grid min-w-0 items-start gap-3.5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-3.5">
          <GlassCard>
            <SkeletonCardHeading action={false} />
            <div className="mt-2">
              <SkeletonFieldGrid fields={6} />
            </div>
          </GlassCard>
          <GlassCard>
            <SkeletonCardHeading action={false} />
            <div className="mt-2 flex flex-col gap-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-[92%]" />
              <Skeleton className="h-3 w-[78%]" />
            </div>
          </GlassCard>
        </div>

        <div className="flex min-w-0 flex-col gap-3.5">
          <GlassCard>
            <SkeletonCardHeading />
            <div className="mt-2">
              <SkeletonListRows rows={4} />
            </div>
          </GlassCard>
          <GlassCard>
            <SkeletonCardHeading />
            <div className="mt-2">
              <SkeletonListRows rows={3} />
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

/** Cell grid for the hazard / near-miss heatmaps. */
export function SkeletonHeatmapGrid(
  props: Readonly<{ rows?: number; columns?: number }>,
) {
  const { rows = 5, columns = 6 } = props;

  return (
    <div className="flex flex-col gap-1.5">
      {repeat(rows, (rowIndex) => (
        <div
          key={`skeleton-heat-row-${String(rowIndex)}`}
          className="flex items-center gap-1.5"
        >
          <Skeleton className="h-3 w-16 shrink-0" />
          {repeat(columns, (cellIndex) => (
            <Skeleton
              key={`skeleton-heat-${String(rowIndex)}-${String(cellIndex)}`}
              className="h-8 flex-1 rounded-md"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * The narrow preview column beside a list — the incident and document screens
 * both put a selected-record panel there.
 */
export function SkeletonSidePanel() {
  return (
    <GlassCard className="gap-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-[70%]" />
        <Skeleton className="h-3 w-[45%]" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <SkeletonFieldGrid fields={4} columns={1} />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-[88%]" />
        <Skeleton className="h-3 w-[64%]" />
      </div>
    </GlassCard>
  );
}

/** Page heading strip: title, subtitle and header controls. */
/** List screen: stat row, filters, table. */
export function SkeletonListPage(
  props: Readonly<{
    kpis?: number;
    filters?: number;
    rows?: number;
    columns?: number;
  }>,
) {
  const { kpis = 4, filters = 3, rows = 8, columns = 6 } = props;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <SkeletonKpiRow count={kpis} />
      <SkeletonFilterBar groups={filters} />
      <SkeletonTable rows={rows} columns={columns} />
    </div>
  );
}

/** Editable form screen: a card of labelled inputs plus footer actions. */
export function SkeletonFormPage(props: Readonly<{ fields?: number }>) {
  const { fields = 8 } = props;

  return (
    <div className="flex min-w-0 flex-col gap-3.5">
      <GlassCard className="gap-4">
        <SkeletonCardHeading action={false} />
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          {repeat(fields, (index) => (
            <div
              key={`skeleton-input-${String(index)}`}
              className="flex flex-col gap-1.5"
            >
              <Skeleton className="h-2.5 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </GlassCard>
    </div>
  );
}
