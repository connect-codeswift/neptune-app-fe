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
  "border-white/90 bg-[rgba(255,255,255,0.62)] backdrop-blur-[10px]";

function DonutChart(props: Readonly<{ items: readonly InjuryMixItem[]; total: number }>) {
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
    <div className="relative size-[132px] shrink-0">
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
            stroke="rgba(136, 146, 163, 0.18)"
            strokeWidth={STROKE}
            aria-hidden="true"
          />
        )}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-[2px]">
        <Text
          as="p"
          className="text-ehs-dark-bg pt-[2px] pb-[3px] text-[26px] leading-normal font-bold tracking-[-0.52px] tabular-nums"
        >
          {new Intl.NumberFormat("en-US").format(total)}
        </Text>
        <Text
          as="p"
          className="text-ehs-muted-text py-px text-[10px] leading-normal font-normal tracking-[0.8px] uppercase"
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
      paddingClassName="p-[19px]"
      className={[injuryMixCardShellClass, className].filter(Boolean).join(" ")}
    >
      <div className="pb-[14px]">
        <Text
          as="h3"
          className="text-ehs-dark-bg pb-[2px] pt-px text-[14px] leading-normal font-bold tracking-[-0.14px]"
        >
          Recordable injury mix
        </Text>
        <Text
          as="p"
          className="text-ehs-muted-text py-px text-[10.8px] leading-normal"
        >
          Composition of recordable outcomes
        </Text>
      </div>

      <div className="flex flex-wrap items-center gap-[22px]">
        <DonutChart items={items} total={total} />

        <div className="grid min-w-0 flex-1 grid-cols-1 gap-x-2 gap-y-2 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex h-[14px] min-w-0 items-center gap-2"
            >
              <span
                className="size-2 shrink-0 rounded-[2px]"
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
