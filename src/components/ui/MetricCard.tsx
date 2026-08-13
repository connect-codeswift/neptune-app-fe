import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * The KPI card that sits at the top of every module page.
 *
 * One component, one layout: title, value + unit, then a footer row holding
 * either the target or a description on the left and the sparkline on the
 * right. Every module used to ship its own near-copy of this (KpiMetricCard,
 * StatMetricCard, IncidentListKpiCard, HazcomOverviewStatCard, the compliance
 * KPI grid), which is how they drifted apart on type scale, padding and colour
 * rules.
 */

export type MetricCardTone = "positive" | "negative" | "neutral";

/**
 * Which input decides red vs. green. `"target"` falls back to
 * `"isMorePositive"` when the card has no numeric `target`. It never touches
 * the arrow — that always follows the sign of the delta.
 */
export type MetricCardSignalOwner = "target" | "isMorePositive";

/**
 * The footer text is the target *or* a description, never both — they occupy
 * the same slot and read identically, so showing both would be two competing
 * captions under one number.
 */
type MetricCardFooterText =
  | Readonly<{ targetLabel: string; description?: never }>
  | Readonly<{ description: string; targetLabel?: never }>
  | Readonly<{ targetLabel?: never; description?: never }>;

export type MetricCardProps = Readonly<{
  /** Full form of the metric name, e.g. "Total Recordable Rate". */
  title: string;
  value: string | number;
  /** Unit shown next to the value, e.g. "TRIR", "%", "d". */
  unit?: string;
  /**
   * Sparkline series, oldest → newest. Used to derive the delta badge only
   * when `delta` is omitted.
   */
  trend?: readonly number[];
  /** Explicit delta. Takes precedence over `trend`. `null` means no badge. */
  delta?: number | null;
  /**
   * Weeks spanned by `delta`. 1 renders "vs last week"; larger renders
   * "vs N weeks ago". Omit to render the delta bare.
   */
  deltaWeeks?: number;
  /** Numeric target, for `signalOwnedBy: "target"`. */
  target?: number;
  /**
   * Whether an increase in this metric is good. Also sets target polarity:
   * when `false`, under target is green.
   */
  isMorePositive?: boolean;
  signalOwnedBy?: MetricCardSignalOwner;
  /** Badge icon used when there is no delta to show at all. */
  icon?: string;
  className?: string;
}> &
  MetricCardFooterText;

/**
 * `badge` is the filled delta pill; `icon` is the bare fallback glyph, which
 * needs a darker ink to read at the same weight without a pill behind it.
 */
const toneClasses: Record<
  MetricCardTone,
  { badge: string; icon: string; fill: string; stroke: string }
> = {
  positive: {
    badge: "bg-ehs-green/[0.14] text-ehs-green",
    icon: "text-ehs-green",
    fill: "fill-ehs-green/15",
    stroke: "stroke-ehs-green",
  },
  negative: {
    badge: "bg-ehs-red/[0.14] text-ehs-red",
    icon: "text-ehs-red",
    fill: "fill-ehs-red/15",
    stroke: "stroke-ehs-red",
  },
  neutral: {
    badge: "bg-ehs-muted-text/[0.14] text-ehs-muted-text",
    icon: "text-ehs-slate",
    fill: "fill-ehs-muted-text/15",
    stroke: "stroke-ehs-muted-text",
  },
};

const SPARKLINE_WIDTH = 70;
const SPARKLINE_HEIGHT = 22;
const SPARKLINE_PADDING = 2;

/** Finite series only — a single point can't be drawn or differenced. */
function usableTrend(
  trend: readonly number[] | undefined,
): readonly number[] | null {
  if (!trend) {
    return null;
  }

  const points = trend.filter((value) => Number.isFinite(value));
  return points.length >= 2 ? points : null;
}

/**
 * A leading number with optional thousands separators and a trailing unit —
 * "84", "1,204", "12.4d", "78%". Anchored, so a value that merely contains
 * digits ("2026-04-20", "—") yields nothing rather than a nonsense figure to
 * compare a target against.
 */
const LEADING_NUMBER = /^[+-]?\d[\d,]*(?:\.\d+)?/;

/**
 * The number the target comparison runs against. `value` is what the user
 * reads, so it wins; the last trend point covers values that carry no figure.
 */
function resolveCurrent(
  value: string | number,
  trend: readonly number[] | null,
): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const match = LEADING_NUMBER.exec(value.trim());
  if (match) {
    const parsed = Number(match[0].replace(/,/g, ""));
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return trend?.at(-1) ?? null;
}

