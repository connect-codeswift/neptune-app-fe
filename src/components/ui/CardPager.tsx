"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";

export type CardPagerProps = Readonly<{
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Names what is being paged, for the screen-reader labels. */
  label: string;
}>;

const BUTTON_CLASS = [
  "border-ehs-border-ink/12 bg-ehs-surface/70 text-ehs-slate",
  "hover:bg-ehs-surface disabled:opacity-40 disabled:cursor-not-allowed",
  "flex size-6 items-center justify-center rounded-lg border transition-colors",
].join(" ");

/**
 * Prev / next for a dashboard card whose list would otherwise run off the page.
 *
 * Lives in the card header rather than under the content: the card keeps one height whatever
 * page it is on, which is what stops a long list stretching the row it shares with its
 * neighbour. Renders nothing at all for a single page, so a card with little data has no
 * chrome it does not need.
 */
export function CardPager(props: CardPagerProps) {
  const { page, pageCount, onPageChange, label } = props;

  if (pageCount <= 1) {
    return null;
  }

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <Text as="span" className="text8 text-ehs-muted-text tabular-nums">
        {`${String(page)} / ${String(pageCount)}`}
      </Text>
      <button
        type="button"
        className={BUTTON_CLASS}
        aria-label={`Previous page of ${label}`}
        disabled={page <= 1}
        onClick={() => {
          onPageChange(page - 1);
        }}
      >
        <Icon icon="mdi:chevron-left" className="size-3.5" aria-hidden="true" />
      </button>
      <button
        type="button"
        className={BUTTON_CLASS}
        aria-label={`Next page of ${label}`}
        disabled={page >= pageCount}
        onClick={() => {
          onPageChange(page + 1);
        }}
      >
        <Icon icon="mdi:chevron-right" className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
