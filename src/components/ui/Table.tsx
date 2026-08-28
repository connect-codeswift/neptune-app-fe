"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import type { ReactNode } from "react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { tableMinWidthStyle } from "@/components/ui/table-width";
import type { EmptyStateProps } from "@/components/ui/EmptyState";
import { Text } from "@/components/Text";

/**
 * Server-side pagination state. The rows in `data` are already the current
 * page, so the table never slices — it only renders controls and reports
 * the page the user asked for.
 */
export type TablePagination = Readonly<{
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  onPageChange: (pageNumber: number) => void;
  isLoading?: boolean;
}>;

export type TableProps<TData> = {
  data: readonly TData[];
  columns: ColumnDef<TData, unknown>[];
  globalFilter?: string;
  onRowClick?: (row: TData) => void;
  selectedRowId?: string | null;
  getRowId?: (row: TData) => string;
  /** Extra classes merged onto each body row (e.g. attention highlight). */
  getRowClassName?: (row: TData) => string | undefined;
  className?: string;
  containerClassName?: string;
  pagination?: TablePagination;
  /** Toolbar rendered inside the card, above the table (title, filters, …). */
  header?: ReactNode;
  /** Visual variant for domain-specific table styling. */
  variant?: "default" | "compliance" | "capa" | "incident";
  /**
   * What this table shows when it has no rows. Every table should pass one —
   * "No records found matching your filters" is a fallback, not a good answer,
   * because it cannot say what is missing or how to fix it. The copy used to be
   * chosen by sniffing `variant === "capa"`, which meant a new table could only
   * ever get the generic line.
   */
  emptyState?: EmptyStateProps;
};

