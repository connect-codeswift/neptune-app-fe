import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { HazcomGlassCard } from "@/components/hazcom/shared/HazcomGlassCard";

export type HazcomUnavailablePanelProps = Readonly<{
  title: string;
  /** What the panel will show, and what has to exist before it can. */
  message: string;
  className?: string;
}>;

/**
 * A panel whose figure the API cannot yet answer.
 *
 * Used where a designed dashboard card has no endpoint behind it. The card
 * keeps its title and its place in the grid so the layout doesn't shift when
 * the data lands, but it states plainly that the figure isn't available — the
 * alternative was a hard-coded number, and on a compliance dashboard an invented
 * "14 employees overdue" is worse than an admitted gap.
 */
export function HazcomUnavailablePanel(
  props: Readonly<HazcomUnavailablePanelProps>,
) {
  const { title, message, className = "" } = props;

  return (
    <HazcomGlassCard
      paddingClassName="p-5"
      className={["min-w-0", className].filter(Boolean).join(" ")}
    >
      <Text as="h2" className="text-ehs-darker text-base font-bold">
        {title}
      </Text>

      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
        <Icon
          icon="mdi:chart-box-outline"
          className="text-ehs-muted-text size-8"
          aria-hidden="true"
        />
        <Text as="p" className="text-ehs-muted-text max-w-xs text-sm">
          {message}
        </Text>
      </div>
    </HazcomGlassCard>
  );
}
