import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";

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
      paddingClassName="px-4 py-4"
      className={["min-w-0", className].filter(Boolean).join(" ")}
    >
      <div className="flex min-h-[72px] flex-col">
        <div className="flex items-center justify-between gap-3">
          <Text as="p" className="text6 text-ehs-muted-text">
            {title}
          </Text>

          {trendValue ? (
            <span
              className={[
                "text8 inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 font-bold tracking-wide",
                trendToneClass[trendTone],
              ].join(" ")}
            >
              {trendValue}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 items-center pt-2">
          <Text as="p" className="text2 text-ehs-darker">
            {String(value)}
          </Text>
        </div>
      </div>
    </IncidentGlassCard>
  );
}
