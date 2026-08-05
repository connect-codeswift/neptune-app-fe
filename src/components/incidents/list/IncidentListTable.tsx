"use client";

import { useCallback, useMemo, type ReactNode } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  IncidentBadge,
  severityTone,
  stateTone,
} from "@/components/incidents/list/IncidentBadge";
import type { IncidentRecord } from "@/components/incidents/list/incident-list-types";

export type IncidentListTableProps<
  TData extends { id: string } = IncidentRecord,
> = Readonly<{
  /** Incident rows (default mode). Ignored when `data` is provided. */
  incidents?: readonly IncidentRecord[];
  /** Generic rows (e.g. policy documents). Requires `columns`. */
  data?: readonly TData[];
  /** Column defs for `data`. Defaults to incident columns when using `incidents`. */
  columns?: ColumnDef<TData, unknown>[];
  selectedId: string | null;
  /** Row selection for generic tables (e.g. policy documents). */
  onSelect?: (id: string) => void;
  /** Opens the preview panel for the selected incident. */
  onViewMore?: (id: string) => void;
  /** Opens the full detail page (second click on a selected generic row). */
  onOpenDetail?: (id: string) => void;
  /** When true (detail panel closed), columns and text use a wider layout */
  expanded?: boolean;
  /** Optional chrome above the table (filters, title, tabs). */
  toolbar?: ReactNode;
  /** Denser row height for document-style tables. */
  compact?: boolean;
  className?: string;
}>;

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    align?: "left" | "center" | "right";
  }
}

const columnHelper = createColumnHelper<IncidentRecord>();

function siteLines(site: string): readonly [string, string?] {
  const separator = " · ";
  const index = site.indexOf(separator);

  if (index === -1) {
    return [site];
  }

  return [
    `${site.slice(0, index)}${separator}`.trimEnd(),
    site.slice(index + separator.length),
  ];
}

