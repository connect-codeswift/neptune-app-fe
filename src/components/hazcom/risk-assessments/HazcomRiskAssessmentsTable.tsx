"use client";

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
  assessmentStatusTone,
  HazcomBadge,
  HazcomGlassCard,
  riskLevelTone,
  type HazcomRiskAssessment,
} from "@/components/hazcom/shared";

export type HazcomRiskAssessmentsTableProps = Readonly<{
  assessments: readonly HazcomRiskAssessment[];
  className?: string;
}>;

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    align?: "left" | "center" | "right";
  }
}

const columnHelper = createColumnHelper<HazcomRiskAssessment>();

const columns: ColumnDef<HazcomRiskAssessment, unknown>[] = [
  columnHelper.accessor("id", {
    header: "ID",
    meta: { align: "left" },
    cell: (info) => (
      <Text as="span" className="text-ehs-normal-blue text-[13px] font-bold">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor("chemical", {
    header: "Chemical",
    meta: { align: "left" },
    cell: (info) => (
      <Text as="span" className="text-ehs-dark-bg text-[13px] font-bold">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor("exposureScenario", {
    header: "Exposure Scenario",
    meta: { align: "left" },
    cell: (info) => (
      <Text as="span" className="text-ehs-gray text-[13px]">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor("riskLevel", {
    header: "Risk Level",
    meta: { align: "left" },
    cell: (info) => (
      <HazcomBadge
        label={info.getValue()}
        tone={riskLevelTone(info.getValue())}
      />
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    meta: { align: "left" },
    cell: (info) => (
      <HazcomBadge
        label={info.getValue()}
        tone={assessmentStatusTone(info.getValue())}
      />
    ),
  }),
  columnHelper.accessor("reviewer", {
    header: "Reviewer",
    meta: { align: "left" },
    cell: (info) => (
      <Text as="span" className="text-ehs-dark-bg text-[13px]">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor("date", {
    header: "Date",
    meta: { align: "left" },
    cell: (info) => (
      <Text as="span" className="text-ehs-gray text-[13px]">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: "",
    meta: { align: "right" },
    cell: () => (
      <div className="flex items-center justify-end gap-2">
        <span
          aria-hidden="true"
          className="border-ehs-border text-ehs-muted-text inline-flex size-8 items-center justify-center rounded-lg border bg-white/70"
        >
          <Icon icon="mdi:eye-outline" className="size-4" aria-hidden="true" />
        </span>
        <span
          aria-hidden="true"
          className="border-ehs-border text-ehs-muted-text inline-flex size-8 items-center justify-center rounded-lg border bg-white/70"
        >
          <Icon
            icon="mdi:pencil-outline"
            className="size-4"
            aria-hidden="true"
          />
        </span>
      </div>
    ),
  }),
] as ColumnDef<HazcomRiskAssessment, unknown>[];

export function HazcomRiskAssessmentsTable(
  props: Readonly<HazcomRiskAssessmentsTableProps>,
) {
  const { assessments, className = "" } = props;

  const table = useReactTable({
    data: assessments as HazcomRiskAssessment[],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  return (
    <HazcomGlassCard
      paddingClassName="p-0 overflow-hidden"
      className={["w-full min-w-0", className].filter(Boolean).join(" ")}
    >
      <div className="w-full min-w-0 overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-left">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const align = header.column.columnDef.meta?.align;

                  return (
                    <th
                      key={header.id}
                      className={[
                        "text-ehs-muted-text px-4 pt-[13px] pb-[13.5px] text-[10px] font-bold tracking-[0.8px] uppercase",
                        align === "right" ? "text-right" : "text-left",
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
                    No risk assessments match your search.
                  </Text>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-[rgba(15,23,42,0.08)]"
                >
                  {row.getVisibleCells().map((cell) => {
                    const align = cell.column.columnDef.meta?.align;

                    return (
                      <td
                        key={cell.id}
                        className={[
                          "px-4 py-4 align-middle",
                          align === "right" ? "text-right" : "text-left",
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </HazcomGlassCard>
  );
}
