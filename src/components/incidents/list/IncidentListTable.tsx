"use client";
import { EmptyState } from "@/components/ui/EmptyState";

import { useCallback, useMemo, type ReactNode } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  IncidentBadge,
  severityTone,
  stateTone,
} from "@/components/incidents/list/IncidentBadge";
import type { IncidentRecord } from "@/components/incidents/list/incident-list-types";
import { IncidentListTableHeader } from "@/components/incidents/list/IncidentListTableHeader";
import { withManageAction } from "@/components/ui/table-manage-column";

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
  /** Opens the preview/details panel for the selected incident. */
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

/**
 * Column presentation, keyed by column id. Kept out of each column's `meta`:
 * `meta` is one interface shared by every table in the project, so `align` and
 * `verticalAlign` declared there reach tables that never render them. Columns
 * absent from these maps are left-aligned and top-aligned.
 */
const COLUMN_ALIGN: Readonly<Record<string, "left" | "center" | "right">> = {
  severity: "center",
  state: "center",
  view: "center",
};

const MIDDLE_ALIGNED: ReadonlySet<string> = new Set(["id", "site", "view"]);

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

  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      size: expanded ? 120 : 100,
      minSize: 84,
      cell: (info) => (
        <Text as="span" className="text7 text-ehs-muted-text whitespace-nowrap">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.display({
      id: "incident",
      header: "Incident",
      size: expanded ? 480 : 240,
      minSize: 140,
      cell: ({ row }) => (
        <div className="flex w-full min-w-0 flex-col gap-1">
          <Text
            as="p"
            className="text4 text-ehs-dark-bg line-clamp-1 first-letter:uppercase"
            title={row.original.title}
          >
            {row.original.title}
          </Text>
          <Text
            as="p"
            className="text4 text-ehs-muted-text line-clamp-1 first-letter:uppercase"
            title={row.original.description}
          >
            {row.original.description}
          </Text>
        </div>
      ),
    }),
    columnHelper.accessor("site", {
      header: "Site",
      size: expanded ? 170 : 110,
      minSize: 80,
      cell: (info) => {
        const [sitePrimary, siteSecondary] = siteLines(info.getValue());

        return (
          <div className="w-full min-w-0">
            <Text as="p" className="text4 text-ehs-gray">
              {sitePrimary}
            </Text>
            {siteSecondary ? (
              <Text as="p" className="text4 text-ehs-gray">
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
      cell: (info) => (
        <IncidentBadge
          label={info.getValue()}
          tone={stateTone(info.getValue())}
          showDot
        />
      ),
    }),
    columnHelper.display({
      id: "view",
      header: "",
      size: 56,
      minSize: 48,
      cell: ({ row }) => {
        const isOpen = selectedId === row.original.id;

        return (
          <button
            type="button"
            className="text-ehs-muted-text hover:text-ehs-dark-bg inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
            aria-label={
              isOpen
                ? `Close details for incident ${row.original.id}`
                : `View incident ${row.original.id}`
            }
            onClick={(event) => {
              event.stopPropagation();
              onViewMore(row.original.id);
            }}
          >
            <Icon
              icon={
                isOpen
                  ? "icon-park-outline:preview-close-one"
                  : "lets-icons:view"
              }
              className="size-5"
              aria-hidden="true"
            />
          </button>
        );
      },
    }),
  ] as ColumnDef<IncidentRecord, unknown>[];

  return withManageAction(columns, {
    getHref: (row) =>
      row.numericId > 0
        ? `/dashboard/incidents/${String(row.numericId)}`
        : null,
    getAriaLabel: (row) => `Manage incident ${row.id}`,
  }) as ColumnDef<IncidentRecord, unknown>[];
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

function cellVerticalAlignClass(
  align: "left" | "center" | "right" | undefined,
  verticalAlign: "top" | "middle" | undefined,
) {
  if (verticalAlign === "middle") return "align-middle";
  if (verticalAlign === "top") return "align-top";
  return align === "left" ? "align-top" : "align-middle";
}

function cellFlexAlignClass(
  align: "left" | "center" | "right" | undefined,
  verticalAlign: "top" | "middle" | undefined,
) {
  const isMiddle =
    verticalAlign === "middle" || (verticalAlign !== "top" && align !== "left");

  if (align === "center") {
    return isMiddle
      ? "items-center justify-center"
      : "items-start justify-center";
  }

  if (align === "right") {
    return isMiddle ? "items-center justify-end" : "items-start justify-end";
  }

  return isMiddle ? "items-center justify-start" : "items-start justify-start";
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
    ? "h-auto min-h-16 px-[16px] py-3"
    : expanded
      ? "h-auto min-h-22 px-5 py-3"
      : "h-auto min-h-20 px-3 py-3 sm:px-4";
  const headerPadClass = compact
    ? "px-[16px] pt-[11px] pb-[11px] text-xs"
    : expanded
      ? "px-5 pt-4 pb-4 text-xs"
      : "px-3 pt-3.25 pb-[14px] text-xs sm:px-4";

  return (
    <IncidentGlassCard
      paddingClassName="p-0 overflow-hidden"
      className={["h-fit w-full min-w-0", className].filter(Boolean).join(" ")}
    >
      {toolbar ?? (isIncidentTable ? <IncidentListTableHeader /> : null)}

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
                  const align = COLUMN_ALIGN[header.column.id] ?? "left";

                  return (
                    <th
                      key={header.id}
                      style={columnWidthStyle(header.getSize(), totalSize)}
                      className={[
                        "text6 text-ehs-muted-text",
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
                  className="border-ehs-border-ink/8 border-t"
                >
                  <EmptyState
                    variant="plain"
                    icon="mdi:clipboard-text-off-outline"
                    title="No incidents found"
                    message="Try clearing the search or filters."
                  />
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
                      "border-ehs-border-ink/8 border-t transition-colors",
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
                      const align = COLUMN_ALIGN[cell.column.id] ?? "left";
                      const verticalAlign = MIDDLE_ALIGNED.has(cell.column.id)
                        ? "middle"
                        : undefined;

                      return (
                        <td
                          key={cell.id}
                          style={columnWidthStyle(
                            cell.column.getSize(),
                            totalSize,
                          )}
                          className={[
                            "min-w-0",
                            cellVerticalAlignClass(align, verticalAlign),
                            cellPadClass,
                            alignClass(align),
                          ].join(" ")}
                        >
                          <div
                            className={[
                              "flex w-full min-w-0",
                              cellFlexAlignClass(align, verticalAlign),
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
