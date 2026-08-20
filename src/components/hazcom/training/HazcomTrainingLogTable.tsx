"use client";

import { EmptyState } from "@/components/ui/EmptyState";

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
import type { HazcomTrainingSession } from "@/components/hazcom/shared";

export type HazcomTrainingLogTableProps = Readonly<{
  sessions: readonly HazcomTrainingSession[];
  selectedId?: string | null;
  onViewMore?: (id: string) => void;
  /** When true (detail panel closed), columns use the wider layout. */
  expanded?: boolean;
  header?: ReactNode;
  className?: string;
}>;

const COLUMN_ALIGN: Readonly<Record<string, "left" | "center" | "right">> = {
  attendees: "center",
  status: "center",
  actions: "center",
};

const columnHelper = createColumnHelper<HazcomTrainingSession>();

const NO_STATUS_LABEL = "No status found";

function statusLabel(status: string | null): string {
  return status ?? NO_STATUS_LABEL;
}

function statusTone(status: string | null): IncidentBadgeTone {
  if (status == null) return "muted";
  return status.trim().toLowerCase() === "completed" ? "teal" : "warn";
}

export type TrainingLogColumnOptions = Readonly<{
  selectedId: string | null;
  onViewMore: (id: string) => void;
  expanded?: boolean;
}>;

/**
 * Note: avoid `size: 150` if migrating to the shared Table — that value means
 * “no width” there. This custom table uses relative widths, so sizes are
 * proportions only.
 */
function createTrainingLogColumns(
  options: TrainingLogColumnOptions,
): ColumnDef<HazcomTrainingSession, unknown>[] {
  const { selectedId, onViewMore, expanded = true } = options;

  return [
    columnHelper.accessor("id", {
      header: "ID",
      size: expanded ? 96 : 80,
      minSize: 72,
      cell: (info) => (
        <Text as="span" className="text7 text-ehs-muted-text tabular-nums">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("date", {
      header: "Date",
      size: expanded ? 112 : 100,
      minSize: 88,
      cell: (info) => (
        <Text as="span" className="text8 text-ehs-muted-text tabular-nums">
          {info.getValue() || "—"}
        </Text>
      ),
    }),
    columnHelper.accessor("trainer", {
      header: "Trainer",
      size: expanded ? 140 : 120,
      minSize: 100,
      cell: (info) => (
        <Text
          as="span"
          className="text4 text-ehs-darker truncate"
          title={info.getValue()}
        >
          {info.getValue() || "—"}
        </Text>
      ),
    }),
    columnHelper.accessor("topic", {
      header: "Topic",
      size: expanded ? 180 : 148,
      minSize: 120,
      cell: (info) => (
        <Text
          as="span"
          className="text4 text-ehs-darker truncate"
          title={info.getValue()}
        >
          {info.getValue() || "—"}
        </Text>
      ),
    }),
    ...(expanded
      ? [
          columnHelper.accessor("chemicals", {
            header: "Chemicals",
            size: 160,
            minSize: 120,
            cell: (info) => {
              const chemicals = info.getValue();
              const label = chemicals.length > 0 ? chemicals.join(", ") : "—";

              return (
                <Text
                  as="span"
                  className="text4 text-ehs-gray truncate"
                  title={label}
                >
                  {label}
                </Text>
              );
            },
          }),
          columnHelper.accessor("attendees", {
            header: "Attendees",
            size: 96,
            minSize: 80,
            cell: (info) => (
              <Text as="span" className="text4 text-ehs-darker tabular-nums">
                {String(info.getValue())}
              </Text>
            ),
          }),
        ]
      : []),
    columnHelper.accessor("status", {
      header: "Status",
      size: expanded ? 120 : 110,
      minSize: 96,
      cell: (info) => {
        const status = info.getValue();

        return (
          <IncidentBadge
            label={statusLabel(status)}
            tone={statusTone(status)}
            showDot
            className="text5 w-fit rounded-md px-2 py-0.5 tracking-normal"
          />
        );
      },
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
                ? `Close details for ${row.original.topic || row.original.id}`
                : `View ${row.original.topic || row.original.id}`
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
  ] as ColumnDef<HazcomTrainingSession, unknown>[];
}

function columnWidthStyle(size: number, totalSize: number) {
  return { width: `${(size / totalSize) * 100}%` };
}

function alignClass(align: "left" | "center" | "right" | undefined) {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}

export function HazcomTrainingLogTable(
  props: Readonly<HazcomTrainingLogTableProps>,
) {
  const {
    sessions,
    selectedId = null,
    onViewMore,
    expanded = true,
    header,
    className = "",
  } = props;

  const columns = useMemo(
    () =>
      createTrainingLogColumns({
        selectedId,
        onViewMore: onViewMore ?? (() => undefined),
        expanded,
      }),
    [selectedId, onViewMore, expanded],
  );

  const table = useReactTable({
    data: sessions as HazcomTrainingSession[],
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
                    icon="mdi:school-outline"
                    title="No training sessions found"
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
                    className={[
                      "border-ehs-border-ink/8 border-t transition-colors",
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
