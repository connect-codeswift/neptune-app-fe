import { Text } from "@/components/Text";

export type BetaBadgeProps = Readonly<{
  /**
   * `accent` reads on the app's normal surfaces; `on-accent` on the blue fills — the panel
   * header and the floating launcher — where the accent tint would disappear into its own
   * background.
   */
  tone?: "accent" | "on-accent";
  className?: string;
}>;

const TONE_CLASSES: Record<NonNullable<BetaBadgeProps["tone"]>, string> = {
  accent:
    "border-ehs-normal-blue/25 bg-ehs-normal-blue/12 text-ehs-normal-blue",
  "on-accent":
    "border-ehs-light-text/35 bg-ehs-light-text/20 text-ehs-light-text",
};

/**
 * The "Beta" chip worn by Neptune AI wherever it introduces itself — the page's replies, the
 * popup's header, the launcher.
 *
 * It carries a `title` rather than only the four visible letters: "Beta" alone says the feature
 * is new, not that its answers are worth double-checking, and that second half is the whole
 * reason for labelling an assistant. The word itself stays in the accessibility tree (no
 * `aria-hidden`), so it is announced alongside the name it sits next to.
 *
 * `shrink-0` because every one of its homes is a flex row that would otherwise squeeze the
 * badge before the text beside it.
 */
export function BetaBadge(props: BetaBadgeProps) {
  const { tone = "accent", className = "" } = props;

  return (
    <span
      title="Neptune AI is in beta — answers can be incomplete, so check anything you act on."
      className={[
        "inline-flex shrink-0 items-center rounded-full border px-1.5 py-px text-[9px] leading-3.5 font-bold tracking-[0.08em] uppercase",
        TONE_CLASSES[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Text as="span">Beta</Text>
    </span>
  );
}
