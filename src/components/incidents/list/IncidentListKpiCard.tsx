import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import type { KpiMetricCardProps } from "@/components/KpiMetricCard";

export type IncidentListKpiCardProps = Readonly<
  KpiMetricCardProps & {
    className?: string;
  }
>;

function MiniSparkline(props: Readonly<{ data: readonly number[] }>) {
  const { data } = props;
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

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-[22px] w-[70px] shrink-0"
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

export function IncidentListKpiCard(props: Readonly<IncidentListKpiCardProps>) {
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
    <IncidentGlassCard
      paddingClassName="p-[19px]"
      className={["min-h-[141px] min-w-0", className].filter(Boolean).join(" ")}
    >
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <Text as="p" className="text-ehs-muted-text text-[12px] font-semibold">
            {title}
          </Text>
          <span className="bg-ehs-green/14 text-ehs-green inline-flex shrink-0 items-center gap-1 rounded-full px-[9px] py-[2.5px] text-[11px] font-bold">
            <Icon icon={trendIcon} className="text-[11px]" aria-hidden="true" />
            {trendValue}
          </span>
        </div>

        <div className="flex items-baseline gap-1.5">
          <Text
            as="p"
            className="text-ehs-darker text-[40px] leading-none font-medium tracking-[-1px] tabular-nums"
          >
            {String(value)}
          </Text>
          {unit ? (
            <Text as="span" className="text-ehs-gray text-sm font-medium">
              {unit}
            </Text>
          ) : null}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3">
          <Text as="p" className="text-ehs-muted-text text-[11px]">
            {targetLabel}
          </Text>
          <MiniSparkline data={chartData} />
        </div>
      </div>
    </IncidentGlassCard>
  );
}
