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
import type { HazcomRiskAssessment } from "@/components/hazcom/shared";

export type HazcomRiskAssessmentsTableProps = Readonly<{
  assessments: readonly HazcomRiskAssessment[];
  selectedId?: string | null;
  onViewMore?: (id: string) => void;
  /** When true (detail panel closed), columns use the wider layout. */
  expanded?: boolean;
  header?: ReactNode;
  className?: string;
}>;

const COLUMN_ALIGN: Readonly<Record<string, "left" | "center" | "right">> = {
  riskLevel: "center",
  status: "center",
  actions: "center",
};

const columnHelper = createColumnHelper<HazcomRiskAssessment>();

function riskLevelTone(value: string): IncidentBadgeTone {
  switch (value.trim().toLowerCase()) {
    case "low":
      return "teal";
    case "medium":
      return "warn";
    case "high":
    case "critical":
      return "danger";
    default:
      return "neutral";
  }
}

function assessmentStatusTone(value: string): IncidentBadgeTone {
  switch (value.trim().toLowerCase()) {
    case "approved":
      return "teal";
    case "pending":
      return "warn";
    case "draft":
      return "muted";
    default:
      return "neutral";
  }
}

export type RiskAssessmentColumnOptions = Readonly<{
  selectedId: string | null;
  onViewMore: (id: string) => void;
  expanded?: boolean;
}>;

function createRiskAssessmentColumns(
  options: RiskAssessmentColumnOptions,
): ColumnDef<HazcomRiskAssessment, unknown>[] {
  const { selectedId, onViewMore, expanded = true } = options;

  return [
    columnHelper.accessor("id", {
      header: "ID",
      size: expanded ? 88 : 80,
      minSize: 72,
      cell: (info) => (
        <Text as="span" className="text7 text-ehs-muted-text tabular-nums">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("chemical", {
      header: "Chemical",
      size: expanded ? 160 : 140,
      minSize: 112,
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
          columnHelper.accessor("exposureScenario", {
            header: "Exposure Scenario",
            size: 200,
            minSize: 140,
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
        ]
      : []),
    columnHelper.accessor("riskLevel", {
      header: "Risk Level",
      size: expanded ? 120 : 110,
      minSize: 96,
      cell: (info) => (
        <IncidentBadge
          label={info.getValue()}
          tone={riskLevelTone(info.getValue())}
          className="text5 w-fit rounded-md px-2 py-0.5 tracking-normal"
        />
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      size: expanded ? 120 : 110,
      minSize: 96,
      cell: (info) => (
        <IncidentBadge
          label={info.getValue()}
          tone={assessmentStatusTone(info.getValue())}
          showDot
          className="text5 w-fit rounded-md px-2 py-0.5 tracking-normal"
        />
      ),
    }),
    ...(expanded
      ? [
          columnHelper.accessor("reviewer", {
            header: "Reviewer",
            size: 140,
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
          columnHelper.accessor("date", {
            header: "Date",
            size: 112,
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
                ? `Close details for ${row.original.chemical || row.original.id}`
                : `View ${row.original.chemical || row.original.id}`
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
  ] as ColumnDef<HazcomRiskAssessment, unknown>[];
}

// Percentage widths on a `table-fixed w-full` table always fill the
// container exactly, so `overflow-x-auto` never triggers — the columns just
// compress instead of scrolling. Fixed px widths (plus a `min-width` on the
// `<table>` equal to their sum) let the table actually exceed its container.
function columnWidthStyle(size: number) {
  return { width: `${size}px` };
}

function alignClass(align: "left" | "center" | "right" | undefined) {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}

export function HazcomRiskAssessmentsTable(
  props: Readonly<HazcomRiskAssessmentsTableProps>,
) {
  const {
    assessments,
    selectedId = null,
    onViewMore,
    expanded = true,
    header,
    className = "",
  } = props;

  const columns = useMemo(
    () =>
      createRiskAssessmentColumns({
        selectedId,
        onViewMore: onViewMore ?? (() => undefined),
        expanded,
      }),
    [selectedId, onViewMore, expanded],
  );

  const table = useReactTable({
    data: assessments as HazcomRiskAssessment[],
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
          className="border-collapse text-left"
          style={{ minWidth: `${totalSize}px` }}
        >
          <colgroup>
            {table.getAllLeafColumns().map((column) => (
              <col key={column.id} style={columnWidthStyle(column.getSize())} />
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
                      style={columnWidthStyle(headerCell.getSize())}
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
                    icon="mdi:clipboard-alert-outline"
                    title="No risk assessments found"
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
                        ? "bg-ehs-normal-blue/6"
                        : "hover:bg-ehs-surface-inverse/2",
                    ].join(" ")}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const align = COLUMN_ALIGN[cell.column.id] ?? "left";

                      return (
                        <td
                          key={cell.id}
                          style={columnWidthStyle(cell.column.getSize())}
                          className={[
                            "py-3 align-middle",
                            cellPad,
                            alignClass(align),
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </IncidentGlassCard>
  );
}
