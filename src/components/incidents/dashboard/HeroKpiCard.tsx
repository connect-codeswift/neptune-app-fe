import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  TargetProgress,
  resolveTargetStatus,
} from "@/components/incidents/dashboard/TargetProgress";
import type { HeroKpiMetric } from "@/components/incidents/dashboard/incident-kpis-data";

export type HeroKpiCardProps = Readonly<{
  metric: HeroKpiMetric;
  className?: string;
}>;

function HeroKpiFooter(props: Readonly<{ metric: HeroKpiMetric }>) {
  const { metric } = props;

  if (metric.footerNote != null) {
    if (!metric.footerNote) {
      return null;
    }

    return (
      <Text as="p" className="text-ehs-muted-text text-xs leading-4">
        {metric.footerNote}
      </Text>
    );
  }

  return (
    <TargetProgress
      current={metric.current}
      target={metric.target}
      targetLabel={metric.targetLabel}
      direction={metric.direction}
    />
  );
}

function MiniSparkline(props: Readonly<{ data: readonly number[] }>) {
  const { data } = props;
  const width = 96;
  const height = 34;
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
      className="h-8.5 w-20 shrink-0"
      aria-hidden="true"
    >
      <path d={areaPath} className="fill-ehs-green/15" />
      <path
        d={linePath}
        fill="none"
        className="stroke-ehs-green"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeroKpiCard(props: Readonly<HeroKpiCardProps>) {
  const { metric, className = "" } = props;
  const hasTarget = metric.target != null;
  const status =
    metric.status ??
    (hasTarget
      ? resolveTargetStatus(
          metric.current,
          metric.target as number,
          metric.direction,
        )
      : null);

  return (
    <IncidentGlassCard
      className={["min-h-45", className].filter(Boolean).join(" ")}
    >
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <Text
              as="p"
              className="text-ehs-darker text-sm font-bold tracking-[0.26px]"
            >
              {metric.title}
            </Text>
            <Text as="p" className="text-ehs-muted-text text-xs">
              {metric.subtitle}
            </Text>
          </div>

          {status ? (
            <span
              className={[
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.25 py-[2.5px] text-sm font-bold tracking-[0.11px]",
                status === "on"
                  ? "bg-ehs-green/14 text-ehs-green"
                  : "bg-ehs-red/14 text-ehs-red",
              ].join(" ")}
            >
              <span
                className={[
                  "size-1.5 rounded-0.75",
                  status === "on" ? "bg-ehs-green" : "bg-ehs-red",
                ].join(" ")}
                aria-hidden="true"
              />
              {status === "on" ? "On target" : "Off target"}
            </span>
          ) : null}
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="flex items-baseline gap-1 pr-1.5">
            <Text
              as="p"
              className="text-ehs-darker text-2xl leading-none tracking-tight tabular-nums"
            >
              {metric.value}
            </Text>
            {metric.unit ? (
              <Text as="span" className="text-ehs-muted-text text-xs uppercase">
                {metric.unit}
              </Text>
            ) : null}
          </div>
          <MiniSparkline data={metric.chartData} />
        </div>

        <div className="mt-auto">
          <HeroKpiFooter metric={metric} />
        </div>
      </div>
    </IncidentGlassCard>
  );
}
