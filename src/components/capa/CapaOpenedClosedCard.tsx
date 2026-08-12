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
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents";
import { Text } from "@/components/Text";
import { CAPA_OPENED_CLOSED_TREND } from "@/components/capa/capa-dashboard-data";

const OPENED_COLOR = "#3b82f6";
const CLOSED_COLOR = "#10b981";
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
        <span className="text-ehs-gray text-xs">
          {`Opened ${String(valueOf("opened"))}`}
        </span>
        <span className="text-ehs-gray text-xs">
          {`Closed ${String(valueOf("closed"))}`}
        </span>
      </div>
    </div>
  );
}

/** Opened vs closed trend — Figma 7123:42070. */
export function CapaOpenedClosedCard() {
  const points = CAPA_OPENED_CLOSED_TREND;
  const yMax = useMemo(() => {
    const peak = points.reduce(
      (highest, point) => Math.max(highest, point.opened, point.closed),
      0,
    );
    return Math.max(4, Math.ceil(peak / 2) * 2);
  }, [points]);

  return (
    <IncidentGlassCard paddingClassName="p-5.25" className="min-w-0">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Text
            as="h3"
            className="text-ehs-dark-bg text-lg font-bold tracking-[-0.14px]"
          >
            Opened vs Closed
          </Text>
          <Text as="p" className="text-ehs-muted-text text-xs">
            Last 8 weeks · trend converging
          </Text>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(16,185,129,0.12)] px-2.5 py-2 text-sm font-semibold text-[#10b981]">
          <Icon icon="mdi:trending-down" className="size-4" aria-hidden />
          Closing faster
        </span>
      </div>

      <div className="h-45 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={[...points]}
            margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
          >
            <CartesianGrid
              stroke="rgba(15,23,42,0.06)"
              vertical={false}
              strokeDasharray="0"
            />
            <XAxis
              dataKey="week"
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, yMax]}
              ticks={[0, 2, 4, yMax > 5 ? 5 : yMax, yMax].filter(
                (value, index, all) => all.indexOf(value) === index,
              )}
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="opened"
              stroke={OPENED_COLOR}
              fill={OPENED_COLOR}
              fillOpacity={0.12}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="closed"
              stroke={CLOSED_COLOR}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center gap-5">
        <div className="flex items-center gap-2">
          <span
            className="size-2 rounded-0.5"
            style={{ backgroundColor: OPENED_COLOR }}
            aria-hidden
          />
          <span className="text-ehs-gray text-sm">Opened</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="size-2 rounded-0.5"
            style={{ backgroundColor: CLOSED_COLOR }}
            aria-hidden
          />
          <span className="text-ehs-gray text-sm">Closed</span>
        </div>
      </div>
    </IncidentGlassCard>
  );
}
