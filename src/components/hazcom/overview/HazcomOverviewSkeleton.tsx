import { Skeleton } from "@/components/ui/Skeleton";
import { HazcomGlassCard } from "@/components/hazcom/shared";

const TAB_SKELETON_KEYS = [
  "overview",
  "chemicals",
  "sds",
  "training",
  "reports",
] as const;

const STAT_CARD_KEYS = [
  "total-chemicals",
  "missing-sds",
  "training-overdue",
  "sds-expiring-soon",
] as const;

const CHEMICAL_ROW_KEYS = ["c1", "c2", "c3", "c4"] as const;
const SDS_ROW_SKELETONS = [
  { key: "compliant", tone: "success" },
  { key: "expiring-90", tone: "muted" },
  { key: "overdue", tone: "danger" },
  { key: "missing", tone: "danger" },
] as const;
const TRAINING_ROW_KEYS = [
  "compliant",
  "due-soon",
  "overdue",
  "never-trained",
] as const;
const DEADLINE_ROW_KEYS = ["d1", "d2", "d3", "d4", "d5"] as const;

function HazcomOverviewHeaderSkeleton() {
  return (
    <div className="border-ehs-border bg-ehs-light-text flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-6 py-4">
      <div className="flex min-w-0 flex-col gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-56" />
      </div>
    </div>
  );
}

function HazcomOverviewTabsSkeleton() {
  return (
    <div
      className="border-ehs-border inline-flex max-w-full shrink-0 gap-1 self-start overflow-x-auto rounded-xl border bg-white/60 p-[5px]"
      aria-hidden="true"
    >
      {TAB_SKELETON_KEYS.map((key, index) => (
        <Skeleton
          key={key}
          className={[
            "h-8 w-28 rounded-[9px]",
            index === 0 ? "bg-ehs-normal-blue/30" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      ))}
    </div>
  );
}

function HazcomOverviewStatCardSkeleton() {
  return (
    <HazcomGlassCard paddingClassName="p-5" className="min-w-0">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="size-4.5 rounded" />
      </div>
      <Skeleton className="mt-3 h-8 w-16" />
      <Skeleton className="mt-3 h-3 w-20" />
    </HazcomGlassCard>
  );
}

function HazcomPanelHeaderSkeleton(props: Readonly<{ showLink?: boolean }>) {
  const { showLink = true } = props;

  return (
    <div className="flex items-center justify-between gap-3">
      <Skeleton className="h-4 w-44" />
      {showLink ? <Skeleton className="h-3 w-14" /> : null}
    </div>
  );
}

function HazcomChemicalRowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <Skeleton className="size-9 shrink-0 rounded-lg" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
    </div>
  );
}

function HazcomSdsRowSkeleton(
  props: Readonly<{ tone: "success" | "muted" | "danger" }>,
) {
  const { tone } = props;
  const barClassName =
    tone === "success"
      ? "bg-ehs-green/50"
      : tone === "danger"
        ? "bg-ehs-red/40"
        : "bg-ehs-gray/40";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-3 w-6" />
      </div>
      <div className="bg-ehs-dark-bg/8 relative h-1.5 overflow-hidden rounded-full">
        <div
          className={[
            "absolute top-0 left-0 h-full animate-pulse rounded-full",
            barClassName,
          ].join(" ")}
          style={{ width: tone === "success" ? "92%" : "10%" }}
        />
      </div>
    </div>
  );
}

function HazcomTrainingRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <span className="flex items-center gap-2">
        <Skeleton className="size-2 shrink-0 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </span>
      <Skeleton className="h-3 w-6" />
    </div>
  );
}

function HazcomDeadlineRowSkeleton() {
  return (
    <div className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton className="h-3.5 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-5 w-9 shrink-0 rounded-full" />
    </div>
  );
}

export type HazcomOverviewSkeletonProps = Readonly<{
  className?: string;
}>;

export function HazcomOverviewSkeleton(
  props: Readonly<HazcomOverviewSkeletonProps>,
) {
  const { className = "" } = props;

  return (
    <div
      className={[
        "flex min-h-screen flex-1 flex-col gap-5 px-4 py-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-busy="true"
      aria-label="Loading HazCom overview"
    >
      <HazcomOverviewHeaderSkeleton />
      <HazcomOverviewTabsSkeleton />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARD_KEYS.map((key) => (
          <HazcomOverviewStatCardSkeleton key={key} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <HazcomGlassCard paddingClassName="p-5" className="min-w-0">
          <HazcomPanelHeaderSkeleton />
          <div className="divide-ehs-border mt-4 flex flex-col divide-y">
            {CHEMICAL_ROW_KEYS.map((key) => (
              <HazcomChemicalRowSkeleton key={key} />
            ))}
          </div>
        </HazcomGlassCard>

        <HazcomGlassCard paddingClassName="p-5" className="min-w-0">
          <HazcomPanelHeaderSkeleton />
          <div className="mt-4 flex flex-col gap-3">
            {SDS_ROW_SKELETONS.map((row) => (
              <HazcomSdsRowSkeleton key={row.key} tone={row.tone} />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Skeleton className="h-9 rounded-lg" />
            <Skeleton className="h-9 rounded-lg" />
          </div>
        </HazcomGlassCard>

        <HazcomGlassCard paddingClassName="p-5" className="min-w-0">
          <HazcomPanelHeaderSkeleton />
          <div className="divide-ehs-border mt-4 flex flex-col divide-y">
            {TRAINING_ROW_KEYS.map((key) => (
              <HazcomTrainingRowSkeleton key={key} />
            ))}
          </div>
        </HazcomGlassCard>

        <HazcomGlassCard paddingClassName="p-5" className="min-w-0">
          <HazcomPanelHeaderSkeleton showLink={false} />
          <div className="divide-ehs-border mt-4 flex flex-col divide-y">
            {DEADLINE_ROW_KEYS.map((key) => (
              <HazcomDeadlineRowSkeleton key={key} />
            ))}
          </div>
        </HazcomGlassCard>
      </div>
    </div>
  );
}
