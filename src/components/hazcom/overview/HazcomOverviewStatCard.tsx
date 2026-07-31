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

const iconWrapClassByTone: Record<HazcomOverviewStatTone, string> = {
  neutral: "bg-ehs-dark-bg/8 text-ehs-gray",
  danger: "bg-ehs-red/12 text-ehs-red",
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
        <span
          className={[
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            iconWrapClassByTone[tone],
          ].join(" ")}
        >
          <Icon icon={icon} className="text-base" aria-hidden="true" />
        </span>
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
