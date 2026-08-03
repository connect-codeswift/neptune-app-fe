"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents";
import type { WalkTalkTrendPoint } from "@/app/dashboard/walk-talk/walk-talk-data";

const SESSIONS_COLOR = "#0891a6";
const ISSUES_COLOR = "#ef4444";

/** Fixed domain and ticks, matching the design's scale. */
const Y_DOMAIN: [number, number] = [0, 18];
const Y_TICKS = [0, 4, 9, 13, 17];

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
      <div className="mt-1 flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: SESSIONS_COLOR }}
            aria-hidden="true"
          />
          <span className="text-ehs-gray text-xs">
            {`Sessions ${String(valueOf("sessions"))}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: ISSUES_COLOR }}
            aria-hidden="true"
          />
          <span className="text-ehs-gray text-xs">
            {`Issues ${String(valueOf("issues"))}`}
          </span>
        </div>
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

export type WalkTalkTrendsCardProps = Readonly<{
  points: readonly WalkTalkTrendPoint[];
  className?: string;
}>;

export function WalkTalkTrendsCard(props: WalkTalkTrendsCardProps) {
  const { points, className = "" } = props;

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
            Sessions logged · 8 weeks
          </p>
        </div>
        <button
          type="button"
          aria-label="Filter trends"
          className="text-ehs-muted-text hover:text-ehs-gray shrink-0 cursor-pointer rounded-lg p-1 transition-colors"
        >
          <Icon
            icon="mdi:filter-outline"
            className="size-6"
            aria-hidden="true"
          />
        </button>
      </header>

      <div className="min-h-52 min-w-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={[...points]}
            margin={{ top: 8, right: 8, bottom: 0, left: -18 }}
          >
            <CartesianGrid stroke="#e5e7eb" vertical={false} syncWithTicks />

            <XAxis
              dataKey="label"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              tickMargin={10}
            />
            <YAxis
              domain={Y_DOMAIN}
              ticks={Y_TICKS}
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
            <Line
              type="linear"
              dataKey="issues"
              stroke={ISSUES_COLOR}
              strokeWidth={2}
              dot={{
                r: 4,
                fill: "#ffffff",
                stroke: ISSUES_COLOR,
                strokeWidth: 2,
              }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <LegendItem color={SESSIONS_COLOR} label="Session logged" />
        <LegendItem color={ISSUES_COLOR} label="Issues identified" />
      </div>
    </IncidentGlassCard>
  );
}
