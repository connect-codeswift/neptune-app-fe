"use client";

import { useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents";
import {
  DEFAULT_WALK_TALK_GRAPH_WEEKS,
  useWalkTalkGraphQuery,
} from "@/hooks/use-walk-talk-queries";
import { toWalkTalkTrendPoints } from "@/lib/map-walk-talk";
import type { WalkTalkTrendPoint } from "@/app/dashboard/walk-talk/walk-talk-data";

const SESSIONS_COLOR = "#0891a6";

const AXIS_TICK = { fill: "#8892a3", fontSize: 10 };

type TooltipEntry = Readonly<{
  dataKey?: string | number;
  value?: number | string;
}>;

function ChartTooltip(
  props: Readonly<{
    active?: boolean;
    payload?: readonly TooltipEntry[];
    label?: string | number;
  }>,
) {
  const { active, payload, label } = props;
  if (!active || !payload || payload.length === 0) return null;

  const valueOf = (key: string) =>
    payload.find((entry) => entry.dataKey === key)?.value ?? 0;

  return (
    <div className="border-ehs-border rounded-lg border bg-white px-3 py-2 shadow-[0px_8px_24px_-8px_rgba(15,23,42,0.28)]">
      <p className="text-ehs-dark-bg text-xs font-bold">{String(label)}</p>
      <div className="mt-1 flex items-center gap-2">
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: SESSIONS_COLOR }}
          aria-hidden="true"
        />
        <span className="text-ehs-gray text-xs">
          {`Sessions ${String(valueOf("sessions"))}`}
        </span>
      </div>
    </div>
  );
}

function LegendItem(props: Readonly<{ color: string; label: string }>) {
  const { color, label } = props;

  return (
    <div className="flex items-center gap-2">
      <span
        className="size-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <span className="text-ehs-gray text-sm">{label}</span>
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
          <h3 className="text-ehs-dark-bg text-lg font-bold">
            Walk &amp; Talk Trends
          </h3>
          <p className="text-ehs-muted-text text-sm">
            {`Sessions logged · ${String(displayWeeks)} weeks`}
          </p>
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
          <p className="text-ehs-muted-text text-sm">Loading…</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={[...points]}
              margin={{ top: 8, right: 4, bottom: 0, left: -24 }}
            >
              <CartesianGrid stroke="#e5e7eb" vertical={false} syncWithTicks />

              <XAxis
                dataKey="label"
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                tickMargin={10}
                interval={0}
              />
              <YAxis
                domain={yScale.domain}
                ticks={yScale.ticks}
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                width={40}
              />

              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: "#8892a3", strokeDasharray: "3 3" }}
              />

              <Area
                type="linear"
                dataKey="sessions"
                stroke={SESSIONS_COLOR}
                strokeWidth={2}
                fill={SESSIONS_COLOR}
                fillOpacity={0.08}
                dot={{
                  r: 4,
                  fill: "#ffffff",
                  stroke: SESSIONS_COLOR,
                  strokeWidth: 2,
                }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <LegendItem color={SESSIONS_COLOR} label="Session logged" />
      </div>
    </IncidentGlassCard>
  );
}
