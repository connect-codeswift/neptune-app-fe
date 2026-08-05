"use client";

import { useMemo } from "react";
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
import { IncidentGlassCard } from "@/components/incidents";
import {
  DEFAULT_BBS_GRAPH_WEEKS,
  useBbsGraphQuery,
} from "@/hooks/use-bbs-queries";
import { toBbsEngagementPoints } from "@/lib/map-bbs";

const SAFE_COLOR = "#0891a6";
const AT_RISK_COLOR = "#ef4444";

const AXIS_TICK = { fill: "#8892a3", fontSize: 10 };

type TooltipEntry = Readonly<{
  dataKey?: string | number;
  value?: number | string;
}>;

/** Values live in the tooltip — dense week series can't carry direct labels. */
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
            style={{ backgroundColor: SAFE_COLOR }}
            aria-hidden="true"
          />
          <span className="text-ehs-gray text-xs">
            {`Safe ${String(valueOf("safe"))}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: AT_RISK_COLOR }}
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

/** Legend swatch + label; the label itself stays in text ink, not series colour. */
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
function toYScale(points: readonly { safe: number; atRisk: number }[]) {
  const peak = points.reduce(
    (highest, point) => Math.max(highest, point.safe, point.atRisk),
    0,
  );
  const yMax = Math.max(4, Math.ceil(peak / 4) * 4 || 4);
  const step = yMax / 4;

  return {
    domain: [0, yMax] as [number, number],
    ticks: [step, step * 2, step * 3, yMax],
  };
}

export type BbsEngagementCardProps = Readonly<{
  weeks?: number;
  className?: string;
}>;

export function BbsEngagementCard(props: BbsEngagementCardProps) {
  const { weeks = DEFAULT_BBS_GRAPH_WEEKS, className = "" } = props;
  const graphQuery = useBbsGraphQuery(weeks);

  const points = useMemo(
    () => toBbsEngagementPoints(graphQuery.data?.dataModel),
    [graphQuery.data?.dataModel],
  );

  const yScale = useMemo(() => toYScale(points), [points]);

  return (
    <IncidentGlassCard
      paddingClassName="p-6"
      className={["min-w-0", className].filter(Boolean).join(" ")}
      incidentGlassCardClassName="gap-4"
    >
      <header className="flex flex-col gap-0.5">
        <h3 className="text-ehs-dark-bg text-lg font-bold">Engagement</h3>
        <p className="text-ehs-muted-text text-sm">
          {`Sessions logged · ${String(weeks)} weeks`}
        </p>
      </header>

      {/* Grows to fill the card so it matches the neighbouring card's height. */}
      <div className="min-h-40 min-w-0 flex-1 sm:min-h-52">
        {graphQuery.isPending && points.length === 0 ? (
          <p className="text-ehs-muted-text text-sm">Loading…</p>
        ) : (
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
                interval="preserveStartEnd"
                minTickGap={16}
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

              {/* Safe observations carry the area fill, matching the design. */}
              <Area
                type="linear"
                dataKey="safe"
                stroke={SAFE_COLOR}
                strokeWidth={2}
                fill={SAFE_COLOR}
                fillOpacity={0.08}
                dot={{
                  r: 4,
                  fill: "#ffffff",
                  stroke: SAFE_COLOR,
                  strokeWidth: 2,
                }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
              <Line
                type="linear"
                dataKey="atRisk"
                stroke={AT_RISK_COLOR}
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: "#ffffff",
                  stroke: AT_RISK_COLOR,
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
        <LegendItem color={SAFE_COLOR} label="Safe Observations" />
        <LegendItem color={AT_RISK_COLOR} label="At Risk Observations" />
      </div>
    </IncidentGlassCard>
  );
}
