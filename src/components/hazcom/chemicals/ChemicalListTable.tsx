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

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    align?: "left" | "center" | "right";
  }
}

const columnHelper = createColumnHelper<HazcomChemical>();

const columns: ColumnDef<HazcomChemical, unknown>[] = [
  columnHelper.display({
    id: "name",
    header: "Chemical Name",
    size: 220,
    minSize: 160,
    meta: { align: "left" },
    cell: ({ row }) => (
      <div className="flex min-w-0 flex-col gap-0.5">
        <Text as="p" className="text4 text-ehs-darker truncate font-semibold">
          {row.original.name}
        </Text>
        <Text as="p" className="text7 text-ehs-muted-text">
          {row.original.id}
        </Text>
      </div>
    ),
  }),
  columnHelper.accessor("casNumber", {
    header: "CAS #",
    size: 100,
    minSize: 90,
    meta: { align: "left" },
    cell: (info) => (
      <Text as="span" className="text4 text-ehs-gray tabular-nums">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor("location", {
    header: "Location",
    size: 150,
    minSize: 120,
    meta: { align: "left" },
    cell: (info) => (
      <Text as="span" className="text4 text-ehs-gray block truncate">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.display({
    id: "quantity",
    header: "Quantity",
    size: 100,
    minSize: 90,
    meta: { align: "left" },
    cell: ({ row }) => {
      const { amount, unit } = splitQuantity(row.original.quantity);

      return (
        <span className="inline-flex items-baseline gap-1">
          <Text
            as="span"
            className="text4 text-ehs-darker font-semibold tabular-nums"
          >
            {amount}
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
    header: "Hazard Class",
    size: 160,
    minSize: 120,
    meta: { align: "left" },
    cell: (info) => (
      <Text as="span" className="text4 text-ehs-gray">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.display({
    id: "pictograms",
    header: "Pictograms",
    size: 120,
    minSize: 100,
    meta: { align: "left" },
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
    meta: { align: "center" },
    cell: (info) => (
      <Text
        as="span"
        className={[
          "text5 tracking-wide uppercase",
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
    meta: { align: "center" },
    cell: (info) => (
      <Text
        as="span"
        className={["text5", chemicalStatusTextClass(info.getValue())].join(
          " ",
        )}
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
    meta: { align: "right" },
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-0.5">
        <Link
          href={`/dashboard/hazcom/chemicals/${row.original.id}`}
          aria-label={`View ${row.original.name}`}
          className="text-ehs-muted-text hover:text-ehs-dark-bg inline-flex size-8 items-center justify-center rounded-lg transition-colors"
        >
          <Icon icon="lets-icons:view" className="size-5" aria-hidden="true" />
        </Link>
        <Link
          href={`/dashboard/hazcom/chemicals/${row.original.id}/edit`}
          aria-label={`Edit ${row.original.name}`}
          className="text-ehs-muted-text hover:text-ehs-dark-bg inline-flex size-8 items-center justify-center rounded-lg transition-colors"
        >
          <Icon
            icon="solar:pen-linear"
            className="size-4.5"
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
                  const align = header.column.columnDef.meta?.align;

                  return (
                    <th
                      key={header.id}
                      style={columnWidthStyle(header.getSize(), totalSize)}
                      className={[
                        "text6 text-ehs-muted-text px-4 py-3",
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
                  <Text as="p" className="text4 text-ehs-muted-text">
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
                    const align = cell.column.columnDef.meta?.align;

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
