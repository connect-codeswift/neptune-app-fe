import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import type { IncidentBadgeTone } from "@/components/near-miss/IncidentBadge";
import type { CapaDashboardItem } from "@/components/capa/capa-dashboard-data";
import { formatRecordDisplayId } from "@/lib/format-record-id";

const columnHelper = createColumnHelper<CapaDashboardItem>();

function statusTone(status: string): IncidentBadgeTone {
  const normalized = status
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
  if (normalized === "overdue") return "danger";
  if (normalized === "pending" || normalized === "verified") return "warn";
  if (normalized === "inprogress" || normalized === "open") return "teal";
  if (
    normalized === "complete" ||
    normalized === "closed" ||
    normalized === "completed"
  )
    return "muted";
  return "muted";
}

function priorityTone(priority: string): IncidentBadgeTone {
  switch (priority.trim().toLowerCase()) {
    case "high":
    case "critical":
      return "danger";
    case "medium":
    case "moderate":
      return "warn";
    case "low":
      return "teal";
    default:
      return "muted";
  }
}

function formatPriorityLabel(priority: string): string {
  const trimmed = priority.trim();
  if (!trimmed) return "—";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

function isOverdue(item: CapaDashboardItem): boolean {
  return (
    item.status.trim().toLowerCase() === "overdue" ||
    item.dueLabel.trim().toLowerCase() === "overdue"
  );
}

function shortName(value: string): string {
  const name = value.trim();
  if (!name || name === "—") return "—";
  return name.split(/\s+/).slice(0, 2).join(" ");
}

function clipWords(value: string, maxWords = 4): string {
  const trimmed = value.trim();
  if (!trimmed) return "—";

  const words = trimmed.split(/\s+/);
  if (words.length <= maxWords) return trimmed;

  return `${words.slice(0, maxWords).join(" ")}…`;
}

/**
 * Compact progress meter.
 * Note: never use column `size: 150` — Table treats that as “no width”, so the
 * column swallows leftover space and opens a large gap in the row.
 */
function ProgressMeter(props: Readonly<{ value: number; compact?: boolean }>) {
  const { value, compact = false } = props;
  const clamped = Math.max(0, Math.min(100, value));

  if (compact) {
    return (
      <Text as="span" className="text4 text-ehs-gray tabular-nums">
        {`${String(clamped)}%`}
      </Text>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-[rgba(11,19,32,0.08)]"
        aria-hidden="true"
      >
        <span
          className={[
            "block h-full rounded-full",
            clamped >= 100
              ? "bg-ehs-green"
              : clamped >= 50
                ? "bg-ehs-normal-blue"
                : "bg-ehs-yellow",
          ].join(" ")}
          style={{ width: `${String(clamped)}%` }}
        />
      </span>
      <Text as="span" className="text4 text-ehs-gray tabular-nums">
        {`${String(clamped)}%`}
      </Text>
    </div>
  );
}

export type CapaColumnOptions = Readonly<{
  selectedId: string | null;
  onViewMore: (id: string) => void;
  /** Wider columns when the side detail panel is closed. */
  expanded?: boolean;
}>;

export function createCapaColumns(
  options: CapaColumnOptions,
): ColumnDef<CapaDashboardItem, unknown>[] {
  const { selectedId, onViewMore, expanded = true } = options;

  return [
    columnHelper.display({
      id: "displayId",
      header: "ID",
      size: 108,
      minSize: 96,
      meta: { align: "left" as const, verticalAlign: "middle" as const },
      cell: ({ row }) => {
        const displayId = formatRecordDisplayId("CAPA", row.original.id);
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
    columnHelper.accessor("title", {
      header: "CAPA",
      minSize: 180,
      meta: { align: "left" as const },
      cell: ({ row }) => {
        const item = row.original;
        const label = clipWords(item.title);

        return (
          <Text
            as="span"
            className="text4 text-ehs-darker truncate"
            title={item.title}
          >
            {label}
          </Text>
        );
      },
    }),
    ...(expanded
      ? [
          columnHelper.accessor("priority", {
            header: "Priority",
            size: 120,
            minSize: 90,
            meta: {
              align: "left" as const,
              verticalAlign: "middle" as const,
            },
            cell: (info) => {
              const label = formatPriorityLabel(info.getValue());
              return (
                <IncidentBadge
                  label={label}
                  tone={priorityTone(info.getValue())}
                  showDot
                  className="text5 w-fit rounded-md px-2 py-0.5 tracking-normal"
                />
              );
            },
          }),
        ]
      : []),
    columnHelper.accessor("owner", {
      header: "Assigned To",
      size: expanded ? 140 : 112,
      minSize: 90,
      meta: { align: "left" as const, verticalAlign: "middle" as const },
      cell: (info) => {
        const name = info.getValue()?.trim() || "—";
        return (
          <Text as="span" className="text4 text-ehs-gray truncate" title={name}>
            {shortName(name)}
          </Text>
        );
      },
    }),
    columnHelper.accessor("progress", {
      header: "Progress",
      size: expanded ? 148 : 72,
      minSize: 64,
      meta: { align: "left" as const, verticalAlign: "middle" as const },
      cell: (info) => (
        <ProgressMeter value={info.getValue()} compact={!expanded} />
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      size: expanded ? 128 : 112,
      minSize: 96,
      meta: { align: "left" as const, verticalAlign: "middle" as const },
      cell: (info) => (
        <IncidentBadge
          label={info.getValue()}
          tone={statusTone(info.getValue())}
          showDot
          className="text5 w-fit rounded-md px-2 py-0.5 tracking-normal"
        />
      ),
    }),
    columnHelper.accessor("dueDate", {
      header: "Due",
      size: expanded ? 112 : 96,
      minSize: 84,
      meta: { align: "left" as const, verticalAlign: "middle" as const },
      cell: (info) => {
        const overdue = isOverdue(info.row.original);
        return (
          <Text
            as="span"
            className={[
              "whitespace-nowrap tabular-nums",
              overdue ? "text4 text-ehs-red" : "text4 text-ehs-gray",
            ].join(" ")}
          >
            {info.getValue() || "—"}
          </Text>
        );
      },
    }),
    columnHelper.display({
      id: "view",
      header: "",
      size: 56,
      minSize: 48,
      meta: { align: "center" as const, verticalAlign: "middle" as const },
      cell: ({ row }) => {
        const isOpen = selectedId === row.original.id;

        return (
          <button
            type="button"
            className={[
              "inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors",
              isOpen
                ? "bg-ehs-normal-blue/12 text-ehs-normal-blue"
                : "text-ehs-muted-text hover:text-ehs-dark-bg hover:bg-[rgba(11,19,32,0.06)]",
            ].join(" ")}
            aria-label={
              isOpen
                ? `Close details for ${row.original.code}`
                : `View ${row.original.code}`
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
  ] as ColumnDef<CapaDashboardItem, unknown>[];
}
