import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import type { IncidentBadgeTone } from "@/components/near-miss/IncidentBadge";
import type { AuditRecord } from "@/app/dashboard/audits/audits-data";
import { formatRecordDisplayId } from "@/lib/format-record-id";

const columnHelper = createColumnHelper<AuditRecord>();

function statusTone(status: string): IncidentBadgeTone {
  const normalized = status.trim().toLowerCase();
  if (normalized === "overdue") return "danger";
  if (normalized === "in progress" || normalized === "inprogress")
    return "teal";
  if (
    normalized === "closed" ||
    normalized === "completed" ||
    normalized === "submitted"
  )
    return "muted";
  if (normalized === "cancelled" || normalized === "scheduled") return "warn";
  return "muted";
}

function isOverdue(status: string): boolean {
  return status.trim().toLowerCase() === "overdue";
}

function auditDisplayId(id: string): string {
  return formatRecordDisplayId("A", id);
}

function auditSubtitle(record: AuditRecord, expanded: boolean): string {
  const rest = expanded ? record.scope : record.site;
  return [auditDisplayId(record.id), rest]
    .filter((part) => part.trim() !== "")
    .join(" · ");
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

export type AuditColumnOptions = Readonly<{
  selectedId: string | null;
  onViewMore: (id: string) => void;
  /** Wider columns when the side detail panel is closed. */
  expanded?: boolean;
}>;

export function createAuditColumns(
  options: AuditColumnOptions,
): ColumnDef<AuditRecord, unknown>[] {
  const { selectedId, onViewMore, expanded = true } = options;

  return [
    columnHelper.display({
      id: "displayId",
      header: "ID",
      size: 108,
      minSize: 96,
      meta: { align: "left" as const, verticalAlign: "middle" as const },
      cell: ({ row }) => {
        const displayId = auditDisplayId(row.original.id);
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
      header: "Audit",
      // No `size` → Table default 150 → no fixed width → this column fills leftover space.
      minSize: 180,
      meta: { align: "left" as const },
      cell: ({ row }) => {
        const subtitle = auditSubtitle(row.original, expanded);
        return (
          <div className="flex min-w-0 flex-col gap-0.5">
            <Text
              as="span"
              className="text4 text-ehs-darker truncate"
              title={row.original.title}
            >
              {row.original.title}
            </Text>
            <Text
              as="span"
              className="text8 text-ehs-muted-text truncate"
              title={subtitle}
            >
              {subtitle}
            </Text>
          </div>
        );
      },
    }),
    ...(expanded
      ? [
          columnHelper.accessor("site", {
            header: "Site",
            size: 120,
            minSize: 90,
            meta: {
              align: "left" as const,
              verticalAlign: "middle" as const,
            },
            cell: (info) => (
              <Text
                as="span"
                className="text4 text-ehs-gray truncate"
                title={info.getValue()}
              >
                {info.getValue()}
              </Text>
            ),
          }),
        ]
      : []),
    columnHelper.accessor("auditor", {
      header: "Auditor",
      size: expanded ? 140 : 112,
      minSize: 90,
      meta: { align: "left" as const, verticalAlign: "middle" as const },
      cell: (info) => (
        <Text
          as="span"
          className="text4 text-ehs-gray truncate"
          title={info.getValue()}
        >
          {info.getValue()?.split(" ").slice(0, 2).join(" ")}
        </Text>
      ),
    }),
    columnHelper.accessor("progress", {
      header: "Progress",
      // Must not be 150 — that value means “unset width” in Table.
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
        const overdue = isOverdue(info.row.original.status);
        return (
          <Text
            as="span"
            className={[
              "whitespace-nowrap tabular-nums",
              overdue ? "text4 text-ehs-red" : "text4 text-ehs-gray",
            ].join(" ")}
          >
            {info.getValue()}
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
                ? `Close details for ${auditDisplayId(row.original.id)}`
                : `View ${auditDisplayId(row.original.id)}`
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
  ] as ColumnDef<AuditRecord, unknown>[];
}
