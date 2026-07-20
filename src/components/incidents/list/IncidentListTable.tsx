"use client";

import { useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  IncidentBadge,
  severityTone,
  stageTone,
  stateTone,
} from "@/components/incidents/list/IncidentBadge";
import type { IncidentRecord } from "@/components/incidents/list/incident-list-types";

export type IncidentListTableProps = Readonly<{
  incidents: readonly IncidentRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** When true (detail panel closed), columns and text use a wider layout */
  expanded?: boolean;
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

function createColumns(expanded: boolean) {
  return [
    columnHelper.accessor("id", {
      header: "ID",
      size: expanded ? 120 : 90,
      minSize: 72,
      meta: { align: "left" as const },
      cell: (info) => (
        <Text
          as="span"
          className={[
            "text-ehs-muted-text block font-normal tabular-nums",
            expanded ? "text-[13px]" : "truncate text-[11px]",
          ].join(" ")}
        >
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.display({
      id: "incident",
      header: "Incident",
      size: expanded ? 420 : 220,
      minSize: 140,
      meta: { align: "left" as const },
      cell: ({ row }) => (
        <div className="flex min-w-0 w-full flex-col gap-1">
          <Text
            as="p"
            className={[
              "text-ehs-dark-bg leading-normal font-normal",
              expanded
                ? "text-[14px] leading-5"
                : "line-clamp-2 text-[11.6px]",
            ].join(" ")}
          >
            {row.original.title}
          </Text>
          <Text
            as="p"
            className={[
              "text-ehs-muted-text leading-normal font-normal",
              expanded
                ? "text-[12px] leading-[16px]"
                : "line-clamp-2 text-[10px]",
            ].join(" ")}
          >
            {row.original.description}
          </Text>
        </div>
      ),
    }),
    columnHelper.accessor("site", {
      header: "Site",
      size: expanded ? 160 : 100,
      minSize: 80,
      meta: { align: "left" as const },
      cell: (info) => {
        const [sitePrimary, siteSecondary] = siteLines(info.getValue());

        return (
          <div className="min-w-0 w-full">
            <Text
              as="p"
              className={[
                "text-ehs-gray",
                expanded ? "text-[13px]" : "truncate text-[12px]",
              ].join(" ")}
            >
              {sitePrimary}
            </Text>
            {siteSecondary ? (
              <Text
                as="p"
                className={[
                  "text-ehs-gray",
                  expanded ? "text-[13px]" : "truncate text-[12px]",
                ].join(" ")}
              >
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
    columnHelper.accessor("stage", {
      header: "Stage",
      size: expanded ? 150 : 110,
      minSize: 90,
      meta: { align: "center" as const },
      cell: (info) => (
        <IncidentBadge
          label={info.getValue()}
          tone={stageTone(info.getValue())}
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
  ];
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

export function IncidentListTable(props: Readonly<IncidentListTableProps>) {
  const {
    incidents,
    selectedId,
    onSelect,
    expanded = false,
    className = "",
  } = props;

  const columns = useMemo(() => createColumns(expanded), [expanded]);

  const table = useReactTable({
    data: incidents as IncidentRecord[],
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
      className={["h-fit min-w-0 w-full", className].filter(Boolean).join(" ")}
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
                        "text-ehs-muted-text font-bold tracking-[0.8px] uppercase",
                        expanded
                          ? "px-5 pt-4 pb-4 text-[11px]"
                          : "px-3 pt-[13px] pb-[13.5px] text-[10px] sm:px-4",
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
            {table.getRowModel().rows.map((row) => {
              const isSelected = selectedId === row.original.id;

              return (
                <tr
                  key={row.id}
                  onClick={() => onSelect(row.original.id)}
                  className={[
                    "cursor-pointer border-t border-[rgba(15,23,42,0.08)] transition-colors",
                    isSelected
                      ? "bg-ehs-normal-blue/18"
                      : "hover:bg-ehs-light-bg/70",
                  ].join(" ")}
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
                          "min-w-0 align-middle",
                          expanded
                            ? "h-[108px] px-5"
                            : "h-[97px] px-3 sm:px-4",
                          alignClass(align),
                        ].join(" ")}
                      >
                        <div
                          className={[
                            "flex min-w-0 w-full items-center",
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
            })}
          </tbody>
        </table>
      </div>
    </IncidentGlassCard>
  );
}
