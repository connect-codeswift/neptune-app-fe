"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { flexRender, type CellContext } from "@tanstack/react-table";
import type { TableColumns } from "@/components/ui/table-columns";

/**
 * Makes a register row's identifier cell a real link to that row's record.
 *
 * ## Why this replaces the Manage cog
 *
 * Every register used to carry two row controls: an eye that opened an inline
 * detail panel, and a cog that went to the record. In 13 of the 14 registers the
 * cog's destination was the *same url* as the panel's own "Open details" link —
 * one destination drawn twice, on an icon that everywhere else in software means
 * "configure". Meanwhile the row itself did nothing: only one table passed
 * `onRowClick`, so the most natural gesture in a table was dead.
 *
 * Deleting the cog on its own would have made things worse, not better. It was a
 * real `<Link>`, and the identifier cell is plain text, so the cog was the only
 * focusable thing in a row — removing it would leave keyboard and screen-reader
 * users with no way into a record at all.
 *
 * So the link moves to where it belonged: the identifier. That keeps a genuine
 * anchor in every row — focusable, middle-clickable, "open in new tab" — and
 * reads as what it is. `onRowClick` then makes the whole row clickable as a
 * convenience for the mouse, rather than as the only way in.
 *
 * The eye stays where a panel exists. Peeking at a record without losing your
 * place in a 200-row register is the one thing it genuinely earns.
 */

const ROW_LINK_CLASS =
  "hover:text-ehs-normal-blue -mx-1 block rounded px-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-current";

export type RowLinkOptions<TRow> = Readonly<{
  /** Route this row's identifier opens. Return `null` to leave it plain text. */
  getHref: (row: TRow) => string | null;
  /** Per-row screen-reader label, e.g. `Open audit A-0007`. */
  getAriaLabel: (row: TRow) => string;
  /**
   * Which column becomes the link. Defaults to the first column, which is the
   * identifier in every register.
   */
  columnId?: string;
}>;

/**
 * Wraps one column's rendered cell in a link, leaving every other column alone.
 *
 * The original renderer is called through `flexRender` rather than invoked
 * directly: a column's `cell` may be a plain value or a component, and calling
 * only the function case silently blanked those cells.
 */
export function withRowLink<TRow>(
  columns: TableColumns<TRow>,
  options: RowLinkOptions<TRow>,
): TableColumns<TRow> {
  const { getHref, getAriaLabel, columnId } = options;

  const targetIndex =
    columnId === undefined
      ? 0
      : columns.findIndex((column) => column.id === columnId);

  if (targetIndex === -1) return columns;

  return columns.map((column, index) => {
    if (index !== targetIndex) return column;

    const renderOriginal = column.cell;

    return {
      ...column,
      cell: (context: CellContext<TRow, unknown>) => {
        // `getValue()` is `unknown` for a display column; rendering it directly
        // is what a bare accessor cell would have done anyway.
        const content: ReactNode =
          renderOriginal === undefined
            ? (context.getValue() as ReactNode)
            : flexRender(renderOriginal, context);

        const href = getHref(context.row.original);
        if (href === null) return content;

        return (
          <Link
            href={href}
            aria-label={getAriaLabel(context.row.original)}
            className={ROW_LINK_CLASS}
            // The row is clickable too; without this the click navigates twice.
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            {content}
          </Link>
        );
      },
    };
  });
}