function createIncidentColumns(
  expanded: boolean,
  options: Readonly<{
    selectedId: string | null;
    onViewMore: (id: string) => void;
  }>,
): ColumnDef<IncidentRecord, unknown>[] {
  const { selectedId, onViewMore } = options;

  return [
    columnHelper.accessor("id", {
      header: "ID",
      size: expanded ? 110 : 90,
      minSize: 72,
      meta: { align: "left" as const },
      cell: (info) => (
        <Text
          as="span"
          className="text-ehs-muted-text text-xs font-semibold tabular-nums"
        >
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.display({
      id: "incident",
      header: "Incident",
      size: expanded ? 480 : 240,
      minSize: 140,
      meta: { align: "left" as const },
      cell: ({ row }) => {
        const isRowSelected = selectedId === row.original.id;

        return (
          <div className="flex w-full min-w-0 flex-col gap-1">
            <Text
              as="p"
              className="text-ehs-dark-bg line-clamp-1 text-sm leading-normal font-normal first-letter:uppercase"
              title={row.original.title}
            >
              {row.original.title}
            </Text>
            <Text
              as="p"
              className="text-ehs-muted-text line-clamp-1 text-sm leading-normal font-normal first-letter:uppercase"
              title={row.original.description}
            >
              {row.original.description}
            </Text>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onViewMore(row.original.id);
              }}
              className={[
                "mt-0.5 w-fit text-left text-xs font-bold transition-colors",
                isRowSelected
                  ? "text-ehs-normal-blue"
                  : "text-ehs-gray hover:text-ehs-normal-blue",
              ].join(" ")}
            >
              View more
            </button>
          </div>
        );
      },
    }),
    columnHelper.accessor("site", {
      header: "Site",
      size: expanded ? 170 : 110,
      minSize: 80,
      meta: { align: "left" as const },
      cell: (info) => {
        const [sitePrimary, siteSecondary] = siteLines(info.getValue());

        return (
          <div className="w-full min-w-0">
            <Text as="p" className="text-ehs-gray text-sm font-normal">
              {sitePrimary}
            </Text>
            {siteSecondary ? (
              <Text as="p" className="text-ehs-gray text-sm font-normal">
                {siteSecondary}
              </Text>
            ) : null}
          </div>
        );
      },
    }),
    columnHelper.accessor("severity", {
      header: "Severity",
      size: expanded ? 160 : 130,
      minSize: 110,
      meta: { align: "center" as const },
      cell: (info) => (
        <IncidentBadge
          label={info.getValue()}
          tone={severityTone(info.getValue())}
          showDot
        />
      ),
    }),
    columnHelper.accessor("state", {
      header: "State",
      size: expanded ? 130 : 90,
      minSize: 80,
      meta: { align: "center" as const },
      cell: (info) => (
        <IncidentBadge
          label={info.getValue()}
          tone={stateTone(info.getValue())}
          showDot
        />
      ),
    }),
  ] as ColumnDef<IncidentRecord, unknown>[];
}

function columnWidthStyle(size: number, totalSize: number) {
  return {
    width: `${(size / totalSize) * 100}%`,
  };
}

function alignClass(align: "left" | "center" | "right" | undefined) {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}

export function IncidentListTable<
  TData extends { id: string } = IncidentRecord,
>(props: Readonly<IncidentListTableProps<TData>>) {
  const {
    incidents,
    data,
    columns: columnsProp,
    selectedId,
    onSelect,
    onViewMore,
    onOpenDetail,
    expanded = false,
    toolbar,
    compact = false,
    className = "",
  } = props;

  const resolvedData = (data ?? incidents ?? []) as TData[];
  const isIncidentTable = columnsProp == null;
  const handleViewMore = useCallback(
    (id: string) => {
      onViewMore?.(id);
    },
    [onViewMore],
  );

  const columns = useMemo(() => {
    if (columnsProp) {
      return columnsProp;
    }
    return createIncidentColumns(expanded, {
      selectedId,
      onViewMore: handleViewMore,
    }) as ColumnDef<TData, unknown>[];
  }, [columnsProp, expanded, selectedId, handleViewMore]);

  const table = useReactTable({
    data: resolvedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    defaultColumn: {
      minSize: 60,
      size: 120,
    },
  });

  const totalSize = table.getTotalSize();
  const cellPadClass = compact
    ? "h-auto min-h-[64px] px-[15.57px] py-3"
    : expanded
      ? "h-auto min-h-[88px] px-5 py-3"
      : "h-auto min-h-[80px] px-3 py-3 sm:px-4";
  const headerPadClass = compact
    ? "px-[15.57px] pt-[10.7px] pb-[11.19px] text-xs"
    : expanded
      ? "px-5 pt-4 pb-4 text-xs"
      : "px-3 pt-[13px] pb-[13.5px] text-xs sm:px-4";

  return (
    <IncidentGlassCard
      paddingClassName="p-0 overflow-hidden"
      className={["h-fit w-full min-w-0", className].filter(Boolean).join(" ")}
    >
      {toolbar}

      <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <colgroup>
            {table.getAllLeafColumns().map((column) => (
              <col
                key={column.id}
                style={columnWidthStyle(column.getSize(), totalSize)}
              />
            ))}
          </colgroup>

          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const align = header.column.columnDef.meta?.align;

                  return (
                    <th
                      key={header.id}
                      style={columnWidthStyle(header.getSize(), totalSize)}
                      className={[
                        "text-ehs-muted-text text-xs font-bold tracking-wide uppercase",
                        headerPadClass,
                        alignClass(align),
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
                  colSpan={Math.max(columns.length, 1)}
                  className="border-t border-[rgba(15,23,42,0.08)] px-4 py-10 text-center"
                >
                  <Text as="p" className="text-ehs-muted-text text-sm">
                    No rows to display.
                  </Text>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const isSelected = selectedId === row.original.id;
                const handleRowClick =
                  isIncidentTable || !onSelect
                    ? undefined
                    : () => {
                        if (isSelected && onOpenDetail) {
                          onOpenDetail(row.original.id);
                          return;
                        }
                        onSelect(row.original.id);
                      };

                return (
                  <tr
                    key={row.id}
                    onClick={handleRowClick}
                    title={
                      handleRowClick && onOpenDetail
                        ? isSelected
                          ? "Click again to open details"
                          : "Click to preview"
                        : undefined
                    }
                    className={[
                      handleRowClick ? "cursor-pointer" : "",
                      "border-t border-[rgba(15,23,42,0.08)] transition-colors",
                      isSelected
                        ? "bg-ehs-normal-blue/18"
                        : handleRowClick
                          ? "hover:bg-ehs-light-bg/70"
                          : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const align = cell.column.columnDef.meta?.align;

                      return (
                        <td
                          key={cell.id}
                          style={columnWidthStyle(
                            cell.column.getSize(),
                            totalSize,
                          )}
                          className={[
                            "min-w-0",
                            align === "left" ? "align-top" : "align-middle",
                            cellPadClass,
                            alignClass(align),
                          ].join(" ")}
                        >
                          <div
                            className={[
                              "flex w-full min-w-0",
                              align === "center"
                                ? "items-center justify-center"
                                : align === "right"
                                  ? "items-center justify-end"
                                  : "items-start justify-start",
                            ].join(" ")}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </div>
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
