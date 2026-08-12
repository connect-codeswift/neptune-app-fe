import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import type { BbsSession } from "@/app/dashboard/bbs/bbs-data";

const columnHelper = createColumnHelper<BbsSession>();

function observeTone(type: string): "teal" | "warn" | "muted" {
  const normalized = type.trim().toLowerCase();
  if (normalized === "safe") return "teal";
  if (normalized === "at-risk" || normalized === "at risk") return "warn";
  return "muted";
}

export type BbsSessionColumnOptions = Readonly<{
  selectedId: string | null;
  onViewMore: (id: string) => void;
  /** Wider columns when the side detail panel is closed. */
  expanded?: boolean;
}>;

export function createBbsSessionColumns(
  options: BbsSessionColumnOptions,
): ColumnDef<BbsSession, unknown>[] {
  const { selectedId, onViewMore, expanded = true } = options;

  return [
    columnHelper.accessor("id", {
      header: "ID",
      size: expanded ? 100 : 88,
      minSize: 80,
      meta: { align: "left" as const, verticalAlign: "middle" as const },
      cell: (info) => (
        <Text as="span" className="text7 text-ehs-muted-text tabular-nums">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("behaviors", {
      header: "Category",
      size: expanded ? 200 : 180,
      minSize: 140,
      meta: { align: "left" as const },
      cell: (info) => {
        const session = info.row.original;
        return (
          <div className="flex min-w-0 flex-col gap-0.5">
            <Text
              as="span"
              className="text4 text-ehs-darker truncate"
              title={info.getValue()}
            >
              {info.getValue()}
            </Text>
            {!expanded ? (
              <Text
                as="span"
                className="text8 text-ehs-muted-text truncate"
                title={`${session.location} · ${session.when}`}
              >
                {`${session.location} · ${session.when}`}
              </Text>
            ) : null}
          </div>
        );
      },
    }),
    columnHelper.accessor("type", {
      header: "Type",
      size: expanded ? 110 : 100,
      minSize: 90,
      meta: { align: "left" as const, verticalAlign: "middle" as const },
      cell: (info) => (
        <IncidentBadge
          label={info.getValue()}
          tone={observeTone(info.getValue())}
          showDot
          className="text5 w-fit rounded-md px-2 py-0.5 tracking-normal"
        />
      ),
    }),
    columnHelper.accessor("observer", {
      header: "Observer",
      size: expanded ? 150 : 120,
      minSize: 90,
      meta: { align: "left" as const, verticalAlign: "middle" as const },
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
    ...(expanded
      ? [
          columnHelper.accessor("location", {
            header: "Location",
            size: 160,
            minSize: 110,
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
          columnHelper.accessor("when", {
            header: "When",
            size: 140,
            minSize: 110,
            meta: {
              align: "left" as const,
              verticalAlign: "middle" as const,
            },
            cell: (info) => (
              <Text
                as="span"
                className="text4 text-ehs-gray whitespace-nowrap"
              >
                {info.getValue()}
              </Text>
            ),
          }),
        ]
      : []),
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
                : "text-ehs-muted-text hover:bg-[rgba(11,19,32,0.06)] hover:text-ehs-dark-bg",
            ].join(" ")}
            aria-label={
              isOpen
                ? `Close details for ${row.original.id}`
                : `View ${row.original.id}`
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
  ] as ColumnDef<BbsSession, unknown>[];
}
