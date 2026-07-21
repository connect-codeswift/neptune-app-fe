import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";

export type KpiMetricCardProps = Readonly<{
  title: string;
  value: string | number;
  unit: string;
  trendValue: string;
  trendDirection: "up" | "down";
  targetLabel: string;
  chartData: readonly number[];
  className?: string;
}>;

function MiniAreaChart(props: Readonly<{ data: readonly number[] }>) {
  const { data } = props;
  const width = 72;
  const height = 32;
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

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-8 w-18 shrink-0"
      aria-hidden="true"
    >
      <path d={areaPath} className="fill-ehs-green/15" />
      <path
        d={linePath}
        fill="none"
        className="stroke-ehs-green"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function KpiMetricCard(props: Readonly<KpiMetricCardProps>) {
  const {
    title,
    value,
    unit,
    trendValue,
    trendDirection,
    targetLabel,
    chartData,
    className = "",
  } = props;

  const trendIcon =
    trendDirection === "up" ? "mdi:trending-up" : "mdi:trending-down";

  return (
    <article
      className={[
        "border-ehs-border flex min-w-0 flex-1 flex-col gap-3 rounded-2xl border bg-[#fafafa] px-5 py-4 shadow-sm shadow-white backdrop-blur-3xl",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <Text
          as="p"
          className="text-ehs-muted-text text-[10px] font-semibold tracking-wider uppercase"
        >
          {title}
        </Text>

        <span className="bg-ehs-green/10 text-ehs-green inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold">
          <Icon icon={trendIcon} className="text-xs" aria-hidden="true" />
          {trendValue}
        </span>
      </div>

      <div className="flex items-baseline gap-1.5">
        <Text
          as="p"
          className="text-ehs-darker text-3xl leading-none font-medium tabular-nums"
        >
          {String(value)}
        </Text>
        <Text as="span" className="text-ehs-gray text-sm font-medium">
          {unit}
        </Text>
      </div>

      <div className="flex items-end justify-between gap-3">
        <Text as="p" className="text-ehs-muted-text pb-2 text-xs">
          {targetLabel}
        </Text>
        <MiniAreaChart data={chartData} />
      </div>
    </article>
  );
}

export const DEFAULT_KPI_METRICS: readonly KpiMetricCardProps[] = [
  {
    title: "Total Recordable Rate",
    value: "2.3",
    unit: "TRIR",
    trendValue: "-0.4",
    trendDirection: "down",
    targetLabel: "Target ≤ 2.5",
    chartData: [3.2, 2.9, 2.8, 2.6, 2.5, 2.4, 2.3],
  },
  {
    title: "Lost Time Injury Rate",
    value: "0.8",
    unit: "LTIR",
    trendValue: "-0.2",
    trendDirection: "down",
    targetLabel: "Target ≤ 1.0",
    chartData: [1.2, 1.1, 1, 0.95, 0.9, 0.85, 0.8],
  },
  {
    title: "Safety Compliance",
    value: "78",
    unit: "%",
    trendValue: "+3pp",
    trendDirection: "up",
    targetLabel: "Target ≥ 85%",
    chartData: [68, 70, 72, 74, 75, 76, 78],
  },
  {
    title: "Training Compliance",
    value: "84",
    unit: "%",
    trendValue: "+2pp",
    trendDirection: "up",
    targetLabel: "Target ≥ 90%",
    chartData: [76, 78, 79, 80, 82, 83, 84],
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
      className={["grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className]
        .filter(Boolean)
        .join(" ")}
    >
      {metrics.map((metric) => (
        <KpiMetricCard key={metric.title} {...metric} />
      ))}
    </div>
  );
}
