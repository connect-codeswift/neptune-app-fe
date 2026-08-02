import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { GlassCard } from "@/components/ui/GlassCard";

export type KpiMetricTone = "positive" | "negative";

export type KpiMetricCardCounts = Readonly<{
  closedLabel: string;
  closedValue: string | number;
  totalLabel: string;
  totalValue: string | number;
}>;

export type KpiMetricCardProps = Readonly<{
  title: string;
  value: string | number;
  unit: string;
  /** Short badge text, e.g. "-0.4" / "-85pp" — the live gap vs. `targetLabel`'s threshold, not a period-over-period delta (the API has no history). */
  trendValue: string;
  trendDirection: "up" | "down";
  /** Pill/sparkline color. */
  trendTone?: KpiMetricTone;
  /** Static target text shown bottom-left. Ignored when `counts` is set. */
  targetLabel?: string;
  /** Closed/total counts shown bottom-left instead of `targetLabel` — no sparkline alongside these. */
  counts?: KpiMetricCardCounts;
  /**
   * Sparkline points. Only the last point is real (today's API value) —
   * earlier points are a decorative lead-in, not real history, since this
   * API returns a single snapshot with no time series.
   */
  chartData?: readonly number[];
  className?: string;
}>;

const toneClasses: Record<
  KpiMetricTone,
  { pill: string; fill: string; stroke: string }
> = {
  positive: {
    pill: "bg-ehs-green/[0.14] text-ehs-green",
    fill: "fill-ehs-green/15",
    stroke: "stroke-ehs-green",
  },
  negative: {
    pill: "bg-ehs-red/[0.14] text-ehs-red",
    fill: "fill-ehs-red/15",
    stroke: "stroke-ehs-red",
  },
};

function MiniAreaChart(
  props: Readonly<{ data: readonly number[]; tone: KpiMetricTone }>,
) {
  const { data, tone } = props;
  const width = 70;
  const height = 22;
  const padding = 2;

  if (data.length < 2) {
    return null;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y =
      height - padding - ((value - min) / range) * (height - padding * 2);

    return { x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const lastPoint = points.at(-1);
  const firstPoint = points[0];

  if (!lastPoint || !firstPoint) {
    return null;
  }

  const areaPath = `${linePath} L ${lastPoint.x} ${height - padding} L ${firstPoint.x} ${height - padding} Z`;
  const { fill, stroke } = toneClasses[tone];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-[22px] w-[70px] shrink-0"
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

function CardFooter(
  props: Readonly<{ counts?: KpiMetricCardCounts; targetLabel?: string }>,
) {
  const { counts, targetLabel } = props;

  if (counts) {
    return <CountsFooter counts={counts} />;
  }
  if (targetLabel) {
    return (
      <Text as="p" className="text-ehs-muted-text text-[10.5px]">
        {targetLabel}
      </Text>
    );
  }
  return null;
}

function CountsFooter(props: Readonly<{ counts: KpiMetricCardCounts }>) {
  const { counts } = props;

  return (
    <div className="font-inter flex flex-col gap-0.5">
      <p className="text-ehs-muted-text text-[10.5px]">
        {counts.closedLabel}{" "}
        <span className="text-ehs-slate font-semibold">
          {counts.closedValue}
        </span>
      </p>
      <p className="text-ehs-muted-text text-[10.5px]">
        {counts.totalLabel}{" "}
        <span className="text-ehs-slate font-semibold">
          {counts.totalValue}
        </span>
      </p>
    </div>
  );
}

export function KpiMetricCard(props: Readonly<KpiMetricCardProps>) {
  const {
    title,
    value,
    unit,
    trendValue,
    trendDirection,
    trendTone = "positive",
    targetLabel,
    counts,
    chartData,
    className = "",
  } = props;

  const trendIcon =
    trendDirection === "up" ? "mdi:trending-up" : "mdi:trending-down";

  return (
    <GlassCard className={["flex-1 justify-between", className].join(" ")}>
      <div className="flex items-start justify-between gap-3">
        <Text
          as="p"
          className="text-ehs-gray text-[11.5px] leading-normal font-bold tracking-[0.23px] uppercase"
        >
          {title}
        </Text>

        <span
          className={[
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-[9px] py-[2.5px] text-[10.5px] leading-[15.4px] font-bold tracking-[0.22px]",
            toneClasses[trendTone].pill,
          ].join(" ")}
        >
          <Icon icon={trendIcon} className="size-[11px]" aria-hidden="true" />
          {trendValue}
        </span>
      </div>

      <div className="flex items-baseline gap-[10px]">
        <Text
          as="p"
          className="text-ehs-dark-bg text-[40px] leading-[40px] tracking-[-1.2px] tabular-nums"
        >
          {String(value)}
        </Text>
        <Text as="span" className="text-ehs-gray text-[12px] tracking-[0.48px]">
          {unit}
        </Text>
      </div>

      <div className="flex items-end justify-between gap-3">
        <CardFooter counts={counts} targetLabel={targetLabel} />
        {chartData ? <MiniAreaChart data={chartData} tone={trendTone} /> : null}
      </div>
    </GlassCard>
  );
}

export const DEFAULT_KPI_METRICS: readonly KpiMetricCardProps[] = [
  {
    title: "Total Recordable Rate",
    value: "2.3",
    unit: "TRIR",
    trendValue: "-0.4",
    trendDirection: "down",
    trendTone: "positive",
    targetLabel: "Target ≤ 2.5",
    chartData: [3.2, 2.9, 2.8, 2.6, 2.5, 2.4, 2.3],
  },
  {
    title: "Lost Time Injury Rate",
    value: "0.8",
    unit: "LTIR",
    trendValue: "-0.2",
    trendDirection: "down",
    trendTone: "negative",
    targetLabel: "Target ≤ 1.0",
    chartData: [1.2, 1.1, 1, 0.95, 0.9, 0.85, 0.8],
  },
  {
    title: "Safety Compliance",
    value: "78",
    unit: "%",
    trendValue: "+3pp",
    trendDirection: "up",
    trendTone: "positive",
    counts: {
      closedLabel: "Closed Compliances",
      closedValue: 200,
      totalLabel: "Total Compliances",
      totalValue: 493,
    },
  },
  {
    title: "Action Closure Rate",
    value: "84",
    unit: "%",
    trendValue: "+2pp",
    trendDirection: "up",
    trendTone: "positive",
    counts: {
      closedLabel: "Closed CAPAs",
      closedValue: 414,
      totalLabel: "Total CAPAs",
      totalValue: 493,
    },
  },
];

export type KpiMetricsRowProps = Readonly<{
  metrics?: readonly KpiMetricCardProps[];
  className?: string;
}>;

export function KpiMetricsRow(props: Readonly<KpiMetricsRowProps>) {
  const { metrics = DEFAULT_KPI_METRICS, className = "" } = props;

  return (
    <div
      className={["grid gap-[14px] sm:grid-cols-2 xl:grid-cols-4", className]
        .filter(Boolean)
        .join(" ")}
    >
      {metrics.map((metric) => (
        <KpiMetricCard key={metric.title} {...metric} />
      ))}
    </div>
  );
}
