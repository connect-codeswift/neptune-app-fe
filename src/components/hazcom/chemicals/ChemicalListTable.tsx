"use client";

import { useMemo, type ReactNode } from "react";
import { Icon } from "@iconify/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Text } from "@/components/Text";
import {
  IncidentBadge,
  type IncidentBadgeTone,
} from "@/components/near-miss/IncidentBadge";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  HazcomPictogramIcon,
  type HazcomChemical,
} from "@/components/hazcom/shared";
import { splitQuantity } from "@/components/hazcom/chemicals/chemical-utils";
import { formatRecordDisplayId } from "@/lib/format-record-id";

function signalTone(signalWord: string): IncidentBadgeTone {
  return signalWord.trim().toLowerCase() === "danger" ? "danger" : "warn";
}

function statusTone(status: string): IncidentBadgeTone {
  return status.trim().toLowerCase() === "active" ? "teal" : "muted";
}

export type ChemicalListTableProps = Readonly<{
  chemicals: readonly HazcomChemical[];
  selectedId?: string | null;
  onViewMore?: (id: string) => void;
  header?: ReactNode;
  className?: string;
}>;

/**
 * Column alignment, keyed by column id — presentation, so it lives with the
 * renderers that read it rather than in each column's `meta`.
 */
const COLUMN_ALIGN: Readonly<Record<string, "left" | "center" | "right">> = {
  signalWord: "center",
  status: "center",
  actions: "center",
};

const columnHelper = createColumnHelper<HazcomChemical>();

export type ChemicalListColumnOptions = Readonly<{
  selectedId: string | null;
  onViewMore: (id: string) => void;
}>;

/**
 * Note: avoid `size: 150` if migrating to the shared Table — that value means
 * “no width” there. This custom table uses relative widths, so sizes are
 * proportions only.
 */
function createChemicalListColumns(
  options: ChemicalListColumnOptions,
): ColumnDef<HazcomChemical, unknown>[] {
  const { selectedId, onViewMore } = options;

  return [
    columnHelper.display({
      id: "displayId",
      header: "ID",
      size: 108,
      minSize: 96,
      cell: ({ row }) => {
        const displayId = formatRecordDisplayId("CHEM", row.original.id);
        return (
          <Text
            as="span"
            className="text7 text-ehs-muted-text whitespace-nowrap"
            title={displayId}
          >
            {displayId}
          </Text>
        );
      },
    }),
    columnHelper.display({
      id: "name",
      header: "Chemical",
      size: 220,
      minSize: 160,
      cell: ({ row }) => (
        <Text
          as="span"
          className="text4 text-ehs-darker truncate"
          title={row.original.name}
        >
          {row.original.name}
        </Text>
      ),
    }),
    columnHelper.accessor("casNumber", {
      header: "CAS #",
      size: 108,
      minSize: 90,
      cell: (info) => (
        <Text as="span" className="text7 text-ehs-muted-text tabular-nums">
          {info.getValue() || "—"}
        </Text>
      ),
    }),
    columnHelper.accessor("location", {
      header: "Location",
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
    columnHelper.display({
      id: "quantity",
      header: "Qty",
      size: 96,
      minSize: 80,
      cell: ({ row }) => {
        const { amount, unit } = splitQuantity(row.original.quantity);

        return (
          <span className="inline-flex min-w-0 items-baseline gap-1">
            <Text as="span" className="text4 text-ehs-darker tabular-nums">
              {amount || "—"}
            </Text>
            {unit ? (
              <Text as="span" className="text8 text-ehs-muted-text">
                {unit}
              </Text>
            ) : null}
          </span>
        );
      },
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
    columnHelper.display({
      id: "pictograms",
      header: "GHS",
      size: 112,
      minSize: 96,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          {row.original.pictograms.length > 0 ? (
            row.original.pictograms.map((pictogram) => (
              <HazcomPictogramIcon key={pictogram} pictogram={pictogram} />
            ))
          ) : (
            <Text as="span" className="text8 text-ehs-muted-text">
              —
            </Text>
          )}
        </div>
      ),
    }),
    columnHelper.accessor("signalWord", {
      header: "Signal",
      size: 100,
      minSize: 88,
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
    columnHelper.accessor("status", {
      header: "Status",
      size: 100,
      minSize: 88,
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
                ? `Close details for ${row.original.name}`
                : `View ${row.original.name}`
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
  ] as ColumnDef<HazcomChemical, unknown>[];
}

function columnWidthStyle(size: number, totalSize: number) {
  return { width: `${(size / totalSize) * 100}%` };
}

function alignClass(align: "left" | "center" | "right" | undefined) {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}

export function ChemicalListTable(props: Readonly<ChemicalListTableProps>) {
  const {
    chemicals,
    selectedId = null,
    onViewMore,
    header,
    className = "",
  } = props;

  const columns = useMemo(
    () =>
      createChemicalListColumns({
        selectedId,
        onViewMore: onViewMore ?? (() => undefined),
      }),
    [selectedId, onViewMore],
  );

  const table = useReactTable({
    data: chemicals as HazcomChemical[],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    defaultColumn: {
      minSize: 60,
      size: 120,
    },
  });

  const totalSize = table.getTotalSize();

  return (
    <IncidentGlassCard
      paddingClassName="p-0 overflow-hidden"
      className={["h-fit w-full min-w-0", className].filter(Boolean).join(" ")}
    >
      {header ? (
        <div className="border-b border-ehs-border-ink/8 px-4">
          {header}
        </div>
      ) : null}

      <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain">
        <table className="w-full table-fixed border-collapse text-left">
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
                        "text6 text-ehs-muted-text px-4 py-3 select-none",
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
                  className="border-t border-ehs-border-ink/8 px-4 py-10 text-center"
                >
                  <Text as="p" className="text4 text-ehs-muted-text">
                    No chemicals match your search.
                  </Text>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const isSelected = selectedId === row.original.id;

                return (
                  <tr
                    key={row.id}
                    className={[
                      "border-t border-ehs-border-ink/8 transition-colors",
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
                            "h-14 min-w-0 px-4 align-middle",
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
