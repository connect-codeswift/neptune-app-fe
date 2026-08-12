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

/**
 * Column alignment, keyed by column id — presentation, so it lives with the
 * renderers that read it rather than in each column's `meta`. `meta` is one
 * interface shared by every table in the project, so putting `align` there
 * hands it to tables that have no use for it. Anything absent is left-aligned.
 */
const COLUMN_ALIGN: Readonly<Record<string, "left" | "center" | "right">> = {
  actions: "right",
};

const columnHelper = createColumnHelper<HazcomTrainingSession>();

const columns: ColumnDef<HazcomTrainingSession, unknown>[] = [
  columnHelper.accessor("id", {
    header: "ID",
    cell: (info) => (
      <Text as="span" className="text5 text-ehs-normal-blue">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor("date", {
    header: "Date",
    cell: (info) => (
      <Text as="span" className="text4 text-ehs-gray">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor("trainer", {
    header: "Trainer",
    cell: (info) => (
      <Text as="span" className="text4 text-ehs-dark-bg">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor("topic", {
    header: "Topic",
    cell: (info) => (
      <Text as="span" className="text5 text-ehs-dark-bg">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor("chemicals", {
    header: "Chemicals",
    cell: (info) => (
      <Text as="span" className="text4 text-ehs-gray">
        {info.getValue().join(", ")}
      </Text>
    ),
  }),
  columnHelper.accessor("attendees", {
    header: "Attendees",
    cell: (info) => (
      <Text as="span" className="text5 text-ehs-dark-bg">
        {`${info.getValue()}`}
      </Text>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
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
        <table className="w-full min-w-225 border-collapse text-left">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const align = COLUMN_ALIGN[header.column.id] ?? "left";

                  return (
                    <th
                      key={header.id}
                      className={[
                        "text6 text-ehs-muted-text px-4 pt-3.25 pb-[13.5px]",
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
                  <Text as="p" className="text4 text-ehs-muted-text">
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
                    const align = COLUMN_ALIGN[cell.column.id] ?? "left";

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
