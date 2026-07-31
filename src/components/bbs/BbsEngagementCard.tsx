"use client";

import { useState } from "react";
import { IncidentGlassCard } from "@/components/incidents";
import type { EngagementPoint } from "@/app/dashboard/bbs/bbs-data";

const SAFE_COLOR = "#0891a6";
const AT_RISK_COLOR = "#ef4444";

/** Plot geometry in viewBox units; the SVG scales to its container. */
const WIDTH = 560;
const HEIGHT = 210;
const PAD_LEFT = 30;
const PAD_RIGHT = 10;
const PAD_TOP = 12;
const PAD_BOTTOM = 28;

const PLOT_WIDTH = WIDTH - PAD_LEFT - PAD_RIGHT;
const PLOT_HEIGHT = HEIGHT - PAD_TOP - PAD_BOTTOM;

/** Fixed domain and ticks, matching the design's scale. */
const Y_MAX = 18;
const Y_TICKS = [17, 13, 9, 4];

function xAt(index: number, count: number): number {
  if (count <= 1) return PAD_LEFT + PLOT_WIDTH / 2;
  return PAD_LEFT + (PLOT_WIDTH * index) / (count - 1);
}

function yAt(value: number): number {
  return PAD_TOP + PLOT_HEIGHT * (1 - value / Y_MAX);
}

function toLine(points: readonly EngagementPoint[], key: "safe" | "atRisk") {
  return points
    .map((point, index) => `${xAt(index, points.length)},${yAt(point[key])}`)
    .join(" ");
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

export type BbsEngagementCardProps = Readonly<{
  points: readonly EngagementPoint[];
  className?: string;
}>;

export function BbsEngagementCard(props: BbsEngagementCardProps) {
  const { points, className = "" } = props;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const count = points.length;
  const active = activeIndex === null ? null : points[activeIndex];

  /** Map a pointer position to the nearest data point. */
  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (bounds.width === 0) return;

    // Work in viewBox units so the maths matches the plot geometry.
    const x = ((event.clientX - bounds.left) / bounds.width) * WIDTH;
    const ratio = (x - PAD_LEFT) / PLOT_WIDTH;
    const index = Math.round(ratio * (count - 1));
    setActiveIndex(Math.min(Math.max(index, 0), count - 1));
  };

  const areaPath = `M ${String(PAD_LEFT)},${String(PAD_TOP + PLOT_HEIGHT)} L ${toLine(
    points,
    "safe",
  ).replace(/ /g, " L ")} L ${String(PAD_LEFT + PLOT_WIDTH)},${String(
    PAD_TOP + PLOT_HEIGHT,
  )} Z`;

  return (
    <IncidentGlassCard
      paddingClassName="p-6"
      className={["min-w-0", className].filter(Boolean).join(" ")}
      incidentGlassCardClassName="gap-4"
    >
      <header className="flex flex-col gap-0.5">
        <h3 className="text-ehs-dark-bg text-lg font-bold">Engagement</h3>
        <p className="text-ehs-muted-text text-sm">Sessions logged · 8 weeks</p>
      </header>

      <div
        className="relative min-w-0"
        onMouseMove={handleMove}
        onMouseLeave={() => {
          setActiveIndex(null);
        }}
      >
        <svg
          viewBox={`0 0 ${String(WIDTH)} ${String(HEIGHT)}`}
          className="h-auto w-full"
          role="img"
          aria-label="Safe and at-risk observations logged over the last 8 weeks"
        >
          {/* Gridlines + y-axis ticks — recessive, behind the marks. */}
          {Y_TICKS.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD_LEFT}
                y1={yAt(tick)}
                x2={PAD_LEFT + PLOT_WIDTH}
                y2={yAt(tick)}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={PAD_LEFT - 8}
                y={yAt(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-ehs-muted-text"
                fontSize="10"
              >
                {tick}
              </text>
            </g>
          ))}

          {/* Area under the safe series. */}
          <path d={areaPath} fill={SAFE_COLOR} opacity="0.08" />

          {/* Crosshair sits under the marks so points stay legible. */}
          {activeIndex !== null ? (
            <line
              x1={xAt(activeIndex, count)}
              y1={PAD_TOP}
              x2={xAt(activeIndex, count)}
              y2={PAD_TOP + PLOT_HEIGHT}
              stroke="#8892a3"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          ) : null}

          <polyline
            points={toLine(points, "safe")}
            fill="none"
            stroke={SAFE_COLOR}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={toLine(points, "atRisk")}
            fill="none"
            stroke={AT_RISK_COLOR}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Markers: white core keeps them readable where the lines cross. */}
          {points.map((point, index) => (
            <g key={point.label}>
              <circle
                cx={xAt(index, count)}
                cy={yAt(point.safe)}
                r={activeIndex === index ? 4.5 : 3.5}
                fill="#ffffff"
                stroke={SAFE_COLOR}
                strokeWidth="2"
              />
              <circle
                cx={xAt(index, count)}
                cy={yAt(point.atRisk)}
                r={activeIndex === index ? 4.5 : 3.5}
                fill="#ffffff"
                stroke={AT_RISK_COLOR}
                strokeWidth="2"
              />
            </g>
          ))}

          {/* X-axis labels. */}
          {points.map((point, index) => (
            <text
              key={point.label}
              x={xAt(index, count)}
              y={HEIGHT - 8}
              textAnchor="middle"
              className="fill-ehs-muted-text"
              fontSize="10"
            >
              {point.label}
            </text>
          ))}
        </svg>

        {/* Tooltip — the series aren't directly labelled, so hover carries the values. */}
        {active ? (
          <div
            className="border-ehs-border pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-lg border bg-white px-3 py-2 shadow-[0px_8px_24px_-8px_rgba(15,23,42,0.28)]"
            style={{
              // Clamped so the centred tooltip can't overflow at either end.
              left: `${String(
                Math.min(
                  Math.max((xAt(activeIndex ?? 0, count) / WIDTH) * 100, 12),
                  88,
                ),
              )}%`,
            }}
          >
            <p className="text-ehs-dark-bg text-xs font-bold">{active.label}</p>
            <div className="mt-1 flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: SAFE_COLOR }}
                  aria-hidden="true"
                />
                <span className="text-ehs-gray text-xs">
                  {`Safe ${String(active.safe)}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: AT_RISK_COLOR }}
                  aria-hidden="true"
                />
                <span className="text-ehs-gray text-xs">
                  {`At risk ${String(active.atRisk)}`}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <LegendItem color={SAFE_COLOR} label="Safe Observations" />
        <LegendItem color={AT_RISK_COLOR} label="At Risk Observations" />
      </div>
    </IncidentGlassCard>
  );
}
