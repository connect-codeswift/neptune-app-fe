"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WalkTalkTrendPoint } from "@/app/dashboard/walk-talk/walk-talk-data";

const AXIS_TICK = { fill: "#8892a3", fontSize: 10 };

type TooltipEntry = Readonly<{
  dataKey?: string | number;
  value?: number | string;
}>;

function ChartTooltip(
  props: Readonly<{
    sessionsColor: string;
    active?: boolean;
    payload?: readonly TooltipEntry[];
    label?: string | number;
  }>,
) {
  const { sessionsColor, active, payload, label } = props;
  if (!active || !payload || payload.length === 0) return null;

  const valueOf = (key: string) =>
    payload.find((entry) => entry.dataKey === key)?.value ?? 0;

  return (
    <div className="border-ehs-border rounded-lg border bg-white px-3 py-2 shadow-[0px_8px_24px_-8px_rgba(15,23,42,0.28)]">
      <p className="text5 text-ehs-darker">{String(label)}</p>
      <div className="mt-1 flex items-center gap-2">
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: sessionsColor }}
          aria-hidden="true"
        />
        <span className="text8 text-ehs-gray">
          {`Sessions ${String(valueOf("sessions"))}`}
        </span>
      </div>
    </div>
  );
}

export type WalkTalkTrendsChartProps = Readonly<{
  points: readonly WalkTalkTrendPoint[];
  yScale: Readonly<{ domain: [number, number]; ticks: number[] }>;
  /** Owned by the card so its legend and this chart cannot drift apart. */
  sessionsColor: string;
}>;

/**
 * Recharts-only half of the trends card, split out so `next/dynamic` can keep
 * the charting library out of the route's initial JS.
 */
export function WalkTalkTrendsChart(props: WalkTalkTrendsChartProps) {
  const { points, yScale, sessionsColor } = props;

  return (
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
          content={<ChartTooltip sessionsColor={sessionsColor} />}
          cursor={{ stroke: "#8892a3", strokeDasharray: "3 3" }}
        />

        <Area
          type="linear"
          dataKey="sessions"
          stroke={sessionsColor}
          strokeWidth={2}
          fill={sessionsColor}
          fillOpacity={0.08}
          dot={{
            r: 4,
            fill: "#ffffff",
            stroke: sessionsColor,
            strokeWidth: 2,
          }}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
