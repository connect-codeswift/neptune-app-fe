/**
 * Pixel-matched loading skeleton for Regulatory Compliance.
 * Source: Figma `compliance-skeleton` (4818:19203).
 *
 * AppShell already renders the real sidebar — this covers MainWorkspace only
 * (header → KPIs → table + insights), matching policy-maker's content-skeleton pattern.
 */

import type { ReactNode } from "react";

import { MetricCardsRowSkeleton } from "@/components/ui/MetricCard";

type BarProps = Readonly<{
  className?: string;
  opacity?: number;
}>;

function Bar(props: BarProps) {
  const { className = "", opacity = 1 } = props;
  return (
    <div
      aria-hidden="true"
      className={["rounded-1.5 animate-pulse bg-[#e2e8f0]", className]
        .filter(Boolean)
        .join(" ")}
      style={{ opacity }}
    />
  );
}

type GlassPanelProps = Readonly<{
  children: ReactNode;
  className?: string;
}>;

function GlassPanel(props: GlassPanelProps) {
  const { children, className = "" } = props;
  return (
    <div
      className={[
        "rounded-5 backdrop-blur-2.5 border border-white/90 bg-white/62 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.08)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

function TableHeaderSkeleton() {
  return (
    <div className="flex items-start gap-2.5 bg-[rgba(15,23,42,0.02)] px-3.5 py-3.5">
      <Bar className="h-2.5 w-15" />
      <Bar className="h-2.5 w-30" />
      <Bar className="h-2.5 w-20" />
      <Bar className="h-2.5 w-17.5" />
      <Bar className="h-2.5 w-15" />
    </div>
  );
}

function TableRowSkeleton(props: Readonly<{ muted?: boolean }>) {
  const { muted = false } = props;
  return (
    <div className="flex items-start gap-2.5 border-b border-[rgba(15,23,42,0.05)] px-3.5 py-3.5">
      <Bar className="h-2.5 w-12.5" opacity={muted ? 0.6 : 1} />
      <Bar className="h-2.5 w-35" opacity={muted ? 0.8 : 1} />
      <Bar className="h-2.5 w-17.5" opacity={muted ? 0.6 : 1} />
      <Bar className="h-2.5 w-15" opacity={muted ? 0.8 : 1} />
      <Bar className="h-2.5 w-15" opacity={muted ? 0.4 : 1} />
    </div>
  );
}

function ProgressRowSkeleton() {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start justify-between">
        <Bar className="h-2 w-20" />
        <Bar className="h-2 w-7.5" />
      </div>
      <Bar className="rounded-0.75 h-1.5 w-full" />
    </div>
  );
}

/**
 * Full-page loading placeholder for Regulatory Compliance.
 * Mirrors Figma `compliance-skeleton` (4818:19203) including header, KPIs,
 * table and stacked insight cards.
 */
export function RegulatoryCompliancePageSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4.5 px-4.5 pb-8">
      {/* Header — Figma 4818:19254 */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Bar className="h-5 w-60" />
          <Bar className="h-2.5 w-35" opacity={0.6} />
        </div>

        <div className="flex items-start gap-2">
          <div className="rounded-2.5 flex items-start border border-white/90 bg-white/62 px-3.5 py-2">
            <Bar className="h-3 w-27.5" />
          </div>
          <div className="rounded-2.5 flex items-start bg-[#0891a6] px-3.5 py-2">
            <Bar className="h-3 w-20 bg-white/90" />
          </div>
        </div>
      </div>

      {/* StatsGrid — Figma 4818:19263, gap 14px */}
      <MetricCardsRowSkeleton />

      {/* TablePane — Figma 4818:19289 */}
      <GlassPanel className="min-w-0 overflow-hidden p-px">
        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b border-[rgba(15,23,42,0.08)] p-4.5">
            <Bar className="h-3.5 w-30" />
            <div className="flex items-start gap-2">
              <Bar className="h-2.5 w-15" />
              <Bar className="h-2.5 w-15" />
            </div>
          </div>

          <TableHeaderSkeleton />

          <TableRowSkeleton />
          <TableRowSkeleton muted />
          <TableRowSkeleton muted />
        </div>
      </GlassPanel>

      {/* InsightsPane — Figma 4818:19332 */}
      <div className="flex min-w-0 flex-col gap-3.5">
        {/* ProgressCard — Figma 4818:19333 */}
        <GlassPanel className="flex min-w-0 flex-col gap-13 p-4.75">
          <Bar className="h-3 w-35" />
          <div className="flex flex-col gap-13">
            <ProgressRowSkeleton />
            <ProgressRowSkeleton />
            <ProgressRowSkeleton />
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
