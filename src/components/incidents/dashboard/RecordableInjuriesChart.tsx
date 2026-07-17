import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/IncidentGlassCard";
import {
  RECORDABLE_MONTHS,
  RECORDABLE_SERIES,
  RECORDABLE_TARGET,
} from "@/components/incidents/dashboard/incident-kpis-data";

export type RecordableInjuriesChartProps = Readonly<{
  className?: string;
}>;

const CHART = {
  width: 644,
  height: 188,
  padLeft: 28,
  padRight: 12,
  padTop: 12,
  padBottom: 28,
  yMax: 6,
} as const;

const Y_TICKS = [0, 2, 3, 5, 6] as const;

function getPoint(value: number, index: number, count: number) {
  const plotWidth = CHART.width - CHART.padLeft - CHART.padRight;
  const plotHeight = CHART.height - CHART.padTop - CHART.padBottom;
  const x = CHART.padLeft + (index / (count - 1)) * plotWidth;
  const y = CHART.padTop + plotHeight - (value / CHART.yMax) * plotHeight;

  return { x, y };
}

function RecordablesLineChart() {
  const count = RECORDABLE_SERIES.length;
  const points = RECORDABLE_SERIES.map((value, index) =>
    getPoint(value, index, count),
  );
  const targetY = getPoint(RECORDABLE_TARGET, 0, count).y;

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const first = points[0];
  const last = points.at(-1);
  const baseline = CHART.height - CHART.padBottom;
  const areaPath =
    first && last
      ? `${linePath} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`
      : "";

  return (
    <svg
      viewBox={`0 0 ${CHART.width} ${CHART.height}`}
      className="h-auto w-full"
      role="img"
      aria-label="Recordable injuries over 12 months"
    >
      {Y_TICKS.map((tick) => {
        const y = getPoint(tick, 0, count).y;

        return (
          <g key={tick}>
            <line
              x1={CHART.padLeft}
              x2={CHART.width - CHART.padRight}
              y1={y}
              y2={y}
              className="stroke-ehs-border"
              strokeWidth="1"
            />
            <text
              x={CHART.padLeft - 8}
              y={y + 3}
              textAnchor="end"
              className="fill-ehs-muted-text text-[10px]"
            >
              {tick}
            </text>
          </g>
        );
      })}

      {areaPath ? <path d={areaPath} fill="rgba(194, 85, 85, 0.1)" /> : null}

      <line
        x1={CHART.padLeft}
        x2={CHART.width - CHART.padRight}
        y1={targetY}
        y2={targetY}
        className="stroke-ehs-green"
        strokeWidth="1.5"
      />

      {RECORDABLE_SERIES.map((_, index) => {
        const point = getPoint(RECORDABLE_TARGET, index, count);

        return (
          <circle
            key={`target-${index}`}
            cx={point.x}
            cy={point.y}
            r="2.5"
            className="stroke-ehs-green fill-white"
          />
        );
      })}

      <path
        d={linePath}
        fill="none"
        className="stroke-ehs-red"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {points.map((point, index) => (
        <circle
          key={`point-${index}`}
          cx={point.x}
          cy={point.y}
          r="3"
          className="stroke-ehs-normal-blue fill-white"
          strokeWidth="1.5"
        />
      ))}

      {RECORDABLE_MONTHS.map((month, index) => {
        const point = getPoint(0, index, count);

        return (
          <text
            key={month}
            x={point.x}
            y={CHART.height - 8}
            textAnchor="middle"
            className="fill-ehs-muted-text text-[10px]"
          >
            {month}
          </text>
        );
      })}
    </svg>
  );
}

export function RecordableInjuriesChart(
  props: Readonly<RecordableInjuriesChartProps>,
) {
  const { className = "" } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-[23px]"
      className={["min-h-[308px]", className].filter(Boolean).join(" ")}
    >
      <div className="mb-[14px] flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <Text
            as="h3"
            className="text-ehs-darker text-[14px] font-bold tracking-[-0.14px]"
          >
            Recordable injuries · 12 months
          </Text>
          <Text as="p" className="text-ehs-muted-text text-[11px]">
            Vs monthly target
          </Text>
        </div>

        <span className="bg-ehs-green/14 text-ehs-green inline-flex items-center gap-1.5 rounded-full px-[9px] py-[2.5px] text-[11px] font-bold">
          <Icon
            icon="mdi:trending-down"
            className="text-[11px]"
            aria-hidden="true"
          />
          Improving
        </span>
      </div>

      <RecordablesLineChart />

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="text-ehs-gray inline-flex items-center gap-1.5 text-[11px]">
          <span
            className="bg-ehs-normal-blue size-2 rounded-[2px]"
            aria-hidden="true"
          />
          Recordables
        </span>
        <span className="text-ehs-gray inline-flex items-center gap-1.5 text-[11px]">
          <span
            className="bg-ehs-green size-2 rounded-[2px]"
            aria-hidden="true"
          />
          Monthly target
        </span>
      </div>
    </IncidentGlassCard>
  );
}
