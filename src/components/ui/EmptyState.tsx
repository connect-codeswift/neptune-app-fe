import { Icon } from "@iconify/react";
import type { ReactNode } from "react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";

export type EmptyStateVariant = "card" | "plain" | "inline";

export type EmptyStateProps = Readonly<{
  /** Iconify name, drawn muted. Pick one that names the thing that is missing. */
  icon: string;
  /** Short noun phrase: "No findings raised". Not a sentence. */
  title: string;
  /** One sentence of context, and where useful the reason it is empty. */
  message?: string;
  /** The way out — a link or button that fills the empty state. Card variant only. */
  action?: ReactNode;
  /**
   * Pick by what surrounds it, so a panel never nests inside a panel:
   *
   * - `card` (default) — a route, tab or top-level list that owns its area.
   * - `plain` — already inside a card, panel or table cell. Same anatomy, no
   *   shell of its own.
   * - `inline` — a small section within a card (a field group, a short list),
   *   where even a centred block is too much. One muted tinted row.
   */
  variant?: EmptyStateVariant;
  className?: string;
}>;

/**
 * The single empty state for the app: shown when a query succeeded and came
 * back with nothing.
 *
 * Before this existed, every module invented its own. Audit findings rendered a
 * bare centred `<p>`; inspection findings — the same screen, one module over —
 * rendered a card with an icon, a title, a message and a link back. Both were
 * reasonable in isolation and the pair looked like a bug.
 *
 * **This is not an error state.** Empty is a normal, expected outcome: a site
 * with no open findings is a site doing well. So this reads muted and offers
 * the action that fills it, where an error state draws a red glyph and offers a
 * retry. Rendering an error card for an empty list tells the user something
 * broke when nothing did.
 *
 * **Say why it is empty when you know.** "No findings match these filters" and
 * "No findings raised on this audit" send the reader to completely different
 * next actions — clear the filter, or nothing is wrong. Where a list is
 * filtered, pass the filtered message and an action that clears them.
 *
 * The icon is decorative and marked `aria-hidden`; the title and message carry
 * the meaning for a screen reader.
 */
export function EmptyState(props: Readonly<EmptyStateProps>) {
  const {
    icon,
    title,
    message,
    action,
    variant = "card",
    className = "",
  } = props;

  if (variant === "inline") {
    return (
      <div
        className={[
          "bg-ehs-surface-inverse/4 flex items-start gap-2 rounded-xl px-3 py-2.5",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <Icon
          icon={icon}
          className="text-ehs-muted-text mt-0.5 size-4 shrink-0"
          aria-hidden="true"
        />
        <Text as="p" className="text4 text-ehs-muted-text">
          {message ? `${title}. ${message}` : title}
        </Text>
      </div>
    );
  }

  const body = (
    <>
      <Icon
        icon={icon}
        className="text-ehs-muted-text size-10"
        aria-hidden="true"
      />
      <Text as="p" className="text3 text-ehs-darker">
        {title}
      </Text>
      {message ? (
        <Text as="p" className="text4 text-ehs-muted-text max-w-sm">
          {message}
        </Text>
      ) : null}
      {action}
    </>
  );

  if (variant === "plain") {
    return (
      <div
        className={[
          "flex flex-col items-center justify-center gap-3 px-4 py-10 text-center",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {body}
      </div>
    );
  }

  return (
    <IncidentGlassCard
      className={["min-h-55 text-center", className].filter(Boolean).join(" ")}
      incidentGlassCardClassName="items-center justify-center gap-3"
    >
      {body}
    </IncidentGlassCard>
  );
}