export function Table<TData>(props: TableProps<TData>) {
  const {
    data,
    columns,
    globalFilter = "",
    onRowClick,
    selectedRowId,
    getRowId,
    getRowClassName,
    className = "",
    containerClassName = "",
    pagination,
    header,
    variant = "default",
    emptyState,
  } = props;

  const isCompliance = variant === "compliance";
  const isCapa = variant === "capa";
  const isIncident = variant === "incident";

  const table = useReactTable({
    data: data as TData[],
    columns,
    state: {
      globalFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId,
  });

  return (
    <IncidentGlassCard
      paddingClassName="p-0 overflow-hidden"
      className={["w-full min-w-0", containerClassName]
        .filter(Boolean)
        .join(" ")}
    >
      {header ? (
        <div
          className={[
            isCapa
              ? "border-ehs-hairline/90 border-b px-4 py-4"
              : "border-ehs-border border-b",
            isCompliance ? "px-[16px] py-0" : isCapa ? "" : "px-4 py-2.5",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {header}
        </div>
      ) : null}

      {/* `w-full` on the table plus its `min-width` floor means the columns
          fill the card whenever there is room and scroll here when there
          isn't. This table keeps auto layout rather than the proportional
          `columnWidthStyle` the list tables use: its columns carry per-cell
          `minWidth` only, so content still decides how the surplus is shared. */}
      <div className="w-full min-w-0 overflow-x-auto">
        <table
          className={["text4 w-full border-collapse text-left", className]
            .filter(Boolean)
            .join(" ")}
          style={tableMinWidthStyle(table.getTotalSize())}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className={
                  isCapa
                    ? "border-ehs-hairline/90 bg-ehs-surface-inverse/14 border-b"
                    : isCompliance
                      ? "border-ehs-border-ink/8 border-b"
                      : "border-ehs-border/40 border-b"
                }
              >
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as
                    { align?: "left" | "center" | "right" } | undefined;
                  const align = meta?.align ?? "left";
                  const alignClass =
                    align === "center"
                      ? "text-center"
                      : align === "right"
                        ? "text-right"
                        : "text-left";

                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{
                        // Never a fixed `width` — only a floor, so a column
                        // set narrow on purpose (an icon/checkbox column)
                        // still grows for its own content, and one left at
                        // TanStack's 150 default can't be squeezed thinner
                        // than that when the table is short on room.
                        minWidth: `${String(header.getSize())}px`,
                      }}
                      className={[
                        isCapa
                          ? "text6 text-ehs-gray px-4 py-2.5 select-none"
                          : isCompliance
                            ? "text6 text-ehs-muted-text px-[16px] py-3 select-none"
                            : isIncident
                              ? "text6 text-ehs-muted-text px-4 py-3.5 select-none"
                              : "text6 text-ehs-muted-text px-4 py-3.5 select-none",
                        alignClass,
                      ].join(" ")}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    variant="plain"
                    icon={emptyState?.icon ?? "mdi:table-search"}
                    title={emptyState?.title ?? "No records found"}
                    message={
                      emptyState?.message ??
                      "Try clearing the search or filters."
                    }
                    action={emptyState?.action}
                  />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const isSelected = selectedRowId === row.id;
                const rowClassName = getRowClassName?.(row.original);

                return (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row.original)}
                    className={[
                      isCapa
                        ? "border-ehs-border-ink/7 border-b last:border-b-0"
                        : isCompliance
                          ? "border-ehs-border-ink/8 border-t transition-colors"
                          : "border-ehs-border/45 border-b last:border-b-0",
                      onRowClick ? "cursor-pointer" : "",
                      isCapa
                        ? "hover:bg-ehs-surface-inverse/3"
                        : isCompliance
                          ? isSelected
                            ? "bg-ehs-normal-blue/18"
                            : "hover:bg-ehs-normal-blue/8"
                          : isSelected
                            ? "bg-ehs-normal-blue/18"
                            : "hover:bg-ehs-normal-blue/18",
                      rowClassName,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta as
                        { align?: "left" | "center" | "right" } | undefined;
                      const align = meta?.align ?? "left";
                      const alignClass =
                        align === "center"
                          ? "text-center"
                          : align === "right"
                            ? "text-right"
                            : "text-left";

                      return (
                        <td
                          key={cell.id}
                          style={{
                            minWidth: `${String(cell.column.getSize())}px`,
                          }}
                          className={[
                            isCompliance
                              ? "px-[16px] py-3.5 align-middle"
                              : "text-ehs-darker px-4 py-4 align-middle",
                            alignClass,
                          ].join(" ")}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination ? (
        <TablePaginationBar {...pagination} variant={variant} />
      ) : null}
    </IncidentGlassCard>
  );
}

const pageButtonClass =
  "text8 text-ehs-gray border-ehs-border bg-ehs-surface hover:bg-ehs-light-bg inline-flex cursor-pointer items-center gap-1 rounded-lg border px-3 py-1.5 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

function TablePaginationBar(
  props: Readonly<
    TablePagination & {
      variant?: "default" | "compliance" | "capa" | "incident";
    }
  >,
) {
  const {
    pageNumber,
    pageSize,
    totalRecords,
    onPageChange,
    isLoading,
    variant = "default",
  } = props;
  const isCompliance = variant === "compliance";

  // The API is 1-based; guard against a 0/negative page size so the maths
  // below can't divide by zero or produce a negative page count.
  const safePageSize = pageSize > 0 ? pageSize : 10;
  const pageCount = Math.max(1, Math.ceil(totalRecords / safePageSize));
  const currentPage = Math.min(Math.max(pageNumber, 1), pageCount);

  const firstRow =
    totalRecords === 0 ? 0 : (currentPage - 1) * safePageSize + 1;
  const lastRow = Math.min(currentPage * safePageSize, totalRecords);

  const canGoBack = currentPage > 1 && !isLoading;
  const canGoForward = currentPage < pageCount && !isLoading;

  // Three columns rather than `justify-between`: the page controls sat against the
  // right edge, where the floating AI activator button overlaps them and swallows
  // the click. The two 1fr columns are equal, so the auto column between them is
  // centred on the bar no matter how wide the "Showing…" text runs. Single column
  // below `sm`, where everything stacks and centres anyway.
  return (
    <div
      className={[
        "grid grid-cols-1 items-center gap-3 border-t py-3 sm:grid-cols-[1fr_auto_1fr]",
        isCompliance
          ? "border-ehs-border-ink/8 px-[16px]"
          : "border-ehs-border/45 px-4",
      ].join(" ")}
    >
      <Text
        as="span"
        className="text8 text-ehs-muted-text justify-self-center sm:justify-self-start"
      >
        {`Showing ${String(firstRow)}-${String(lastRow)} of ${String(totalRecords)}`}
      </Text>

      <div className="flex items-center gap-2 justify-self-center">
        <button
          type="button"
          className={pageButtonClass}
          disabled={!canGoBack}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </button>

        <Text as="span" className="text8 text-ehs-muted-text px-1 tabular-nums">
          {`Page ${String(currentPage)} of ${String(pageCount)}`}
        </Text>

        <button
          type="button"
          className={pageButtonClass}
          disabled={!canGoForward}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
