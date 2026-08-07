"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { SHOW_KPI_TREND_BADGES } from "@/lib/kpi-display-flags";

export type IncidentListKpiTone = "positive" | "negative";

export type IncidentListKpiMetric = Readonly<{
  id: string;
  title: string;
  value: string;
  unit?: string;
  trendValue: string;
  trendDirection: "up" | "down";
  trendTone: IncidentListKpiTone;
  targetLabel: string | null;
  chartData: readonly number[];
}>;

export type IncidentListKpiCardProps = Readonly<
  IncidentListKpiMetric & {
    className?: string;
  }
>;

function MiniSparkline(
  props: Readonly<{
    data: readonly number[];
    tone: IncidentListKpiTone;
  }>,
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
  const strokeClass =
    tone === "positive" ? "stroke-ehs-green" : "stroke-ehs-red";
  const fillClass =
    tone === "positive" ? "fill-ehs-green/15" : "fill-ehs-red/15";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-[22px] w-[70px] shrink-0"
      aria-hidden="true"
    >
      <path d={areaPath} className={fillClass} />
      <path
        d={linePath}
        fill="none"
        className={strokeClass}
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
    trendTone,
    targetLabel,
    chartData,
    className = "",
  } = props;

  const trendIcon =
    trendDirection === "up" ? "mdi:trending-up" : "mdi:trending-down";
  const trendClass =
    trendTone === "positive"
      ? "bg-ehs-green/14 text-ehs-green"
      : "bg-ehs-red/14 text-ehs-red";

  return (
    <IncidentGlassCard
      paddingClassName="p-4"
      className={["min-w-0", className].filter(Boolean).join(" ")}
    >
      <div className="flex h-full flex-col gap-2">
        <div className="flex w-full items-start justify-between gap-3">
          <Text
            as="p"
            className="text-ehs-muted-text py-px text-xs font-bold tracking-wide uppercase"
          >
            {title}
          </Text>
          {SHOW_KPI_TREND_BADGES ? (
            <span
              className={[
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide",
                trendClass,
              ].join(" ")}
            >
              <Icon
                icon={trendIcon}
                className="size-3 shrink-0"
                aria-hidden="true"
              />
              {trendValue}
            </span>
          ) : null}
        </div>

        <div className="flex w-full items-baseline">
          <Text
            as="p"
            className="text-ehs-darker text-3xl leading-none tracking-tight tabular-nums"
          >
            {value}
          </Text>
          {unit ? (
            <Text as="span" className="text-ehs-gray ml-1.5 text-sm">
              {unit}
            </Text>
          ) : null}
        </div>

        <div className="mt-auto flex w-full items-end justify-between gap-3">
          {targetLabel ? (
            <Text as="p" className="text-ehs-muted-text py-px text-xs">
              {targetLabel}
            </Text>
          ) : (
            <span />
          )}
          <MiniSparkline data={chartData} tone={trendTone} />
        </div>
      </div>
    </IncidentGlassCard>
  );
}
