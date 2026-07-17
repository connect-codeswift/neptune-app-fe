"use client";

import { useState } from "react";
import { Text } from "@/components/Text";

const WEEKS = ["W19", "W20", "W21", "W22", "W23", "W24", "W25", "W26"] as const;
const Y_TICKS = [0, 5, 10, 14, 19] as const;
const FILTERS = ["All", "Incidents", "Near Miss"] as const;

type TrendFilter = (typeof FILTERS)[number];

type TrendSeries = Readonly<{
  key: "incidents" | "nearMisses" | "hazards";
  label: string;
  color: string;
  fill?: string;
  data: readonly number[];
}>;

const TREND_SERIES: readonly TrendSeries[] = [
  {
    key: "incidents",
    label: "Incidents",
    color: "#ef4444",
    fill: "rgba(239, 68, 68, 0.12)",
    data: [4, 5, 6, 3, 7, 5, 4, 6],
  },
  {
    key: "nearMisses",
    label: "Near Misses",
    color: "#f59e0b",
    data: [10, 11, 12, 9, 13, 11, 10, 12],
  },
  {
    key: "hazards",
    label: "Hazards",
    color: "#0891a6",
    data: [14, 15, 16, 13, 17, 15, 14, 16],
  },
];

const CHART = {
  width: 480,
  height: 220,
  padLeft: 36,
  padRight: 16,
  padTop: 16,
  padBottom: 32,
  yMax: 19,
} as const;

function getPlotPoints(data: readonly number[]) {
  const plotWidth = CHART.width - CHART.padLeft - CHART.padRight;
  const plotHeight = CHART.height - CHART.padTop - CHART.padBottom;

  return data.map((value, index) => {
    const x =
      CHART.padLeft + (index / (data.length - 1)) * plotWidth;
    const y =
      CHART.padTop +
      plotHeight -
      (value / CHART.yMax) * plotHeight;

    return { x, y };
  });
}

function buildLinePath(points: readonly { x: number; y: number }[]) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

function buildAreaPath(points: readonly { x: number; y: number }[]) {
  if (points.length < 2) {
    return "";
  }

  const linePath = buildLinePath(points);
  const last = points.at(-1);
  const first = points[0];

  if (!last || !first) {
    return "";
  }

  const baseline = CHART.height - CHART.padBottom;

  return `${linePath} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
}

function TrendChart(props: Readonly<{ filter: TrendFilter }>) {
  const { filter } = props;

  const visibleSeries = TREND_SERIES.filter((series) => {
    if (filter === "All") {
      return true;
    }

    if (filter === "Incidents") {
      return series.key === "incidents";
    }

    return series.key === "nearMisses";
  });

  const plotHeight = CHART.height - CHART.padTop - CHART.padBottom;

  return (
    <svg
      viewBox={`0 0 ${CHART.width} ${CHART.height}`}
      className="h-auto w-full"
      role="img"
      aria-label="Incident trends chart"
    >
      {Y_TICKS.map((tick) => {
        const y = CHART.padTop + plotHeight - (tick / CHART.yMax) * plotHeight;

        return (
          <g key={tick}>
            <line
              x1={CHART.padLeft}
              x2={CHART.width - CHART.padRight}
              y1={y}
              y2={y}
              className="stroke-ehs-border"
              strokeWidth="1"
            />
            <text
              x={CHART.padLeft - 8}
              y={y + 4}
              textAnchor="end"
              className="fill-ehs-muted-text text-[10px]"
            >
              {tick}
            </text>
          </g>
        );
      })}

      {WEEKS.map((week, index) => {
        const plotWidth = CHART.width - CHART.padLeft - CHART.padRight;
        const x = CHART.padLeft + (index / (WEEKS.length - 1)) * plotWidth;

        return (
          <text
            key={week}
            x={x}
            y={CHART.height - 10}
            textAnchor="middle"
            className="fill-ehs-muted-text text-[10px]"
          >
            {week}
          </text>
        );
      })}

      {visibleSeries.map((series) => {
        const points = getPlotPoints(series.data);
        const linePath = buildLinePath(points);

        return (
          <g key={series.key}>
            {series.fill ? (
              <path d={buildAreaPath(points)} fill={series.fill} />
            ) : null}
            <path
              d={linePath}
              fill="none"
              stroke={series.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {points.map((point, index) => (
              <circle
                key={`${series.key}-${index}`}
                cx={point.x}
                cy={point.y}
                r="2.5"
                fill="#ffffff"
                stroke={series.color}
                strokeWidth="2"
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

function FilterToggle(props: Readonly<{
  value: TrendFilter;
  onChange: (value: TrendFilter) => void;
}>) {
  const { value, onChange } = props;

  return (
    <div className="border-ehs-border bg-ehs-light-bg inline-flex rounded-full border p-0.5">
      {FILTERS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={[
            "rounded-full px-3 cursor-pointer py-1 text-[10px] font-semibold transition-colors",
            value === option
              ? "bg-ehs-darker text-ehs-light-text"
              : "text-ehs-muted-text hover:text-ehs-gray",
          ].join(" ")}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export type IncidentTrendsCardProps = Readonly<{
  className?: string;
}>;

export function IncidentTrendsCard(props: Readonly<IncidentTrendsCardProps>) {
  const { className = "" } = props;
  const [filter, setFilter] = useState<TrendFilter>("All");

  const legendSeries =
    filter === "All"
      ? TREND_SERIES
      : TREND_SERIES.filter((series) =>
          filter === "Incidents"
            ? series.key === "incidents"
            : series.key === "nearMisses",
        );

  return (
    <article
      className={[
        "border-ehs-border bg-ehs-light-text flex flex-col gap-4 rounded-2xl border p-5 shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Text as="h2" className="text-ehs-darker text-base font-bold">
            Incident Trends
          </Text>
          <Text as="p" className="text-ehs-muted-text mt-0.5 text-xs">
            Last 8 weeks · all sites
          </Text>
        </div>
        <FilterToggle value={filter} onChange={setFilter} />
      </div>

      <TrendChart filter={filter} />

      <div className="flex flex-wrap items-center gap-4">
        {legendSeries.map((series) => (
          <div key={series.key} className="flex items-center gap-1.5">
            <span
              className="h-0.5 w-0.5 rounded-sm"
              style={{ backgroundColor: series.color }}
              aria-hidden="true"
            />
            <Text as="span" className="text-ehs-gray text-xs">
              {series.label}
            </Text>
          </div>
        ))}
      </div>
    </article>
  );
}
