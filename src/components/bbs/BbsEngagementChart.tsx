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
import type { EngagementPoint } from "@/app/dashboard/bbs/bbs-data";

const AXIS_TICK = { fill: "#8892a3", fontSize: 10 };

type TooltipEntry = Readonly<{
  dataKey?: string | number;
  value?: number | string;
}>;

/** Values live in the tooltip — dense week series can't carry direct labels. */
function ChartTooltip(
  props: Readonly<{
    safeColor: string;
    atRiskColor: string;
    active?: boolean;
    payload?: readonly TooltipEntry[];
    label?: string | number;
  }>,
) {
  const { safeColor, atRiskColor, active, payload, label } = props;
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
            style={{ backgroundColor: safeColor }}
            aria-hidden="true"
          />
          <span className="text-ehs-gray text-xs">
            {`Safe ${String(valueOf("safe"))}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: atRiskColor }}
            aria-hidden="true"
          />
          <span className="text-ehs-gray text-xs">
            {`At risk ${String(valueOf("atRisk"))}`}
          </span>
        </div>
      </div>
    </div>
  );
}

export type BbsEngagementChartProps = Readonly<{
  points: readonly EngagementPoint[];
  yScale: Readonly<{ domain: [number, number]; ticks: number[] }>;
  /** Owned by the card so its legend and this chart cannot drift apart. */
  safeColor: string;
  atRiskColor: string;
}>;

/**
 * Recharts-only half of the engagement card, split out so `next/dynamic` can
 * keep the charting library out of the route's initial JS.
 */
export function BbsEngagementChart(props: BbsEngagementChartProps) {
  const { points, yScale, safeColor, atRiskColor } = props;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={[...points]}
        margin={{ top: 8, right: 4, bottom: 0, left: -24 }}
      >
        {/* Recessive horizontal rules only. `syncWithTicks` keeps the grid
            to the ticks — without it Recharts also rules the domain edges,
            which drew a stray line above the top gridline. */}
        <CartesianGrid stroke="#e5e7eb" vertical={false} syncWithTicks />

        <XAxis
          dataKey="label"
          tick={AXIS_TICK}
          tickLine={false}
          // The baseline the area sits on — the grid no longer draws it.
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
          content={
            <ChartTooltip safeColor={safeColor} atRiskColor={atRiskColor} />
          }
          cursor={{ stroke: "#8892a3", strokeDasharray: "3 3" }}
        />

        {/* Safe observations carry the area fill, matching the design. */}
        <Area
          type="linear"
          dataKey="safe"
          stroke={safeColor}
          strokeWidth={2}
          fill={safeColor}
          fillOpacity={0.08}
          dot={{
            r: 4,
            fill: "#ffffff",
            stroke: safeColor,
            strokeWidth: 2,
          }}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
        />
        <Line
          type="linear"
          dataKey="atRisk"
          stroke={atRiskColor}
          strokeWidth={2}
          dot={{
            r: 4,
            fill: "#ffffff",
            stroke: atRiskColor,
            strokeWidth: 2,
          }}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
