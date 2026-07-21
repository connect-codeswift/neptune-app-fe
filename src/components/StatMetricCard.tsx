import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/IncidentGlassCard";

export type StatMetricTone = "positive" | "negative";

export type StatMetricCardProps = Readonly<{
  title: string;
  value: string | number;
  /** Omit to hide the trend badge (e.g. when the API returns no delta). */
  trendValue?: string;
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
      paddingClassName="p-4"
      className={["min-w-0", className].filter(Boolean).join(" ")}
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <Text
            as="p"
            className="text-ehs-muted-text py-px text-xs font-bold tracking-wide uppercase"
          >
            {title}
          </Text>

          {trendValue ? (
            <span
              className={[
                "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide",
                trendToneClass[trendTone],
              ].join(" ")}
            >
              {trendValue}
            </span>
          ) : null}
        </div>

        <Text
          as="p"
          className="text-ehs-darker text-3xl leading-none tracking-tight tabular-nums"
        >
          {String(value)}
        </Text>
      </div>
    </IncidentGlassCard>
  );
}
