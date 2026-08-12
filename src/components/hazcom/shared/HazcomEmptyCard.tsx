import { Icon } from "@iconify/react";
import type { ReactNode } from "react";
import { Text } from "@/components/Text";
import { HazcomGlassCard } from "@/components/hazcom/shared/HazcomGlassCard";

export type HazcomEmptyCardProps = Readonly<{
  /** Iconify name, drawn muted — see the tone note below. */
  icon: string;
  title: string;
  message: string;
  /** The way out of the empty state, e.g. a link to the create page. */
  action?: ReactNode;
  className?: string;
}>;

/**
 * Shown when a HazCom query succeeded and came back empty.
 *
 * Distinct from HazcomErrorCard on purpose: that one is for "couldn't load",
 * and draws a red alert glyph. An empty inventory is a normal state, not a
 * fault, so this reads muted and offers the action that fills it. Rendering the
 * error card here told the user something had gone wrong when nothing had.
 */
export function HazcomEmptyCard(props: Readonly<HazcomEmptyCardProps>) {
  const { icon, title, message, action, className = "" } = props;

  return (
    <HazcomGlassCard
      className={["min-h-55 text-center", className]
        .filter(Boolean)
        .join(" ")}
      hazcomGlassCardClassName="items-center justify-center gap-3"
    >
      <Icon
        icon={icon}
        className="text-ehs-muted-text size-10"
        aria-hidden="true"
      />
      <Text as="p" className="text3 text-ehs-darker">
        {title}
      </Text>
      <Text as="p" className="text4 text-ehs-muted-text max-w-sm">
        {message}
      </Text>
      {action}
    </HazcomGlassCard>
  );
}
