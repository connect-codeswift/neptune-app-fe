"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useIncidentTrendsQuery } from "@/hooks/use-dashboard-queries";
import { getAccessToken } from "@/lib/axios";

type SeriesKey = "incidents" | "nearMisses" | "hazards";

type SeriesMeta = Readonly<{
  key: SeriesKey;
  label: string;
  color: string;
  fill?: string;
}>;

const SERIES_META: readonly SeriesMeta[] = [
  {
    key: "incidents",
    label: "Incidents",
    color: "#ef4444",
    fill: "rgba(239, 68, 68, 0.12)",
  },
  { key: "nearMisses", label: "Near Misses", color: "#f59e0b" },
  { key: "hazards", label: "Hazards", color: "#0891a6" },
];

const FILTERS = ["All", "Incidents", "Near Miss", "Hazards"] as const;
type TrendFilter = (typeof FILTERS)[number];

const FILTER_SERIES_KEY: Partial<Record<TrendFilter, SeriesKey>> = {
  Incidents: "incidents",
  "Near Miss": "nearMisses",
  Hazards: "hazards",
};

const CHART_LAYOUT = {
  width: 480,
  height: 220,
  padLeft: 36,
  padRight: 16,
  padTop: 16,
  padBottom: 32,
} as const;

/** Rounds up to a "nice" axis max (1/2/5 × 10^n) so ticks land on clean numbers. */
function computeYAxis(maxValue: number): {
  yMax: number;
  ticks: readonly number[];
} {
  const tickCount = 4;
  const safeMax = Math.max(maxValue, 1);
  const rawStep = safeMax / tickCount;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalized = rawStep / magnitude;
  const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  const step = Math.max(Math.round(niceNormalized * magnitude), 1);
  const yMax = step * tickCount;
  const ticks = Array.from({ length: tickCount + 1 }, (_, index) => index * step);

  return { yMax, ticks };
}

