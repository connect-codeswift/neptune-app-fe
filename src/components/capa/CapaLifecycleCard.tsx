"use client";

import { IncidentGlassCard } from "@/components/incidents";
import { Text } from "@/components/Text";
import {
  CAPA_LIFECYCLE_SLICES,
  type CapaLifecycleSlice,
} from "@/components/capa/capa-dashboard-data";

const SIZE = 140;
const STROKE = 18;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function LifecycleDonut(
  props: Readonly<{ slices: readonly CapaLifecycleSlice[]; total: number }>,
) {
  const { slices, total } = props;
  const mixTotal = slices.reduce((sum, slice) => sum + slice.value, 0);

  const segments = slices.reduce<
    ReadonlyArray<{
      label: string;
      color: string;
      length: number;
      offset: number;
    }>
  >((accumulated, slice) => {
    const length = mixTotal > 0 ? (slice.value / mixTotal) * CIRCUMFERENCE : 0;
    const offset = accumulated.reduce(
      (sum, segment) => sum + segment.length,
      0,
    );

    return [
      ...accumulated,
      {
        label: slice.label,
        color: slice.color,
        length,
        offset,
      },
    ];
  }, []);

  return (
    <div className="relative size-[140px] shrink-0">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="size-full -rotate-90"
        role="img"
        aria-label="CAPA lifecycle by stage"
      >
        {segments.map((segment) => (
          <circle
            key={segment.label}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={segment.color}
            strokeWidth={STROKE}
            strokeDasharray={`${String(segment.length)} ${String(CIRCUMFERENCE - segment.length)}`}
            strokeDashoffset={-segment.offset}
            strokeLinecap="butt"
          />
        ))}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Text
          as="p"
          className="text-ehs-dark-bg text-[28px] leading-none font-bold tabular-nums"
        >
          {String(total)}
        </Text>
        <Text
          as="p"
          className="text-ehs-muted-text mt-1 text-[10px] font-bold tracking-[0.8px] uppercase"
        >
          Total
        </Text>
      </div>
    </div>
  );
}

/** Lifecycle donut — Figma 7123:42023. */
export function CapaLifecycleCard() {
  const total = CAPA_LIFECYCLE_SLICES.reduce(
    (sum, slice) => sum + slice.value,
    0,
  );

  return (
    <IncidentGlassCard paddingClassName="p-[21px]" className="min-w-0">
      <div className="mb-5">
        <Text
          as="h3"
          className="text-ehs-dark-bg text-lg font-bold tracking-[-0.14px]"
        >
          Lifecycle
        </Text>
        <Text as="p" className="text-ehs-muted-text text-xs">
          By stage
        </Text>
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <LifecycleDonut slices={CAPA_LIFECYCLE_SLICES} total={total} />

        <ul className="flex min-w-0 flex-1 flex-col gap-3">
          {CAPA_LIFECYCLE_SLICES.map((slice) => (
            <li
              key={slice.label}
              className="flex items-center gap-2 text-[13px]"
            >
              <span
                className="size-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: slice.color }}
                aria-hidden="true"
              />
              <span className="text-ehs-slate min-w-0 flex-1 truncate text-sm">
                {slice.label}
              </span>
              <span className="text-ehs-darker text-sm font-semibold tabular-nums">
                {String(slice.value)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </IncidentGlassCard>
  );
}
