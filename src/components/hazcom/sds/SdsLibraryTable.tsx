"use client";

import { useRouter } from "next/navigation";

import { EmptyState } from "@/components/ui/EmptyState";
import {
  columnWidthStyle,
  tableMinWidthStyle,
} from "@/components/ui/table-width";

import { useMemo, type ReactNode } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import {
  IncidentBadge,
  type IncidentBadgeTone,
} from "@/components/near-miss/IncidentBadge";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  HazcomPictogramIcon,
  type HazcomSdsRecord,
} from "@/components/hazcom/shared";
import { withRowLink } from "@/components/ui/table-row-link";

/** Where a row in this register opens. Shared by the id link and the row click. */
const sdsRecordHref = (id: string) =>
  `/dashboard/hazcom/sds/${encodeURIComponent(id)}`;

export type SdsLibraryTableProps = Readonly<{
  records: readonly HazcomSdsRecord[];
  selectedId?: string | null;
  onViewMore?: (id: string) => void;
  /** When true (detail panel closed), columns use the wider layout. */
  expanded?: boolean;
  /**
   * Draw the row's Manage (cog) shortcut. Defaults to false so a caller that
   * has not thought about permissions gets the read-only table rather than
   * silently offering an edit route the API will refuse.
   */
  canManage?: boolean;
  header?: ReactNode;
  className?: string;
}>;

/**
 * Column alignment, keyed by column id — presentation, so it lives with the
 * renderers that read it rather than in each column's `meta`.
 */
const COLUMN_ALIGN: Readonly<Record<string, "left" | "center" | "right">> = {
  signalWord: "center",
  pictograms: "center",
  status: "center",
  actions: "center",
};

const columnHelper = createColumnHelper<HazcomSdsRecord>();

function signalTone(signalWord: string): IncidentBadgeTone {
  return signalWord.trim().toLowerCase() === "danger" ? "danger" : "warn";
}

function statusTone(status: string): IncidentBadgeTone {
  switch (status) {
    case "Compliant":
      return "teal";
    case "Due Soon":
      return "warn";
    case "Overdue":
      return "danger";
    default:
      return "muted";
  }
}

export type SdsLibraryColumnOptions = Readonly<{
  selectedId: string | null;
  onViewMore: (id: string) => void;
  expanded?: boolean;
  canManage: boolean;
}>;

/**
 * Note: avoid `size: 150` if migrating to the shared Table — that value means
 * “no width” there. This custom table uses relative widths, so sizes are
 * proportions only.
 */
