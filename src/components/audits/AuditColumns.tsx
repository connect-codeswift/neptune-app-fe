import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import type { AuditRecord } from "@/app/dashboard/audits/audits-data";

const columnHelper = createColumnHelper<AuditRecord>();

/** Teal fill on a flat track, matching the design's progress meter. */
function ProgressMeter(props: Readonly<{ value: number }>) {
  const { value } = props;

  return (
    <div className="flex items-center gap-2">
      <span
        className="h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-[#f3f5f8]"
        aria-hidden="true"
      >
        <span
          className="bg-ehs-normal-blue block h-full rounded-full"
          style={{ width: `${String(value)}%` }}
        />
      </span>
      <span className="text-ehs-gray text-sm tabular-nums">
        {`${String(value)}%`}
      </span>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const auditColumns: ColumnDef<AuditRecord, any>[] = [
  columnHelper.accessor("title", {
    header: "AUDIT",
    cell: ({ row }) => (
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-ehs-dark-bg font-normal">
          {row.original.title}
        </span>
        <span className="text-ehs-muted-text text-xs">
          {`${row.original.id} · ${row.original.scope}`}
        </span>
      </div>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("site", {
    header: "SITE",
    size: 110,
    cell: (info) => (
      <span className="text-ehs-gray font-normal">{info.getValue()}</span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("auditor", {
    header: "AUDITOR",
    size: 130,
    cell: (info) => (
      <span className="text-ehs-gray font-normal">{info.getValue()}</span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("progress", {
    header: "PROGRESS",
    size: 150,
    cell: (info) => <ProgressMeter value={info.getValue()} />,
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("status", {
    header: "STATUS",
    size: 120,
    cell: (info) => (
      <IncidentBadge
        label={info.getValue()}
        tone="muted"
        className="w-fit rounded-full px-2.5 py-0.5 text-xs!"
      />
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("dueDate", {
    header: "DUE",
    size: 110,
    cell: (info) => (
      <span className="text-ehs-gray font-normal tabular-nums">
        {info.getValue()}
      </span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("findings", {
    header: "FINDINGS",
    size: 100,
    cell: (info) => (
      <span className="text-ehs-muted-text text-xs">
        {info.getValue() ?? "—"}
      </span>
    ),
    meta: { align: "right" as const },
  }),
];
