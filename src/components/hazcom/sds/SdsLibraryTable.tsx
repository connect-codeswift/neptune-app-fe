"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { Text } from "@/components/Text";
import {
  HazcomBadge,
  HazcomGlassCard,
  HazcomPictogramChip,
  sdsStatusTone,
  type HazcomSdsRecord,
} from "@/components/hazcom/shared";

export type SdsLibraryTableProps = Readonly<{
  records: readonly HazcomSdsRecord[];
  className?: string;
}>;

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- TData/TValue must be repeated to match the library's ColumnMeta signature for declaration merging
  interface ColumnMeta<TData, TValue> {
    align?: "left" | "center" | "right";
  }
}

const columnHelper = createColumnHelper<HazcomSdsRecord>();

const signalWordClass: Record<string, string> = {
  Danger: "text-ehs-red",
  Warning: "text-ehs-yellow",
};

const columns = [
  columnHelper.accessor("id", {
    header: "SDS ID",
    size: 100,
    meta: { align: "left" },
    cell: (info) => (
      <Link
        href={`/dashboard/hazcom/sds/${info.getValue()}`}
        className="text-ehs-dark-blue text-[13px] font-bold hover:underline"
      >
        {info.getValue()}
      </Link>
    ),
  }),
  columnHelper.display({
    id: "chemical",
    header: "Chemical Name",
    size: 170,
    meta: { align: "left" },
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <Text as="p" className="text-ehs-darker text-[13px] font-bold">
          {row.original.chemicalName}
        </Text>
        <Text as="p" className="text-ehs-muted-text text-[11px]">
          {row.original.version}
        </Text>
      </div>
    ),
  }),
  columnHelper.accessor("manufacturer", {
    header: "Manufacturer",
    size: 140,
    meta: { align: "left" },
    cell: (info) => (
      <Text as="span" className="text-ehs-gray text-[13px]">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor("casNumber", {
    header: "CAS #",
    size: 110,
    meta: { align: "left" },
    cell: (info) => (
      <Text as="span" className="text-ehs-gray text-[13px] tabular-nums">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor("hazardClass", {
    header: "Hazard Class",
    size: 150,
    meta: { align: "left" },
    cell: (info) => (
      <Text as="span" className="text-ehs-gray text-[13px]">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor("signalWord", {
    header: "Signal",
    size: 90,
    meta: { align: "left" },
    cell: (info) => (
      <Text
        as="span"
        className={[
          "text-[13px] font-bold uppercase tracking-wide",
          signalWordClass[info.getValue()] ?? "text-ehs-gray",
        ].join(" ")}
      >
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor("pictograms", {
    header: "Pictograms",
    size: 150,
    meta: { align: "left" },
    cell: (info) => (
      <div className="flex flex-wrap items-center gap-1">
        {info.getValue().map((pictogram) => (
          <HazcomPictogramChip key={pictogram} pictogram={pictogram} />
        ))}
      </div>
    ),
  }),
  columnHelper.accessor("revisedOn", {
    header: "Revised",
    size: 100,
    meta: { align: "left" },
    cell: (info) => (
      <Text as="span" className="text-ehs-gray text-[13px] tabular-nums">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    size: 110,
    meta: { align: "left" },
    cell: (info) => (
      <HazcomBadge
        label={info.getValue()}
        tone={sdsStatusTone(info.getValue())}
        showDot
      />
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: "",
    size: 90,
    meta: { align: "right" },
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1.5">
        <Link
          href={`/dashboard/hazcom/sds/${row.original.id}`}
          aria-label={`View ${row.original.chemicalName} SDS`}
          title="View SDS"
          className="border-ehs-border text-ehs-gray hover:bg-ehs-light-bg inline-flex size-8 shrink-0 items-center justify-center rounded-lg border bg-white transition-colors"
        >
          <Icon icon="mdi:eye-outline" className="size-4" aria-hidden="true" />
        </Link>
        <button
          type="button"
          aria-label={`Download ${row.original.chemicalName} SDS`}
          title="Download SDS"
          className="border-ehs-border text-ehs-gray hover:bg-ehs-light-bg inline-flex size-8 shrink-0 items-center justify-center rounded-lg border bg-white transition-colors"
        >
          <Icon
            icon="mdi:tray-arrow-down"
            className="size-4"
            aria-hidden="true"
          />
        </button>
      </div>
    ),
  }),
] as ColumnDef<HazcomSdsRecord, unknown>[];

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

export function SdsLibraryTable(props: Readonly<SdsLibraryTableProps>) {
  const { records, className = "" } = props;

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
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const align = header.column.columnDef.meta?.align;

                  return (
                    <th
                      key={header.id}
                      style={columnWidthStyle(header.getSize(), totalSize)}
                      className={[
                        "text-ehs-muted-text px-3 pt-[13px] pb-[13.5px] text-[10px] font-bold tracking-[0.8px] uppercase sm:px-4",
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
                    No SDS records match your search.
                  </Text>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-[rgba(15,23,42,0.08)] transition-colors hover:bg-ehs-light-bg/70"
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
                          "min-w-0 px-3 py-3 align-middle sm:px-4",
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