function createSdsLibraryColumns(
  options: SdsLibraryColumnOptions,
): ColumnDef<HazcomSdsRecord, unknown>[] {
  const { selectedId, onViewMore, expanded = true, canManage } = options;

  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      size: expanded ? 96 : 72,
      minSize: 64,
      cell: (info) => (
        <Text as="span" className="text7 text-ehs-muted-text tabular-nums">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.display({
      id: "chemical",
      header: "Chemical",
      size: expanded ? 140 : 128,
      minSize: 108,
      cell: ({ row }) => (
        <div className="flex min-w-0 flex-col leading-tight">
          <Text
            as="span"
            className="text4 text-ehs-darker truncate"
            title={row.original.chemicalName}
          >
            {row.original.chemicalName}
          </Text>
          <Text as="span" className="text8 text-ehs-muted-text truncate">
            {row.original.version}
          </Text>
        </div>
      ),
    }),
    ...(expanded
      ? [
          columnHelper.accessor("manufacturer", {
            header: "Manufacturer",
            size: 140,
            minSize: 110,
            cell: (info) => (
              <Text
                as="span"
                className="text4 text-ehs-gray truncate"
                title={info.getValue()}
              >
                {info.getValue() || "—"}
              </Text>
            ),
          }),
          columnHelper.accessor("casNumber", {
            header: "CAS #",
            size: 108,
            minSize: 90,
            cell: (info) => (
              <Text
                as="span"
                className="text7 text-ehs-muted-text tabular-nums"
              >
                {info.getValue() || "—"}
              </Text>
            ),
          }),
          columnHelper.accessor("hazardClass", {
            header: "Hazard",
            size: 140,
            minSize: 110,
            cell: (info) => (
              <Text
                as="span"
                className="text4 text-ehs-gray truncate"
                title={info.getValue()}
              >
                {info.getValue() || "—"}
              </Text>
            ),
          }),
          columnHelper.accessor("revisedOn", {
            header: "Revised",
            size: 100,
            minSize: 88,
            cell: (info) => (
              <Text
                as="span"
                className="text8 text-ehs-muted-text tabular-nums"
              >
                {info.getValue() || "—"}
              </Text>
            ),
          }),
        ]
      : []),
    columnHelper.accessor("signalWord", {
      header: "Signal",
      size: expanded ? 108 : 104,
      minSize: 96,
      cell: (info) => {
        const value = info.getValue();
        return (
          <IncidentBadge
            label={value}
            tone={signalTone(value)}
            className="text5 w-fit rounded-md px-2 py-0.5 tracking-normal"
          />
        );
      },
    }),
    columnHelper.accessor("pictograms", {
      header: "GHS",
      size: expanded ? 112 : 96,
      minSize: 88,
      cell: (info) => {
        const pictograms = info.getValue();

        return (
          <div className="flex items-center justify-center gap-1.5">
            {pictograms.length > 0 ? (
              pictograms.map((pictogram) => (
                <HazcomPictogramIcon key={pictogram} pictogram={pictogram} />
              ))
            ) : (
              <Text as="span" className="text8 text-ehs-muted-text">
                —
              </Text>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("status", {
      header: "Status",
      size: expanded ? 120 : 116,
      minSize: 104,
      cell: (info) => (
        <IncidentBadge
          label={info.getValue()}
          tone={statusTone(info.getValue())}
          showDot
          className="text5 w-fit rounded-md px-2 py-0.5 tracking-normal"
        />
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      size: 56,
      minSize: 48,
      cell: ({ row }) => {
        const isOpen = selectedId === row.original.id;

        return (
          <button
            type="button"
            className={[
              "inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors",
              isOpen
                ? "bg-ehs-normal-blue/12 text-ehs-normal-blue"
                : "text-ehs-muted-text hover:text-ehs-dark-bg hover:bg-ehs-surface-inverse/6",
            ].join(" ")}
            aria-label={
              isOpen
                ? `Close details for ${row.original.chemicalName}`
                : `View ${row.original.chemicalName} SDS`
            }
            aria-pressed={isOpen}
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
  ] as ColumnDef<HazcomSdsRecord, unknown>[];

  // The eye stays for everyone — reading an SDS is exactly what a worker comes
  // here to do. Only the cog, which opens the edit route, is held back.
  if (!canManage) {
    return columns;
  }

  return withRowLink(columns, {
    getHref: (row) => sdsRecordHref(row.id),
    getAriaLabel: (row) => `Open SDS record ${row.chemicalName}`,
  }) as ColumnDef<HazcomSdsRecord, unknown>[];
}

function alignClass(align: "left" | "center" | "right" | undefined) {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}

export function SdsLibraryTable(props: Readonly<SdsLibraryTableProps>) {
  const {
    records,
    selectedId = null,
    onViewMore,
    expanded = true,
    canManage = false,
    header,
    className = "",
  } = props;

  const columns = useMemo(
    () =>
      createSdsLibraryColumns({
        selectedId,
        onViewMore: onViewMore ?? (() => undefined),
        expanded,
        canManage,
      }),
    [selectedId, onViewMore, expanded, canManage],
  );

  const router = useRouter();

  const table = useReactTable({
    data: records as HazcomSdsRecord[],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    defaultColumn: {
      minSize: 70,
      size: 120,
    },
  });

  const totalSize = table.getTotalSize();
  const cellPad = expanded ? "px-4" : "px-3";

  return (
    <IncidentGlassCard
      paddingClassName="p-0 overflow-hidden"
      className={["h-fit w-full min-w-0", className].filter(Boolean).join(" ")}
    >
      {header ? (
        <div className="border-ehs-border-ink/8 border-b px-4">{header}</div>
      ) : null}

      <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain">
        <table
          className="w-full table-fixed border-collapse text-left"
          style={tableMinWidthStyle(totalSize)}
        >
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
              <tr key={headerGroup.id} className="bg-ehs-light-bg/60">
                {headerGroup.headers.map((headerCell) => {
                  const align = COLUMN_ALIGN[headerCell.column.id] ?? "left";

                  return (
                    <th
                      key={headerCell.id}
                      style={columnWidthStyle(headerCell.getSize(), totalSize)}
                      className={[
                        "text6 text-ehs-muted-text py-3 select-none",
                        cellPad,
                        alignClass(align),
                      ].join(" ")}
                    >
                      {headerCell.isPlaceholder
                        ? null
                        : flexRender(
                            headerCell.column.columnDef.header,
                            headerCell.getContext(),
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
                  className="border-ehs-border-ink/8 border-t"
                >
                  <EmptyState
                    variant="plain"
                    icon="mdi:file-document-outline"
                    title="No safety data sheets found"
                    message="Try clearing the search or filters."
                  />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const isSelected = selectedId === row.original.id;

                return (
                  <tr
                    key={row.id}
                    // The id cell is the real link; this makes the whole row a
                    // target for the mouse, as every other register now does.
                    onClick={() => {
                      router.push(sdsRecordHref(row.original.id));
                    }}
                    className={[
                      "border-ehs-border-ink/8 cursor-pointer border-t transition-colors",
                      isSelected
                        ? "bg-ehs-light-blue/35"
                        : "hover:bg-ehs-light-bg/70",
                    ].join(" ")}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const align = COLUMN_ALIGN[cell.column.id] ?? "left";

                      return (
                        <td
                          key={cell.id}
                          style={columnWidthStyle(
                            cell.column.getSize(),
                            totalSize,
                          )}
                          className={[
                            "h-14 min-w-0 align-middle",
                            cellPad,
                            alignClass(align),
                          ].join(" ")}
                        >
                          <div
                            className={[
                              "flex w-full min-w-0 items-center",
                              align === "center"
                                ? "justify-center"
                                : align === "right"
                                  ? "justify-end"
                                  : "justify-start",
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
