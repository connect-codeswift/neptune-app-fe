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
  HazcomBadge,
  HazcomGlassCard,
  trainingStatusTone,
  type HazcomTrainingSession,
} from "@/components/hazcom/shared";

export type HazcomTrainingLogTableProps = Readonly<{
  sessions: readonly HazcomTrainingSession[];
  className?: string;
}>;

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    align?: "left" | "center" | "right";
  }
}

const columnHelper = createColumnHelper<HazcomTrainingSession>();

const columns: ColumnDef<HazcomTrainingSession, unknown>[] = [
  columnHelper.accessor("id", {
    header: "ID",
    meta: { align: "left" },
    cell: (info) => (
      <Text as="span" className="text-ehs-normal-blue text-[13px] font-bold">
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
  columnHelper.accessor("trainer", {
    header: "Trainer",
    meta: { align: "left" },
    cell: (info) => (
      <Text as="span" className="text-ehs-dark-bg text-[13px]">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor("topic", {
    header: "Topic",
    meta: { align: "left" },
    cell: (info) => (
      <Text as="span" className="text-ehs-dark-bg text-[13px] font-bold">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor("chemicals", {
    header: "Chemicals",
    meta: { align: "left" },
    cell: (info) => (
      <Text as="span" className="text-ehs-gray text-[13px]">
        {info.getValue().join(", ")}
      </Text>
    ),
  }),
  columnHelper.accessor("attendees", {
    header: "Attendees",
    meta: { align: "left" },
    cell: (info) => (
      <Text as="span" className="text-ehs-dark-bg text-[13px] font-bold">
        {`${info.getValue()}`}
      </Text>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    meta: { align: "left" },
    cell: (info) => (
      <HazcomBadge
        label={info.getValue()}
        tone={trainingStatusTone(info.getValue())}
      />
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: "",
    meta: { align: "right" },
    cell: () => (
      <span
        aria-hidden="true"
        className="border-ehs-border text-ehs-muted-text inline-flex size-8 items-center justify-center rounded-lg border bg-white/70"
      >
        <Icon icon="mdi:eye-outline" className="size-4" aria-hidden="true" />
      </span>
    ),
  }),
] as ColumnDef<HazcomTrainingSession, unknown>[];

export function HazcomTrainingLogTable(
  props: Readonly<HazcomTrainingLogTableProps>,
) {
  const { sessions, className = "" } = props;

  const table = useReactTable({
    data: sessions as HazcomTrainingSession[],
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
        <table className="w-full min-w-[900px] border-collapse text-left">
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
                    No training sessions logged yet.
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
