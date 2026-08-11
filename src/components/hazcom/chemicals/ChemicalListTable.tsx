"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Text } from "@/components/Text";
import {
  HazcomGlassCard,
  HazcomPictogramIcon,
  type HazcomChemical,
} from "@/components/hazcom/shared";
import {
  chemicalStatusTextClass,
  signalWordTextClass,
  splitQuantity,
} from "@/components/hazcom/chemicals/chemical-utils";

export type ChemicalListTableProps = Readonly<{
  chemicals: readonly HazcomChemical[];
  className?: string;
}>;

/**
 * Column alignment, keyed by column id — presentation, so it lives with the
 * renderers that read it rather than in each column's `meta`. `meta` is one
 * interface shared by every table in the project, so putting `align` there
 * hands it to tables that have no use for it. Anything absent is left-aligned.
 */
const COLUMN_ALIGN: Readonly<Record<string, "left" | "center" | "right">> = {
  signalWord: "center",
  status: "center",
  actions: "right",
};

const columnHelper = createColumnHelper<HazcomChemical>();

const columns: ColumnDef<HazcomChemical, unknown>[] = [
  columnHelper.display({
    id: "name",
    header: "Chemical Name",
    size: 220,
    minSize: 160,
    cell: ({ row }) => (
      <div className="flex min-w-0 flex-col gap-0.5">
        <Text as="p" className="text-ehs-darker truncate text-[13px] font-bold">
          {row.original.name}
        </Text>
        <Text as="p" className="text-ehs-muted-text text-[11px]">
          {row.original.id}
        </Text>
      </div>
    ),
  }),
  columnHelper.accessor("casNumber", {
    header: "CAS #",
    size: 100,
    minSize: 90,
    cell: (info) => (
      <Text as="span" className="text-ehs-gray text-[13px] tabular-nums">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor("location", {
    header: "Location",
    size: 150,
    minSize: 120,
    cell: (info) => (
      <Text as="span" className="text-ehs-gray block truncate text-[13px]">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.display({
    id: "quantity",
    header: "Quantity",
    size: 100,
    minSize: 90,
    cell: ({ row }) => {
      const { amount, unit } = splitQuantity(row.original.quantity);

      return (
        <span className="inline-flex items-baseline gap-1">
          <Text
            as="span"
            className="text-ehs-darker text-[13px] font-bold tabular-nums"
          >
            {amount}
          </Text>
          {unit ? (
            <Text as="span" className="text-ehs-muted-text text-[11px]">
              {unit}
            </Text>
          ) : null}
        </span>
      );
    },
  }),
  columnHelper.accessor("hazardClass", {
    header: "Hazard Class",
    size: 160,
    minSize: 120,
    cell: (info) => (
      <Text as="span" className="text-ehs-gray text-[13px]">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.display({
    id: "pictograms",
    header: "Pictograms",
    size: 120,
    minSize: 100,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.pictograms.map((pictogram) => (
          <HazcomPictogramIcon key={pictogram} pictogram={pictogram} />
        ))}
      </div>
    ),
  }),
  columnHelper.accessor("signalWord", {
    header: "Signal",
    size: 90,
    minSize: 80,
    cell: (info) => (
      <Text
        as="span"
        className={[
          "text-[13px] font-bold tracking-wide uppercase",
          signalWordTextClass(info.getValue()),
        ].join(" ")}
      >
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    size: 100,
    minSize: 90,
    cell: (info) => (
      <Text
        as="span"
        className={[
          "text-[13px] font-bold",
          chemicalStatusTextClass(info.getValue()),
        ].join(" ")}
      >
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: "",
    size: 80,
    minSize: 72,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1.5">
        <Link
          href={`/dashboard/hazcom/chemicals/${row.original.id}`}
          aria-label={`View ${row.original.name}`}
          className="border-ehs-border text-ehs-gray hover:bg-ehs-light-bg inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-white transition-colors"
        >
          <Icon icon="mdi:eye-outline" className="size-4" aria-hidden="true" />
        </Link>
        <Link
          href={`/dashboard/hazcom/chemicals/${row.original.id}/edit`}
          aria-label={`Edit ${row.original.name}`}
          className="border-ehs-border text-ehs-gray hover:bg-ehs-light-bg inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-white transition-colors"
        >
          <Icon
            icon="mdi:pencil-outline"
            className="size-4"
            aria-hidden="true"
          />
        </Link>
      </div>
    ),
  }),
] as ColumnDef<HazcomChemical, unknown>[];

function columnWidthStyle(size: number, totalSize: number) {
  return { width: `${(size / totalSize) * 100}%` };
}

function alignClass(align: "left" | "center" | "right" | undefined) {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}

export function ChemicalListTable(props: Readonly<ChemicalListTableProps>) {
  const { chemicals, className = "" } = props;

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
    <HazcomGlassCard
      paddingClassName="p-0 overflow-hidden"
      className={["h-fit w-full min-w-0", className].filter(Boolean).join(" ")}
    >
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
                {headerGroup.headers.map((header) => {
                  const align = COLUMN_ALIGN[header.column.id] ?? "left";

                  return (
                    <th
                      key={header.id}
                      style={columnWidthStyle(header.getSize(), totalSize)}
                      className={[
                        "text-ehs-muted-text px-4 pt-[13px] pb-[13.5px] text-[10px] font-bold tracking-[0.8px] uppercase",
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
                  colSpan={columns.length}
                  className="border-t border-[rgba(15,23,42,0.08)] px-4 py-10 text-center"
                >
                  <Text as="p" className="text-ehs-muted-text text-sm">
                    No chemicals match your search.
                  </Text>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-ehs-light-bg/70 border-t border-[rgba(15,23,42,0.08)] transition-colors"
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
                          "h-16 min-w-0 px-4 align-middle",
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </HazcomGlassCard>
  );
}