function getPlotPoints(data: readonly number[], yMax: number) {
  const plotWidth = CHART_LAYOUT.width - CHART_LAYOUT.padLeft - CHART_LAYOUT.padRight;
  const plotHeight = CHART_LAYOUT.height - CHART_LAYOUT.padTop - CHART_LAYOUT.padBottom;
  const denom = data.length > 1 ? data.length - 1 : 1;

  return data.map((value, index) => {
    const t = data.length > 1 ? index / denom : 0.5;
    const x = CHART_LAYOUT.padLeft + t * plotWidth;
    const y =
      CHART_LAYOUT.padTop + plotHeight - (Math.min(value, yMax) / yMax) * plotHeight;

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

  const baseline = CHART_LAYOUT.height - CHART_LAYOUT.padBottom;

  return `${linePath} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
}

function TrendChart(
  props: Readonly<{
    weekLabels: readonly string[];
    seriesData: Readonly<Record<SeriesKey, readonly number[]>>;
    yMax: number;
    ticks: readonly number[];
    visibleSeries: readonly SeriesMeta[];
  }>,
) {
  const { weekLabels, seriesData, yMax, ticks, visibleSeries } = props;

  const plotWidth = CHART_LAYOUT.width - CHART_LAYOUT.padLeft - CHART_LAYOUT.padRight;
  const plotHeight = CHART_LAYOUT.height - CHART_LAYOUT.padTop - CHART_LAYOUT.padBottom;
  const labelDenom = weekLabels.length > 1 ? weekLabels.length - 1 : 1;

  return (
    <svg
      viewBox={`0 0 ${CHART_LAYOUT.width} ${CHART_LAYOUT.height}`}
      className="h-auto w-full"
      role="img"
      aria-label="Incident trends chart"
    >
      {ticks.map((tick) => {
        const y = CHART_LAYOUT.padTop + plotHeight - (tick / yMax) * plotHeight;

        return (
          <g key={tick}>
            <line
              x1={CHART_LAYOUT.padLeft}
              x2={CHART_LAYOUT.width - CHART_LAYOUT.padRight}
              y1={y}
              y2={y}
              className="stroke-ehs-border"
              strokeWidth="1"
            />
            <text
              x={CHART_LAYOUT.padLeft - 8}
              y={y + 4}
              textAnchor="end"
              className="fill-ehs-muted-text text-[10px]"
            >
              {tick}
            </text>
          </g>
        );
      })}

      {weekLabels.map((week, index) => {
        const t = weekLabels.length > 1 ? index / labelDenom : 0.5;
        const x = CHART_LAYOUT.padLeft + t * plotWidth;

        return (
          <text
            key={`${week}-${String(index)}`}
            x={x}
            y={CHART_LAYOUT.height - 10}
            textAnchor="middle"
            className="fill-ehs-muted-text text-[10px]"
          >
            {week}
          </text>
        );
      })}

      {visibleSeries.map((series) => {
        const points = getPlotPoints(seriesData[series.key], yMax);
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
                key={`${series.key}-${String(index)}`}
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

function FilterToggle(
  props: Readonly<{
    value: TrendFilter;
    onChange: (value: TrendFilter) => void;
  }>,
) {
  const { value, onChange } = props;

  return (
    <div className="border-ehs-border bg-ehs-light-bg inline-flex rounded-full border p-0.5">
      {FILTERS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={[
            "cursor-pointer rounded-full px-3 py-1 text-[10px] font-semibold whitespace-nowrap transition-colors",
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

/**
 * Incident Trends card. Loads GET /api/EHSCommandCenter/GetIncidentTrends —
 * weekly buckets, series values, and the Y axis are all derived from the
 * response (no fixed week count or hardcoded series values).
 */
export function IncidentTrendsCard(props: Readonly<IncidentTrendsCardProps>) {
  const { className = "" } = props;
  const [filter, setFilter] = useState<TrendFilter>("All");
  const [isClientReady, setIsClientReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(Boolean(getAccessToken()));
    setIsClientReady(true);
  }, []);

  const trendsQuery = useIncidentTrendsQuery(isClientReady && hasToken);

  const dto = trendsQuery.data?.dataModel ?? null;
  const trends = dto?.trends ?? [];
  const weekCount = dto?.weeks ?? trends.length;

  const weekLabels = trends.map((entry) => entry.week?.trim() || "—");
  const seriesData: Record<SeriesKey, readonly number[]> = {
    incidents: trends.map((entry) => entry.incidents ?? 0),
    nearMisses: trends.map((entry) => entry.nearMisses ?? 0),
    hazards: trends.map((entry) => entry.hazards ?? 0),
  };

  const maxValue = Math.max(
    0,
    ...seriesData.incidents,
    ...seriesData.nearMisses,
    ...seriesData.hazards,
  );
  const { yMax, ticks } = computeYAxis(maxValue);

  const visibleSeries =
    filter === "All"
      ? SERIES_META
      : SERIES_META.filter((series) => series.key === FILTER_SERIES_KEY[filter]);

  const showLoading = !isClientReady || (hasToken && trendsQuery.isLoading);
  const showSignInPrompt = isClientReady && !hasToken;
  const showError = isClientReady && hasToken && trendsQuery.isError;
  const showEmpty =
    isClientReady &&
    hasToken &&
    !trendsQuery.isLoading &&
    !trendsQuery.isError &&
    trends.length === 0;

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
            {weekCount > 0
              ? `Last ${String(weekCount)} weeks · all sites`
              : "All sites"}
          </Text>
        </div>
        <FilterToggle value={filter} onChange={setFilter} />
      </div>

      {showLoading ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 text-center">
          <Icon
            icon="mdi:loading"
            className="text-ehs-normal-blue size-8 animate-spin"
            aria-hidden="true"
          />
          <Text as="p" className="text-ehs-muted-text text-sm">
            Loading trends…
          </Text>
        </div>
      ) : showSignInPrompt ? (
        <div className="flex min-h-[220px] items-center justify-center">
          <Text as="p" className="text-ehs-muted-text text-sm">
            Please sign in to load incident trends.
          </Text>
        </div>
      ) : showError ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 text-center">
          <Icon
            icon="mdi:alert-circle-outline"
            className="text-ehs-red size-8"
            aria-hidden="true"
          />
          <Text as="p" className="text-ehs-darker text-sm font-semibold">
            Could not load incident trends
          </Text>
          <Text as="p" className="text-ehs-muted-text text-sm">
            {getMutationErrorMessage(
              trendsQuery.error,
              "Failed to load incident trends.",
            )}
          </Text>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void trendsQuery.refetch()}
            className="mt-1"
          >
            Retry
          </Button>
        </div>
      ) : showEmpty ? (
        <div className="flex min-h-[220px] items-center justify-center">
          <Text as="p" className="text-ehs-muted-text text-sm">
            No trend data for this period.
          </Text>
        </div>
      ) : (
        <>
          <TrendChart
            weekLabels={weekLabels}
            seriesData={seriesData}
            yMax={yMax}
            ticks={ticks}
            visibleSeries={visibleSeries}
          />

          <div className="flex flex-wrap items-center gap-4">
            {visibleSeries.map((series) => (
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
        </>
      )}
    </article>
  );
}
