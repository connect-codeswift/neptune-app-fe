import { createColumnHelper } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { TableColumns } from "@/components/ui/table-columns";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import type { IncidentBadgeTone } from "@/components/near-miss/IncidentBadge";
import { formatNearMissDisplayId } from "@/lib/map-near-miss";
import { userNameFor } from "@/lib/map-user";
import type { NearMissRecord } from "@/app/dashboard/near-miss/near-miss-data";

const columnHelper = createColumnHelper<NearMissRecord>();

function statusTone(status: string): IncidentBadgeTone {
  const normalized = status
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
  if (normalized === "open") return "teal";
  if (normalized === "investigating") return "warn";
  if (normalized === "closed") return "muted";
  return "muted";
}

function clipWords(value: string, maxWords = 4): string {
  const trimmed = value.trim();
  if (!trimmed) return "—";

  const words = trimmed.split(/\s+/);
  if (words.length <= maxWords) return trimmed;

  return `${words.slice(0, maxWords).join(" ")}…`;
}

function shortName(value: string): string {
  const name = value.trim();
  if (!name || name === "—") return "—";
  return name.split(/\s+/).slice(0, 2).join(" ");
}

function columnHeader(label: string) {
  return (
    <Text as="span" className="text6 text-ehs-muted-text">
      {label}
    </Text>
  );
}

export type NearMissColumnHandlers = Readonly<{
  /** User id -> name, from /User/dropdown; ids stay raw until it loads. */
  userNames?: ReadonlyMap<string, string>;
  selectedId?: string | null;
  onView: (record: NearMissRecord) => void;
}>;

/**
 * Build the near-miss table columns. It's a factory (not a static array) so the
 * reporter cell can close over the page's user-name lookup.
 */
export function makeNearMissColumns(
  handlers: NearMissColumnHandlers,
): TableColumns<NearMissRecord> {
  const { userNames, selectedId = null, onView } = handlers;

  return [
    columnHelper.accessor("title", {
      header: () => columnHeader("Near Miss"),
      minSize: 180,
      cell: ({ row }) => {
        const record = row.original;
        const reporter =
          record.reporterId != null && record.reporterId > 0
            ? userNameFor(userNames, record.reporterId)
            : record.reporter;
        const subtitle = [
          formatNearMissDisplayId(record.id),
          record.hazardType,
          shortName(reporter),
        ]
          .filter((part) => part.trim() && part !== "—")
          .join(" · ");

        return (
          <div className="flex min-w-0 flex-col gap-0.5">
            <Text
              as="span"
              className="text4 text-ehs-darker truncate"
              title={record.title}
            >
              {clipWords(record.title)}
            </Text>
            <Text
              as="span"
              className="text8 text-ehs-muted-text truncate"
              title={subtitle}
            >
              {subtitle || "—"}
            </Text>
          </div>
        );
      },
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("location", {
      header: () => columnHeader("Site"),
      size: 128,
      minSize: 90,
      cell: (info) => (
        <Text
          as="span"
          className="text4 text-ehs-gray truncate"
          title={info.getValue()}
        >
          {info.getValue() || "—"}
        </Text>
      ),
      meta: { align: "left" as const, verticalAlign: "middle" as const },
    }),
    columnHelper.accessor("status", {
      header: () => columnHeader("Status"),
      size: 128,
      minSize: 96,
      cell: (info) => (
        <IncidentBadge
          label={info.getValue()}
          tone={statusTone(info.getValue())}
          showDot
          className="text5 w-fit rounded-md px-2 py-0.5 tracking-normal"
        />
      ),
      meta: { align: "left" as const, verticalAlign: "middle" as const },
    }),
    columnHelper.accessor("age", {
      header: () => columnHeader("Age"),
      size: 72,
      minSize: 56,
      cell: (info) => (
        <Text as="span" className="text4 text-ehs-gray tabular-nums">
          {info.getValue() || "—"}
        </Text>
      ),
      meta: { align: "left" as const, verticalAlign: "middle" as const },
    }),
    columnHelper.display({
      id: "view",
      header: "",
      size: 56,
      minSize: 48,
      cell: ({ row }) => {
        const isOpen = selectedId === row.original.id;
        const displayId = formatNearMissDisplayId(row.original.id);

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
                ? `Close details for ${displayId}`
                : `View near miss ${displayId}`
            }
            aria-pressed={isOpen}
            onClick={(event) => {
              event.stopPropagation();
              onView(row.original);
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
      meta: { align: "center" as const, verticalAlign: "middle" as const },
    }),
  ];
}
