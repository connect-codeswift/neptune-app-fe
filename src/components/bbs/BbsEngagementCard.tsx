"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { TrendChartSkeleton } from "@/components/DashboardSkeletons";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  DEFAULT_BBS_GRAPH_WEEKS,
  useBbsGraphQuery,
} from "@/hooks/use-bbs-queries";
import { toBbsEngagementPoints } from "@/lib/map-bbs";

/**
 * Recharts is ~340 KB of this route's client JS. Loading the chart on demand
 * keeps it out of the initial bundle; the card's shell renders immediately.
 * Nothing may be statically imported from the chart module, or the library is
 * pulled straight back into this route's chunk.
 */
const BbsEngagementChart = dynamic(
  () => import("./BbsEngagementChart").then((m) => m.BbsEngagementChart),
  {
    ssr: false,
    // A chart-shaped skeleton, not a line of text: this is a page-load wait,
    // and holding the chart's footprint stops the card collapsing and
    // reflowing when the deferred chunk lands.
    loading: () => <TrendChartSkeleton />,
  },
);

/** Owned here so the legend below and the chart cannot drift apart. */
const SAFE_COLOR = "#0891a6";
const AT_RISK_COLOR = "#ef4444";

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
          <BbsEngagementChart
            points={points}
            yScale={yScale}
            safeColor={SAFE_COLOR}
            atRiskColor={AT_RISK_COLOR}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <LegendItem color={SAFE_COLOR} label="Safe Observations" />
        <LegendItem color={AT_RISK_COLOR} label="At Risk Observations" />
      </div>
    </IncidentGlassCard>
  );
}
