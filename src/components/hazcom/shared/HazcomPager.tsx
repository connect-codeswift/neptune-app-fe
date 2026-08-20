"use client";

import { Text } from "@/components/Text";

export type HazcomPagerProps = Readonly<{
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  /** Disables both buttons while a page is in flight. */
  isFetching?: boolean;
  onPageChange: (pageNumber: number) => void;
  className?: string;
}>;

const pageButtonClass =
  "text8 border-ehs-border text-ehs-gray hover:bg-ehs-light-bg inline-flex cursor-pointer items-center gap-1 rounded-lg border bg-ehs-surface px-3 py-1.5 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Pager for the HazCom list endpoints, which all page the same way
 * (`pageNumber` + `pageSize`, total in the envelope). Renders nothing when
 * everything fits on one page.
 */
export function HazcomPager(props: Readonly<HazcomPagerProps>) {
  const {
    pageNumber,
    pageSize,
    totalRecords,
    isFetching = false,
    onPageChange,
    className = "",
  } = props;

  if (totalRecords <= pageSize) {
    return null;
  }

  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  // Centred, not right-aligned: the floating AI activator button covers the right
  // edge of the bar. Same three-column grid as the shared Table pager.
  return (
    <div
      className={[
        "grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Text
        as="span"
        className="text8 text-ehs-muted-text justify-self-center sm:justify-self-start"
      >
        {`Page ${String(pageNumber)} of ${String(totalPages)}`}
      </Text>

      <div className="flex items-center gap-2 justify-self-center">
        <button
          type="button"
          className={pageButtonClass}
          disabled={pageNumber <= 1 || isFetching}
          onClick={() => onPageChange(pageNumber - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          className={pageButtonClass}
          disabled={pageNumber >= totalPages || isFetching}
          onClick={() => onPageChange(pageNumber + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
