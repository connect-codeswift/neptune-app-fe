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
import { useCapaOpenedVsClosedQuery } from "@/hooks/use-capa-queries";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { mapCapaOpenedClosedToView } from "@/services/mappers/capa-opened-closed.mapper";

/* Recharts puts these straight onto SVG *presentation attributes* (`fill=`,
   `stroke=`), where `var()` is not valid - the browser drops the attribute and
   the mark falls back to the SVG default. They stay literal. */
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
    <div className="border-ehs-border bg-ehs-surface rounded-lg border px-3 py-2 shadow-(--ehs-shadow-tooltip)">
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

function ChartSkeleton() {
  return (
    <div
      className="bg-ehs-border/40 h-45 w-full animate-pulse rounded-lg"
      aria-hidden
    />
  );
}

/** Opened vs closed trend — Figma 7123:42070. Loads GET /api/v1/capas/opened-vs-closed. */
export function CapaOpenedClosedCard() {
  const hasToken = useHasAccessToken();
  const { data, isPending, isError } = useCapaOpenedVsClosedQuery(
    hasToken === true,
  );

  const view = data ?? mapCapaOpenedClosedToView(null);

  const points = view.points;
  const yMax = useMemo(() => {
    const peak = points.reduce(
      (highest, point) => Math.max(highest, point.opened, point.closed),
      0,
    );
    return Math.max(4, Math.ceil(peak / 2) * 2);
  }, [points]);

  const showSkeleton =
    hasToken === null || (hasToken === true && isPending && !data);

  const subtitle =
    isError && !data
      ? "Unable to load trend"
      : `Last ${String(view.weekCount)} weeks · ${String(view.totalOpened)} opened · ${String(view.totalClosed)} closed`;

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
            {showSkeleton ? "Loading…" : subtitle}
          </Text>
        </div>
        {!showSkeleton &&
          (view.closingFaster ? (
            <span className="bg-ehs-green/12 text-ehs-green inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-sm font-semibold">
              <Icon icon="mdi:trending-down" className="size-4" aria-hidden />
              Closing faster
            </span>
          ) : (
            <span className="bg-ehs-blue/12 text-ehs-blue inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-sm font-semibold">
              <Icon icon="mdi:trending-up" className="size-4" aria-hidden />
              Opening faster
            </span>
          ))}
      </div>

      <div className="h-45 w-full min-w-0">
        {showSkeleton ? (
          <ChartSkeleton />
        ) : (
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
        )}
      </div>

      <div className="mt-2 flex items-center gap-5">
        <div className="flex items-center gap-2">
          <span
            className="rounded-0.5 size-2"
            style={{ backgroundColor: OPENED_COLOR }}
            aria-hidden
          />
          <span className="text-ehs-gray text-sm">Opened</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="rounded-0.5 size-2"
            style={{ backgroundColor: CLOSED_COLOR }}
            aria-hidden
          />
          <span className="text-ehs-gray text-sm">Closed</span>
        </div>
      </div>
    </IncidentGlassCard>
  );
}
