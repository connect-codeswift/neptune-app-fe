"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { createColumnHelper, type CellContext } from "@tanstack/react-table";
import type { TableColumns } from "@/components/ui/table-columns";

export const MANAGE_COLUMN_ID = "manage";

/** Column ids that already hold a row-action control (the eye / "view more"). */
const ACTION_COLUMN_IDS: ReadonlySet<string> = new Set(["view", "actions"]);

/**
 * Row-level "Manage" action — a one-step shortcut to the row's detail route.
 *
 * It sits beside the existing eye / "view more" control rather than replacing
 * it: the eye opens the inline detail panel, and the panel's "Open details"
 * link goes where this button goes. Manage skips the panel.
 *
 * Deliberately NOT the sizing from `ui/table-header-action.ts` — that file is
 * documented for action buttons in card *headers*, and its responsive `md:`
 * padding bumps make it far too tall for a table row. These classes mirror the
 * eye button's footprint instead (`size-8 rounded-lg`, `size-5` icon).
 */
const MANAGE_BUTTON_BASE_CLASS =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-lg";

const MANAGE_BUTTON_CLASS = `${MANAGE_BUTTON_BASE_CLASS} text-ehs-normal-blue hover:bg-ehs-light-blue/40 cursor-pointer transition-colors`;

/** Same footprint, no affordance — used when a row has no destination. */
const MANAGE_BUTTON_DISABLED_CLASS = `${MANAGE_BUTTON_BASE_CLASS} text-ehs-muted-text cursor-not-allowed opacity-60`;

export type ManageButtonProps = Readonly<{
  /** Route to navigate to, or `null` to render the disabled state. */
  href: string | null;
  /** Screen-reader label — rows look identical without it. */
  ariaLabel: string;
}>;

export function ManageButton(props: Readonly<ManageButtonProps>) {
  const { href, ariaLabel } = props;

  if (href === null) {
    return (
      <span
        className={MANAGE_BUTTON_DISABLED_CLASS}
        aria-disabled="true"
        aria-label={ariaLabel}
      >
        <Icon icon="mdi:cog-outline" className="size-5" aria-hidden="true" />
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={MANAGE_BUTTON_CLASS}
      onClick={(event) => {
        // Several of these tables also pass `onRowClick`; without this the
        // click navigates twice.
        event.stopPropagation();
      }}
    >
      <Icon icon="mdi:cog-outline" className="size-5" aria-hidden="true" />
    </Link>
  );
}

export type ManageActionOptions<TRow> = Readonly<{
  /** Route this row's Manage button opens. Return `null` to disable it. */
  getHref: (row: TRow) => string | null;
  /** Per-row screen-reader label, e.g. `Manage chemical Acetone`. */
  getAriaLabel: (row: TRow) => string;
}>;

/**
 * Adds a Manage button to a table's existing row-action cell.
 *
 * It merges into the eye column's own cell rather than adding a second column,
 * and that is load-bearing: these tables render `w-full` with the default
 * `table-layout: auto`, so a column's declared `size` is only a hint — the
 * browser hands leftover width to every column, and two separate icon columns
 * drift far apart no matter how their padding or width is tuned. Inside one
 * cell, `gap-4` is the whole distance between the icons and stays 1rem however
 * the column stretches.
 *
 * Falls back to appending a standalone column when a table has no eye column
 * to merge into.
 */
export function withManageAction<TRow>(
  columns: TableColumns<TRow>,
  options: Readonly<ManageActionOptions<TRow>>,
): TableColumns<TRow> {
  const { getHref, getAriaLabel } = options;

  const renderManage = (row: TRow) => (
    <ManageButton href={getHref(row)} ariaLabel={getAriaLabel(row)} />
  );

  const actionIndex = columns.findLastIndex(
    (column) =>
      typeof column.id === "string" && ACTION_COLUMN_IDS.has(column.id),
  );

  if (actionIndex === -1) {
    const columnHelper = createColumnHelper<TRow>();

    return [
      ...columns,
      columnHelper.display({
        id: MANAGE_COLUMN_ID,
        header: "",
        size: 56,
        minSize: 48,
        cell: ({ row }) => renderManage(row.original),
        meta: { align: "center" as const, verticalAlign: "middle" as const },
      }),
    ];
  }

  const actionColumn = columns[actionIndex];
  const renderExisting = actionColumn.cell;

  return columns.map((column, index) => {
    if (index !== actionIndex) return column;

    return {
      ...column,
      // Two 32px buttons plus the 16px gap. Only a hint under `auto` layout,
      // but it keeps the column from starting out too narrow.
      size: 96,
      minSize: 88,
      cell: (context: CellContext<TRow, unknown>) => (
        <div className="flex items-center justify-center gap-4">
          {typeof renderExisting === "function"
            ? renderExisting(context)
            : null}
          {renderManage(context.row.original)}
        </div>
      ),
    };
  });
}
