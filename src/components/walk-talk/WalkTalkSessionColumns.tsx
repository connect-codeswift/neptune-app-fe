import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { CompliancePill } from "@/components/regulatory-compliance/compliance-ui";
import type { WalkTalkSession } from "@/app/dashboard/walk-talk/walk-talk-data";
import { formatRecordDisplayId } from "@/lib/format-record-id";

const columnHelper = createColumnHelper<WalkTalkSession>();

function walkTalkDisplayId(id: string): string {
  return formatRecordDisplayId("WT", id);
}

function sessionSubtitle(session: WalkTalkSession, expanded: boolean): string {
  if (expanded) {
    return "";
  }
  return session.when.trim();
}

export type WalkTalkSessionColumnOptions = Readonly<{
  selectedId: string | null;
  onViewMore: (id: string) => void;
  /** Wider columns when the side detail panel is closed. */
  expanded?: boolean;
}>;

export function createWalkTalkSessionColumns(
  options: WalkTalkSessionColumnOptions,
): ColumnDef<WalkTalkSession, unknown>[] {
  const { selectedId, onViewMore, expanded = true } = options;

  return [
    columnHelper.display({
      id: "displayId",
      header: "ID",
      size: 108,
      minSize: 96,
      meta: { align: "left" as const, verticalAlign: "middle" as const },
      cell: ({ row }) => {
        const displayId = walkTalkDisplayId(row.original.id);
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
    columnHelper.display({
      id: "session",
      header: "Session",
      size: expanded ? 260 : 200,
      minSize: 160,
      meta: { align: "left" as const },
      cell: ({ row }) => {
        const session = row.original;
        const subtitle = sessionSubtitle(session, expanded);
        return (
          <div className="flex min-w-0 flex-col gap-0.5">
            <Text as="span" className="text4 text-ehs-darker">
              {session.focusArea}
            </Text>
            {subtitle ? (
              <Text as="span" className="text8 text-ehs-muted-text">
                {subtitle}
              </Text>
            ) : null}
          </div>
        );
      },
    }),
    columnHelper.accessor("type", {
      header: "Type",
      size: expanded ? 140 : 120,
      minSize: 100,
      meta: { align: "left" as const, verticalAlign: "middle" as const },
      cell: (info) => <CompliancePill label={info.getValue()} />,
    }),
    columnHelper.accessor("observer", {
      header: "Observer",
      size: expanded ? 150 : 110,
      minSize: 90,
      meta: { align: "left" as const, verticalAlign: "middle" as const },
      cell: (info) => (
        <Text as="span" className="text4 text-ehs-gray">
          {info.getValue()}
        </Text>
      ),
    }),
    ...(expanded
      ? [
          columnHelper.accessor("when", {
            header: "When",
            size: 130,
            minSize: 100,
            meta: {
              align: "left" as const,
              verticalAlign: "middle" as const,
            },
            cell: (info) => (
              <Text as="span" className="text4 text-ehs-gray whitespace-nowrap">
                {info.getValue()}
              </Text>
            ),
          }),
        ]
      : []),
    columnHelper.accessor("site", {
      header: "Site",
      size: expanded ? 150 : 110,
      minSize: 90,
      meta: { align: "left" as const, verticalAlign: "middle" as const },
      cell: (info) => (
        <Text as="span" className="text4 text-ehs-gray">
          {info.getValue()}
        </Text>
      ),
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
            className="text-ehs-muted-text hover:text-ehs-dark-bg inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
            aria-label={
              isOpen
                ? `Close details for ${walkTalkDisplayId(row.original.id)}`
                : `View ${walkTalkDisplayId(row.original.id)}`
            }
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
  ] as ColumnDef<WalkTalkSession, unknown>[];
}
