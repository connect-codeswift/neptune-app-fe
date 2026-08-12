"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { TrendChartSkeleton } from "@/components/DashboardSkeletons";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import {
  DEFAULT_WALK_TALK_GRAPH_WEEKS,
  useWalkTalkGraphQuery,
} from "@/hooks/use-walk-talk-queries";
import { toWalkTalkTrendPoints } from "@/lib/map-walk-talk";
import type { WalkTalkTrendPoint } from "@/app/dashboard/walk-talk/walk-talk-data";

/**
 * Recharts is ~325 KB of this route's client JS. Loading the chart on demand
 * keeps it out of the initial bundle; the card's shell renders immediately.
 * Nothing may be statically imported from the chart module, or the library is
 * pulled straight back into this route's chunk.
 */
const WalkTalkTrendsChart = dynamic(
  () => import("./WalkTalkTrendsChart").then((m) => m.WalkTalkTrendsChart),
  {
    ssr: false,
    // A chart-shaped skeleton, not a line of text: this is a page-load wait,
    // and holding the chart's footprint stops the card collapsing and
    // reflowing when the deferred chunk lands.
    loading: () => <TrendChartSkeleton />,
  },
);

/** Owned here so the legend below and the chart cannot drift apart. */
const SESSIONS_COLOR = "#0891a6";

function LegendItem(props: Readonly<{ color: string; label: string }>) {
  const { color, label } = props;

  return (
    <div className="flex items-center gap-2">
      <span
        className="size-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <Text as="span" className="text8 text-ehs-gray">
        {label}
      </Text>
    </div>
  );
}

/** Scale the Y axis to the series peak (min 4), rounded up to a clean step. */
function toYScale(points: readonly WalkTalkTrendPoint[]) {
  const peak = points.reduce(
    (highest, point) => Math.max(highest, point.sessions),
    0,
  );
  const yMax = Math.max(4, Math.ceil(peak / 4) * 4 || 4);
  const step = yMax / 4;

  return {
    domain: [0, yMax] as [number, number],
    ticks: [step, step * 2, step * 3, yMax],
  };
}

export type WalkTalkTrendsCardProps = Readonly<{
  className?: string;
  weeks?: number;
}>;

export function WalkTalkTrendsCard(props: WalkTalkTrendsCardProps) {
  const { className = "", weeks = DEFAULT_WALK_TALK_GRAPH_WEEKS } = props;
  const graphQuery = useWalkTalkGraphQuery(weeks);
  const points = useMemo(
    () => toWalkTalkTrendPoints(graphQuery.data?.dataModel),
    [graphQuery.data?.dataModel],
  );

  const displayWeeks = graphQuery.data?.dataModel?.weeks ?? weeks;
  const yScale = useMemo(() => toYScale(points), [points]);

  return (
    <IncidentGlassCard
      paddingClassName="p-6"
      className={["min-w-0", className].filter(Boolean).join(" ")}
      incidentGlassCardClassName="gap-4"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <Text as="h3" className="text3 text-ehs-darker">
            Walk & Talk Trends
          </Text>
          <Text as="p" className="text8 text-ehs-muted-text">
            {`Sessions logged · ${String(displayWeeks)} weeks`}
          </Text>
        </div>
        {/* No onClick was ever attached, so this read as an available filter
            and did nothing. Disabled until there is something to filter by. */}
        <button
          type="button"
          disabled
          aria-label="Filter trends (not available yet)"
          title="Filtering trends is not available yet"
          className="text-ehs-muted-text shrink-0 rounded-lg p-1 opacity-40 disabled:cursor-not-allowed"
        >
          <Icon
            icon="mdi:filter-outline"
            className="size-6"
            aria-hidden="true"
          />
        </button>
      </header>

      <div className="min-h-40 min-w-0 flex-1 sm:min-h-52">
        {graphQuery.isPending && points.length === 0 ? (
          <Text as="p" className="text8 text-ehs-muted-text">
            Loading…
          </Text>
        ) : (
          <WalkTalkTrendsChart
            points={points}
            yScale={yScale}
            sessionsColor={SESSIONS_COLOR}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <LegendItem color={SESSIONS_COLOR} label="Session logged" />
      </div>
    </IncidentGlassCard>
  );
}
