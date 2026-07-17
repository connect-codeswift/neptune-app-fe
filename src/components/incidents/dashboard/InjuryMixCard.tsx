import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  INJURY_MIX,
  INJURY_MIX_TOTAL,
} from "@/components/incidents/dashboard/incident-kpis-data";

export type InjuryMixCardProps = Readonly<{
  className?: string;
}>;

const SIZE = 132;
const STROKE = 18;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function DonutChart() {
  const total = INJURY_MIX.reduce((sum, item) => sum + item.value, 0);
  let offset = 0;

  return (
    <div className="relative size-[132px] shrink-0">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="size-full -rotate-90"
        role="img"
        aria-label="Recordable injury mix"
      >
        {INJURY_MIX.map((item) => {
          const length = (item.value / total) * CIRCUMFERENCE;
          const segment = (
            <circle
              key={item.label}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={item.color}
              strokeWidth={STROKE}
              strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += length;
          return segment;
        })}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Text
          as="p"
          className="text-ehs-darker text-[28px] leading-none font-semibold tabular-nums"
        >
          {String(INJURY_MIX_TOTAL)}
        </Text>
        <Text
          as="p"
          className="text-ehs-muted-text mt-1 text-[10px] font-semibold tracking-[0.08em]"
        >
          RECORD.
        </Text>
      </div>
    </div>
  );
}

export function InjuryMixCard(props: Readonly<InjuryMixCardProps>) {
  const { className = "" } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-[19px]"
      className={["min-h-auto", className].filter(Boolean).join(" ")}
    >
      <div className="mb-4 flex flex-col gap-0.5">
        <Text
          as="h3"
          className="text-ehs-darker text-[14px] font-bold tracking-[-0.14px]"
        >
          Recordable injury mix
        </Text>
        <Text as="p" className="text-ehs-muted-text text-[11px]">
          Composition of recordable outcomes
        </Text>
      </div>

      <div className="flex flex-1 flex-wrap items-center gap-6">
        <DonutChart />

        <div className="grid min-w-0 flex-1 grid-cols-1 gap-x-2 gap-y-[22px] sm:grid-cols-2">
          {INJURY_MIX.map((item) => (
            <div
              key={item.label}
              className="flex min-w-0 items-center gap-2"
            >
              <span
                className="size-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              <Text
                as="span"
                className="text-ehs-gray min-w-0 flex-1 truncate text-[12px]"
              >
                {item.label}
              </Text>
              <Text
                as="span"
                className="text-ehs-darker shrink-0 text-[12px] font-medium tabular-nums"
              >
                {String(item.value)}
              </Text>
            </div>
          ))}
        </div>
      </div>
    </IncidentGlassCard>
  );
}
