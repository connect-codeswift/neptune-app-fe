import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import type { InjuryMixItem } from "@/services/mappers/incident-dashboard.mapper";

export type InjuryMixCardProps = Readonly<{
  items: readonly InjuryMixItem[];
  total: number;
  className?: string;
}>;

const SIZE = 132;
const STROKE = 18;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const injuryMixCardShellClass =
  "border-ehs-hairline/90 bg-ehs-surface/62 backdrop-blur-2.5";

function DonutChart(
  props: Readonly<{ items: readonly InjuryMixItem[]; total: number }>,
) {
  const { items, total } = props;
  const mixTotal = items.reduce((sum, item) => sum + item.value, 0);
  const hasMixData = mixTotal > 0;

  const segments = hasMixData
    ? items.reduce<
        ReadonlyArray<{
          label: string;
          color: string;
          length: number;
          offset: number;
        }>
      >((accumulated, item) => {
        const length = (item.value / mixTotal) * CIRCUMFERENCE;
        const offset = accumulated.reduce(
          (sum, segment) => sum + segment.length,
          0,
        );

        return [
          ...accumulated,
          {
            label: item.label,
            color: item.color,
            length,
            offset,
          },
        ];
      }, [])
    : [];

  return (
    <div className="relative size-33 shrink-0">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="size-full -rotate-90"
        role="img"
        aria-label="Recordable injury mix"
      >
        {hasMixData ? (
          segments.map((segment) => (
            <circle
              key={segment.label}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={segment.color}
              strokeWidth={STROKE}
              strokeDasharray={`${segment.length} ${CIRCUMFERENCE - segment.length}`}
              strokeDashoffset={-segment.offset}
              strokeLinecap="butt"
            />
          ))
        ) : (
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            /* Literal: `var()` is not valid in an SVG presentation attribute. */
            stroke="rgba(136, 146, 163, 0.18)"
            strokeWidth={STROKE}
            aria-hidden="true"
          />
        )}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <Text
          as="p"
          className="text-ehs-dark-bg text-6.5 pt-0.5 pb-0.75 leading-normal font-bold tracking-[-0.52px] tabular-nums"
        >
          {new Intl.NumberFormat("en-US").format(total)}
        </Text>
        <Text
          as="p"
          className="text-ehs-muted-text text-2.5 py-px leading-normal font-normal tracking-[0.8px] uppercase"
        >
          RECORD.
        </Text>
      </div>
    </div>
  );
}

export function InjuryMixCard(props: Readonly<InjuryMixCardProps>) {
  const { items, total, className = "" } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-4.75"
      className={[injuryMixCardShellClass, className].filter(Boolean).join(" ")}
    >
      <div className="pb-3.5">
        <Text
          as="h3"
          className="text-ehs-dark-bg text-3.5 pt-px pb-0.5 leading-normal font-bold tracking-[-0.14px]"
        >
          Recordable injury mix
        </Text>
        <Text
          as="p"
          className="text-ehs-muted-text py-px text-[11px] leading-normal"
        >
          Composition of recordable outcomes
        </Text>
      </div>

      <div className="flex flex-col items-start gap-5.5 md:flex-row md:items-center">
        <DonutChart items={items} total={total} />

        <div className="grid w-full min-w-0 grid-cols-2 gap-x-2 gap-y-2 md:flex-1">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex h-3.5 min-w-0 items-center gap-2"
            >
              <span
                className="rounded-0.5 size-2 shrink-0"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              <Text
                as="span"
                className="text-ehs-slate min-w-0 flex-1 truncate py-px text-xs leading-normal"
              >
                {item.label}
              </Text>
              <Text
                as="span"
                className="text-ehs-gray shrink-0 py-px text-xs leading-normal font-bold tabular-nums"
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
