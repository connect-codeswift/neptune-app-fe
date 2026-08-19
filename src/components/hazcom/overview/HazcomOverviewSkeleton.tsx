import { MetricCardsRowSkeleton } from "@/components/ui/MetricCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";

const STAT_CARD_KEYS = [
  "total-chemicals",
  "missing-sds",
  "sds-expiring-soon",
  "training-sessions",
] as const;

const CHEMICAL_ROW_KEYS = ["c1", "c2", "c3", "c4"] as const;
const SDS_ROW_SKELETONS = [
  { key: "compliant", tone: "success" },
  { key: "expiring-90", tone: "muted" },
  { key: "overdue", tone: "danger" },
  { key: "missing", tone: "danger" },
] as const;

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
      <div className="bg-ehs-surface-inverse/8 relative h-1.5 overflow-hidden rounded-full">
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

export type HazcomOverviewSkeletonProps = Readonly<{
  className?: string;
}>;

/**
 * Holds the shape of the two overview regions that wait on a query — the KPI
 * row and the two data panels.
 *
 * It no longer draws a page header or its own tab row: the page renders the real
 * tabs above this, so those were a second, pill-shaped set beneath the real
 * underlined ones. The Training Compliance and Upcoming Deadlines skeletons are
 * gone too — those panels have no query to wait for, so they render their
 * unavailable state immediately.
 */
export function HazcomOverviewSkeleton(
  props: Readonly<HazcomOverviewSkeletonProps>,
) {
  const { className = "" } = props;

  return (
    <div
      className={["flex flex-col gap-4", className].filter(Boolean).join(" ")}
      aria-busy="true"
      aria-label="Loading HazCom overview"
    >
      <MetricCardsRowSkeleton count={STAT_CARD_KEYS.length} />

      <div className="grid gap-4 xl:grid-cols-2">
        <IncidentGlassCard paddingClassName="p-5" className="min-w-0">
          <HazcomPanelHeaderSkeleton />
          <div className="divide-ehs-border mt-4 flex flex-col divide-y">
            {CHEMICAL_ROW_KEYS.map((key) => (
              <HazcomChemicalRowSkeleton key={key} />
            ))}
          </div>
        </IncidentGlassCard>

        <IncidentGlassCard paddingClassName="p-5" className="min-w-0">
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
        </IncidentGlassCard>
      </div>
    </div>
  );
}
