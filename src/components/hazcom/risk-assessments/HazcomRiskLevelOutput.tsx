import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  hazcomRiskLevel,
  hazcomRiskScore,
  riskLevelTone,
  type HazcomBadgeTone,
  type HazcomHazardRatings,
} from "@/components/hazcom/shared";

export type HazcomRiskLevelOutputProps = Readonly<{
  ratings: HazcomHazardRatings;
  ppe: readonly string[];
  className?: string;
}>;

const MAX_SCORE = 16;
const MAX_RATING = 4;

const LEVEL_TEXT_CLASS: Record<HazcomBadgeTone, string> = {
  success: "text-ehs-green",
  warn: "text-ehs-yellow",
  danger: "text-ehs-red",
  neutral: "text-ehs-gray",
  teal: "text-ehs-dark-blue",
  muted: "text-ehs-gray",
};

const LEVEL_BAR_CLASS: Record<HazcomBadgeTone, string> = {
  success: "bg-ehs-green",
  warn: "bg-ehs-yellow",
  danger: "bg-ehs-red",
  neutral: "bg-ehs-gray",
  teal: "bg-ehs-dark-blue",
  muted: "bg-ehs-gray",
};

const RATING_ROWS = [
  { field: "health", label: "Health" },
  { field: "flammability", label: "Flammability" },
  { field: "reactivity", label: "Reactivity" },
  { field: "ppeIndex", label: "PPE Index" },
] as const;

export function HazcomRiskLevelOutput(
  props: Readonly<HazcomRiskLevelOutputProps>,
) {
  const { ratings, ppe, className = "" } = props;

  const score = hazcomRiskScore(ratings);
  const level = hazcomRiskLevel(score);
  const tone = riskLevelTone(level);
  const scoreFillPercent = Math.min(100, (score / MAX_SCORE) * 100);

  return (
    <div
      className={["flex w-full flex-col gap-4", className]
        .filter(Boolean)
        .join(" ")}
    >
      <IncidentGlassCard paddingClassName="p-4.5 sm:p-5" className="w-full">
        <Text as="p" className="text8 text-ehs-muted-text text-center">
          Risk Level Output
        </Text>

        <Text
          as="p"
          className={["text2 mt-1.5 text-center", LEVEL_TEXT_CLASS[tone]].join(
            " ",
          )}
        >
          {level}
        </Text>

        <Text as="p" className="text8 text-ehs-muted-text mt-1 text-center">
          {`Score: ${String(score)} / ${String(MAX_SCORE)}`}
        </Text>

        <div className="bg-ehs-dark-bg/10 mt-4 h-1.5 w-full rounded-full">
          <div
            className={[
              "h-1.5 rounded-full transition-all",
              LEVEL_BAR_CLASS[tone],
            ].join(" ")}
            style={{ width: `${String(scoreFillPercent)}%` }}
          />
        </div>

        <div className="text8 mt-2.5 flex items-center justify-between">
          <span className="text-ehs-green">Low</span>
          <span className="text-ehs-yellow">Medium</span>
          <span className="text-ehs-red">High</span>
          <span className="text-ehs-red">Critical</span>
        </div>
      </IncidentGlassCard>

      <IncidentGlassCard paddingClassName="p-4.5 sm:p-5" className="w-full">
        <Text as="h3" className="text3 text-ehs-darker">
          Rating Breakdown
        </Text>

        <div className="mt-3 flex flex-col gap-2.5">
          {RATING_ROWS.map((row) => {
            const value = ratings[row.field];
            const fillPercent = (value / MAX_RATING) * 100;

            return (
              <div key={row.field} className="flex items-center gap-3">
                <span className="text8 text-ehs-muted-text w-21 shrink-0">
                  {row.label}
                </span>
                <div className="bg-ehs-dark-bg/8 h-1.5 flex-1 rounded-full">
                  <div
                    className="bg-ehs-dark-bg/25 h-1.5 rounded-full"
                    style={{ width: `${String(fillPercent)}%` }}
                  />
                </div>
                <span
                  className={[
                    "text7 w-3 shrink-0 text-right tabular-nums",
                    row.field === "health"
                      ? "text-ehs-red"
                      : "text-ehs-darker",
                  ].join(" ")}
                >
                  {String(value)}
                </span>
              </div>
            );
          })}
        </div>
      </IncidentGlassCard>

      <IncidentGlassCard paddingClassName="p-4.5 sm:p-5" className="w-full">
        <Text as="h3" className="text3 text-ehs-darker">
          {`Selected PPE (${String(ppe.length)})`}
        </Text>

        {ppe.length === 0 ? (
          <Text as="p" className="text8 text-ehs-muted-text mt-2">
            None selected
          </Text>
        ) : (
          <ul className="mt-2.5 flex flex-col gap-1.5">
            {ppe.map((item) => (
              <li
                key={item}
                className="text8 text-ehs-darker flex items-center gap-1.5"
              >
                <Icon
                  icon="mdi:circle-outline"
                  className="text-ehs-normal-blue size-2.5 shrink-0"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        )}
      </IncidentGlassCard>
    </div>
  );
}
