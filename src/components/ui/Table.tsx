"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { IncidentGlassCard } from "@/components/incidents/IncidentGlassCard";

export type TableProps<TData> = {
  data: readonly TData[];
  columns: ColumnDef<TData, unknown>[];
  globalFilter?: string;
  onRowClick?: (row: TData) => void;
  selectedRowId?: string | null;
  getRowId?: (row: TData) => string;
  className?: string;
  containerClassName?: string;
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
                        : "hover:bg-ehs-light-bg/50",
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
    </IncidentGlassCard>
  );
}
