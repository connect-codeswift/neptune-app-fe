import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/IncidentGlassCard";

export type StatMetricTone = "positive" | "negative";

export type StatMetricCardProps = Readonly<{
  title: string;
  value: string | number;
  trendValue: string;
  trendTone?: StatMetricTone;
  className?: string;
}>;

const trendToneClass: Record<StatMetricTone, string> = {
  positive: "bg-ehs-green/14 text-ehs-green",
  negative: "bg-ehs-red/14 text-ehs-red",
};

export function StatMetricCard(props: Readonly<StatMetricCardProps>) {
  const {
    title,
    value,
    trendValue,
    trendTone = "positive",
    className = "",
  } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-[17px]"
      className={["min-w-0", className].filter(Boolean).join(" ")}
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <Text
            as="p"
            className="text-ehs-muted-text py-px text-[11px] font-bold tracking-[0.2px] uppercase"
          >
            {title}
          </Text>

          <span
            className={[
              "inline-flex shrink-0 items-center rounded-full px-[9px] py-[2.5px] text-[10px] font-bold tracking-[0.2px]",
              trendToneClass[trendTone],
            ].join(" ")}
          >
            {trendValue}
          </span>
        </div>

        <Text
          as="p"
          className="text-ehs-darker text-[30px] leading-[29px] tracking-[-0.6px] tabular-nums"
        >
          {String(value)}
        </Text>
      </div>
    </IncidentGlassCard>
  );
}