/**
 * An explicit delta is authoritative — it comes from the API, which knows
 * things the series does not (e.g. that days-without-LTI resets to zero on
 * every incident). `null` means "no badge"; omit `delta` to derive from
 * the series (the default for modules that only pass `trend`).
 */
function resolveDelta(
  trend: readonly number[] | null,
  explicitDelta: number | null | undefined,
): number | null {
  if (explicitDelta != null && Number.isFinite(explicitDelta)) {
    return explicitDelta;
  }

  if (explicitDelta === null) {
    return null;
  }

  if (trend) {
    const first = trend[0];
    const last = trend.at(-1);
    if (first != null && last != null) {
      return last - first;
    }
  }

  return null;
}

function deltaPeriodLabel(deltaWeeks: number | undefined): string | undefined {
  if (deltaWeeks == null) {
    return undefined;
  }

  if (deltaWeeks === 1) {
    return "vs last week";
  }

  return `vs ${String(deltaWeeks)} weeks ago`;
}

function formatDelta(delta: number): string {
  const rounded = Number(delta.toFixed(1));
  if (rounded === 0) {
    return "0";
  }

  const magnitude = Math.abs(rounded);
  const text = Number.isInteger(rounded)
    ? String(magnitude)
    : magnitude.toFixed(1);

  return `${rounded > 0 ? "+" : "-"}${text}`;
}

function resolveTone(
  args: Readonly<{
    delta: number | null;
    current: number | null;
    target: number | undefined;
    isMorePositive: boolean;
    signalOwnedBy: MetricCardSignalOwner;
  }>,
): MetricCardTone {
  const { delta, current, target, isMorePositive, signalOwnedBy } = args;

  // Target ownership needs both sides of the comparison; without a target
  // there is nothing to be on or off, so the sign of the movement decides.
  if (signalOwnedBy === "target" && target != null && current != null) {
    const meetsTarget = isMorePositive ? current >= target : current <= target;
    return meetsTarget ? "positive" : "negative";
  }

  // No movement is neither an increase nor a decrease — colouring it green
  // would claim an improvement that didn't happen.
  if (delta == null || Number(delta.toFixed(1)) === 0) {
    return "neutral";
  }

  return delta > 0 === isMorePositive ? "positive" : "negative";
}

function deltaIcon(delta: number): string {
  const rounded = Number(delta.toFixed(1));
  if (rounded === 0) {
    return "mdi:trending-neutral";
  }
  return rounded > 0 ? "mdi:trending-up" : "mdi:trending-down";
}

