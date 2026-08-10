import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import type { RecordableChartViewModel } from "@/services/mappers/incident-dashboard.mapper";

export type RecordableInjuriesChartProps = Readonly<{
  chart: RecordableChartViewModel;
  className?: string;
}>;

const CHART = {
  width: 644,
  height: 188,
  padLeft: 28,
  padRight: 12,
  padTop: 12,
  padBottom: 28,
} as const;

function buildYTicks(yMax: number): readonly number[] {
  if (yMax <= 6) {
    return [0, 2, 3, 5, 6];
  }

  const mid = Math.round(yMax / 2);
  return [0, mid, yMax];
}

function getPoint(value: number, index: number, count: number, yMax: number) {
  const plotWidth = CHART.width - CHART.padLeft - CHART.padRight;
  const plotHeight = CHART.height - CHART.padTop - CHART.padBottom;
  const x = CHART.padLeft + (index / Math.max(count - 1, 1)) * plotWidth;
  const y = CHART.padTop + plotHeight - (value / yMax) * plotHeight;

  return { x, y };
}

function RecordablesLineChart(
  props: Readonly<{ chart: RecordableChartViewModel }>,
) {
  const { chart } = props;
  const { months, series, target, yMax } = chart;
  const count = Math.max(series.length, 1);
  const points = series.map((value, index) =>
    getPoint(value, index, count, yMax),
  );
  const targetY = target != null ? getPoint(target, 0, count, yMax).y : null;
  const yTicks = buildYTicks(yMax);

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

  const trendImproving =
    series.length >= 2 && (series.at(-1) ?? 0) <= (series.at(-2) ?? 0);

  return (
    <>
      <div className="mb-3.5 flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <Text
            as="h3"
            className="text-ehs-darker text-sm font-bold tracking-[-0.14px]"
          >
            Recordable injuries · 12 months
          </Text>
          <Text as="p" className="text-ehs-muted-text text-sm">
            Vs monthly target
          </Text>
        </div>

        {series.length >= 2 ? (
          <span
            className={[
              "inline-flex items-center gap-1.5 rounded-full px-[9px] py-[2.5px] text-sm font-bold",
              trendImproving
                ? "bg-ehs-green/14 text-ehs-green"
                : "bg-ehs-red/14 text-ehs-red",
            ].join(" ")}
          >
            <Icon
              icon={trendImproving ? "mdi:trending-down" : "mdi:trending-up"}
              className="text-sm"
              aria-hidden="true"
            />
            {trendImproving ? "Improving" : "Rising"}
          </span>
        ) : null}
      </div>

      <svg
        viewBox={`0 0 ${CHART.width} ${CHART.height}`}
        className="h-auto w-full"
        role="img"
        aria-label="Recordable injuries over 12 months"
      >
        {yTicks.map((tick) => {
          const y = getPoint(tick, 0, count, yMax).y;

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
                className="fill-ehs-muted-text text-xs"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {areaPath ? <path d={areaPath} fill="rgba(194, 85, 85, 0.1)" /> : null}

        {targetY != null ? (
          <>
            <line
              x1={CHART.padLeft}
              x2={CHART.width - CHART.padRight}
              y1={targetY}
              y2={targetY}
              className="stroke-ehs-green"
              strokeWidth="1.5"
            />
            {series.map((_, index) => {
              const point = getPoint(target ?? 0, index, count, yMax);

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
          </>
        ) : null}

        {linePath ? (
          <path
            d={linePath}
            fill="none"
            className="stroke-ehs-red"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

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

        {months.map((month, index) => {
          const point = getPoint(0, index, count, yMax);

          return (
            <text
              key={`${month}-${index}`}
              x={point.x}
              y={CHART.height - 8}
              textAnchor="middle"
              className="fill-ehs-muted-text text-xs"
            >
              {month}
            </text>
          );
        })}
      </svg>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="text-ehs-gray inline-flex items-center gap-1.5 text-sm">
          <span
            className="bg-ehs-normal-blue size-2 rounded-[2px]"
            aria-hidden="true"
          />
          Recordables
        </span>
        {target != null ? (
          <span className="text-ehs-gray inline-flex items-center gap-1.5 text-sm">
            <span
              className="bg-ehs-green size-2 rounded-[2px]"
              aria-hidden="true"
            />
            Monthly target
          </span>
        ) : null}
      </div>
    </>
  );
}

export function RecordableInjuriesChart(
  props: Readonly<RecordableInjuriesChartProps>,
) {
  const { chart, className = "" } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-[23px]"
      className={["min-h-[308px]", className].filter(Boolean).join(" ")}
    >
      <RecordablesLineChart chart={chart} />
    </IncidentGlassCard>
  );
}
