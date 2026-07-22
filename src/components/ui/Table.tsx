"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import type { ReactNode } from "react";
import { IncidentGlassCard } from "@/components/incidents";

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
  className?: string;
  containerClassName?: string;
  pagination?: TablePagination;
  /** Toolbar rendered inside the card, above the table (title, filters, …). */
  header?: ReactNode;
};

export function Table<TData>(props: TableProps<TData>) {
  const {
    data,
    columns,
    globalFilter = "",
    onRowClick,
    selectedRowId,
    getRowId,
    className = "",
    containerClassName = "",
    pagination,
    header,
  } = props;

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
        <div className="border-b border-[rgba(15,23,42,0.08)] px-4 py-2.5">
          {header}
        </div>
      ) : null}

      <div className="w-full min-w-0 overflow-x-auto">
        <table
          className={["w-full border-collapse text-left text-sm", className]
            .filter(Boolean)
            .join(" ")}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-ehs-border/40 border-b"
              >
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as
                    | { align?: "left" | "center" | "right" }
                    | undefined;
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
                        width:
                          header.getSize() !== 150
                            ? `${header.getSize()}px`
                            : undefined,
                      }}
                      className={[
                        "text-ehs-muted-text px-4 py-3.5 text-xs font-bold tracking-wider uppercase select-none",
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
                <td
                  colSpan={columns.length}
                  className="text-ehs-muted-text px-4 py-12 text-center text-sm"
                >
                  No records found matching your filters.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const isSelected = selectedRowId === row.id;

                return (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row.original)}
                    className={[
                      "border-ehs-border/45 border-b transition-colors last:border-b-0",
                      onRowClick ? "cursor-pointer" : "",
                      isSelected
                        ? "bg-ehs-normal-blue/18"
                        : "hover:bg-ehs-normal-blue/18",
                    ].join(" ")}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta as
                        | { align?: "left" | "center" | "right" }
                        | undefined;
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
                          className={[
                            "text-ehs-darker px-4 py-4 align-middle text-sm font-normal",
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

      {pagination ? <TablePaginationBar {...pagination} /> : null}
    </IncidentGlassCard>
  );
}

const pageButtonClass =
  "inline-flex cursor-pointer items-center gap-1 rounded-lg border border-ehs-border bg-ehs-light-text px-3 py-1.5 text-xs font-medium text-ehs-gray transition-colors hover:bg-ehs-light-bg disabled:cursor-not-allowed disabled:opacity-50";

function TablePaginationBar(props: Readonly<TablePagination>) {
  const { pageNumber, pageSize, totalRecords, onPageChange, isLoading } = props;

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

  return (
    <div className="border-ehs-border/45 flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
      <span className="text-ehs-muted-text text-xs">
        {`Showing ${firstRow}-${lastRow} of ${totalRecords}`}
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className={pageButtonClass}
          disabled={!canGoBack}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </button>

        <span className="text-ehs-muted-text px-1 text-xs tabular-nums">
          {`Page ${currentPage} of ${pageCount}`}
        </span>

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