function Sparkline(
  props: Readonly<{ data: readonly number[]; tone: MetricCardTone }>,
) {
  const { data, tone } = props;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x =
      SPARKLINE_PADDING +
      (index / (data.length - 1)) * (SPARKLINE_WIDTH - SPARKLINE_PADDING * 2);
    const y =
      SPARKLINE_HEIGHT -
      SPARKLINE_PADDING -
      ((value - min) / range) * (SPARKLINE_HEIGHT - SPARKLINE_PADDING * 2);

    return { x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const firstPoint = points[0];
  const lastPoint = points.at(-1);

  if (!firstPoint || !lastPoint) {
    return null;
  }

  const baseline = SPARKLINE_HEIGHT - SPARKLINE_PADDING;
  const areaPath = `${linePath} L ${lastPoint.x} ${baseline} L ${firstPoint.x} ${baseline} Z`;
  const { fill, stroke } = toneClasses[tone];

  return (
    <svg
      viewBox={`0 0 ${String(SPARKLINE_WIDTH)} ${String(SPARKLINE_HEIGHT)}`}
      className="h-5.5 w-17.5 shrink-0"
      aria-hidden="true"
    >
      <path d={areaPath} className={fill} />
      <path
        d={linePath}
        fill="none"
        className={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const badgeClass =
  "text8 inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.25 py-[2.5px] font-bold tracking-[0.22px]";

function valueTextClass(value: string | number): string {
  const classes = ["text2 text-ehs-dark-bg min-w-0 wrap-break-word"];
  if (typeof value === "string" && !LEADING_NUMBER.test(value.trim())) {
    classes.push("leading-7 tracking-normal");
  }
  return classes.join(" ");
}

function MetricBadge(
  props: Readonly<{
    delta: number | null;
    deltaWeeks: number | undefined;
    icon: string | undefined;
    tone: MetricCardTone;
  }>,
) {
  const { delta, deltaWeeks, icon, tone } = props;
  const periodLabel = deltaPeriodLabel(deltaWeeks);

  if (delta != null) {
    const deltaText = formatDelta(delta);
    const accessibleLabel = periodLabel
      ? `${deltaText} ${periodLabel}`
      : undefined;

    return (
      <span
        className={[badgeClass, toneClasses[tone].badge].join(" ")}
        title={periodLabel}
        aria-label={accessibleLabel}
      >
        <Icon
          icon={deltaIcon(delta)}
          className="size-2.75"
          aria-hidden="true"
        />
        {deltaText}
      </span>
    );
  }

  // Nothing moved that we know of — the icon keeps the card's top-right corner
  // occupied so a row of cards doesn't look ragged. It carries no pill: the
  // filled pill is what says "here is a number", and there is no number here.
  if (!icon) {
    return null;
  }

  return (
    <Icon
      icon={icon}
      className={["size-5 shrink-0", toneClasses[tone].icon].join(" ")}
      aria-hidden="true"
    />
  );
}

export function MetricCard(props: MetricCardProps) {
  const {
    title,
    value,
    unit,
    trend,
    delta: explicitDelta,
    deltaWeeks,
    target,
    isMorePositive = true,
    signalOwnedBy = "isMorePositive",
    icon,
    targetLabel,
    description,
    className = "",
  } = props;

  const series = usableTrend(trend);
  const current = resolveCurrent(value, series);
  const delta = resolveDelta(series, explicitDelta);
  const tone = resolveTone({
    delta,
    current,
    target,
    isMorePositive,
    signalOwnedBy,
  });

  const footerText = targetLabel ?? description;

  return (
    <GlassCard
      className={["h-full justify-between gap-3", className].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <Text as="p" className="text6 text-ehs-gray">
          {title}
        </Text>

        <MetricBadge
          delta={delta}
          deltaWeeks={deltaWeeks}
          icon={icon}
          tone={tone}
        />
      </div>

      <div className="flex min-w-0 items-baseline gap-1.5">
        <Text as="p" className={valueTextClass(value)}>
          {String(value)}
        </Text>
        {unit ? (
          <Text as="span" className="text8 text-ehs-gray font-semibold uppercase">
            {unit}
          </Text>
        ) : null}
      </div>

      <div className="mt-auto flex min-h-5.5 items-end justify-between gap-3">
        {footerText ? (
          <Text as="p" className="text8 text-ehs-muted-text min-w-0">
            {footerText}
          </Text>
        ) : (
          <span />
        )}
        {series ? <Sparkline data={series} tone={tone} /> : null}
      </div>
    </GlassCard>
  );
}

/**
 * One column on mobile, then as many as the row actually holds — a two-card
 * row shouldn't stretch to four columns and leave half the strip empty.
 */
function gridColumnsFor(count: number): string {
  if (count <= 2) {
    return "sm:grid-cols-2";
  }
  if (count === 3) {
    return "sm:grid-cols-2 lg:grid-cols-3";
  }
  return "sm:grid-cols-2 xl:grid-cols-4";
}

export type MetricCardsRowProps = Readonly<{
  metrics: readonly MetricCardProps[];
  className?: string;
}>;

/** The standard KPI strip every module page opens with. */
export function MetricCardsRow(props: MetricCardsRowProps) {
  const { metrics, className = "" } = props;

  return (
    <div
      className={[
        "stagger-cards grid min-w-0 grid-cols-1 gap-3.5",
        gridColumnsFor(metrics.length),
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {metrics.map((metric) => (
        <MetricCard key={metric.title} {...metric} />
      ))}
    </div>
  );
}

/** Building block for the row skeleton — every caller loads a whole row. */
function MetricCardSkeleton() {
  return (
    <GlassCard className="flex-1 justify-between">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="mt-px h-3.5 w-28" />
        <Skeleton className="h-5.25 w-14 rounded-full" />
      </div>

      <div className="flex items-baseline gap-2.5">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-3.5 w-8" />
      </div>

      <div className="flex items-end justify-between gap-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5.5 w-17.5 rounded-md" />
      </div>
    </GlassCard>
  );
}

/**
 * Staggered to match `MetricCardsRow`, so the loading row and the real row
 * settle in with the same rhythm rather than switching cadence.
 */
export function MetricCardsRowSkeleton(
  props: Readonly<{ count?: number; className?: string }>,
) {
  const { count = 4, className = "" } = props;

  return (
    <div
      className={[
        "stagger-cards grid min-w-0 grid-cols-1 gap-3.5",
        gridColumnsFor(count),
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {Array.from({ length: count }, (_, index) => (
        <MetricCardSkeleton key={`metric-skeleton-${String(index)}`} />
      ))}
    </div>
  );
}
