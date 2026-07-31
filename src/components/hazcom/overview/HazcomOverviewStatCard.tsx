import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { HazcomGlassCard } from "@/components/hazcom/shared";

export type HazcomOverviewStatTone = "neutral" | "danger";

export type HazcomOverviewStatCardProps = Readonly<{
  label: string;
  value: number;
  icon: string;
  caption: string;
  tone?: HazcomOverviewStatTone;
  className?: string;
}>;

const valueClassByTone: Record<HazcomOverviewStatTone, string> = {
  neutral: "text-ehs-darker",
  danger: "text-ehs-red",
};

const iconClassByTone: Record<HazcomOverviewStatTone, string> = {
  neutral: "text-ehs-gray",
  danger: "text-ehs-red",
};

export function HazcomOverviewStatCard(
  props: Readonly<HazcomOverviewStatCardProps>,
) {
  const { label, value, icon, caption, tone = "neutral", className = "" } =
    props;

  return (
    <HazcomGlassCard
      paddingClassName="p-5"
      className={["min-w-0", className].filter(Boolean).join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <Text as="p" className="text-ehs-gray text-sm">
          {label}
        </Text>
        <Icon
          icon={icon}
          className={["size-4.5 shrink-0", iconClassByTone[tone]].join(" ")}
          aria-hidden="true"
        />
      </div>

      <Text
        as="p"
        className={[
          "mt-2 text-[32px] leading-none font-bold tabular-nums",
          valueClassByTone[tone],
        ].join(" ")}
      >
        {String(value)}
      </Text>

      <Text as="p" className="text-ehs-muted-text mt-2 text-xs">
        {caption}
      </Text>
    </HazcomGlassCard>
  );
}
