"use client";

import { IncidentGlassCard } from "@/components/incidents";
import { Text } from "@/components/Text";
import {
  CAPA_LIFECYCLE_SLICES,
  type CapaLifecycleSlice,
} from "@/components/capa/capa-dashboard-data";
import { useCapaLifecycleQuery } from "@/hooks/use-capa-queries";
import { useHasAccessToken } from "@/hooks/use-has-access-token";

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

function LifecycleCardSkeleton() {
  return (
    <IncidentGlassCard paddingClassName="p-[21px]" className="min-w-0">
      <div className="mb-5">
        <div className="bg-ehs-border/40 h-5 w-24 animate-pulse rounded" />
        <div className="bg-ehs-border/30 mt-2 h-3 w-16 animate-pulse rounded" />
      </div>
      <div className="flex flex-wrap items-center gap-5">
        <div className="bg-ehs-border/30 size-[140px] animate-pulse rounded-full" />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={`lifecycle-skeleton-${String(index)}`}
              className="bg-ehs-border/30 h-4 w-full animate-pulse rounded"
            />
          ))}
        </div>
      </div>
    </IncidentGlassCard>
  );
}

/** Lifecycle donut — Figma 7123:42023. Loads GET /api/CAPA/lifecycle. */
export function CapaLifecycleCard() {
  const hasToken = useHasAccessToken();
  const lifecycleQuery = useCapaLifecycleQuery(hasToken === true);

  if (hasToken === null || (hasToken && lifecycleQuery.isLoading)) {
    return <LifecycleCardSkeleton />;
  }

  const fallbackTotal = CAPA_LIFECYCLE_SLICES.reduce(
    (sum, slice) => sum + slice.value,
    0,
  );
  const slices = lifecycleQuery.data?.slices ?? CAPA_LIFECYCLE_SLICES;
  const total = lifecycleQuery.data?.total ?? fallbackTotal;

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
        <LifecycleDonut slices={slices} total={total} />

        <ul className="flex min-w-0 flex-1 flex-col gap-3">
          {slices.map((slice) => (
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
