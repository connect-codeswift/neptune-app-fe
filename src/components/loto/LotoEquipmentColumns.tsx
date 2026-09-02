import { createColumnHelper } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import type { IncidentBadgeTone } from "@/components/near-miss/IncidentBadge";
import type { TableColumns } from "@/components/ui/table-columns";
import type {
  LotoEquipmentItem,
  LotoEquipmentStatus,
} from "@/app/dashboard/lockout-tagout/loto-data";

const columnHelper = createColumnHelper<LotoEquipmentItem>();

function columnHeader(label: string) {
  return (
    <Text as="span" className="text6 text-ehs-muted-text">
      {label}
    </Text>
  );
}

function statusTone(status: LotoEquipmentStatus): IncidentBadgeTone {
  if (status === "Operational") return "teal";
  if (status === "Locked Out") return "danger";
  return "warn";
}

export type LotoEquipmentColumnActions = Readonly<{
  onView: (item: LotoEquipmentItem) => void;
  /** Omitted when the reader lacks Loto.Delete, which is what hides the control. */
  onDelete?: (item: LotoEquipmentItem) => void;
}>;

export function buildLotoEquipmentColumns(
  actions: LotoEquipmentColumnActions,
): TableColumns<LotoEquipmentItem> {
  return [
    columnHelper.accessor("equipmentCode", {
      header: () => columnHeader("Code"),
      size: 90,
      cell: (info) => (
        <Text as="span" className="text7 text-ehs-muted-text font-mono">
          {info.getValue()}
        </Text>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("name", {
      header: () => columnHeader("Equipment"),
      size: 180,
      cell: (info) => (
        <Text as="span" className="text4 text-ehs-darker">
          {info.getValue()}
        </Text>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("location", {
      header: () => columnHeader("Location"),
      size: 120,
      cell: (info) => (
        <Text as="span" className="text4 text-ehs-gray">
          {info.getValue()}
        </Text>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("status", {
      header: () => columnHeader("Status"),
      size: 130,
      cell: (info) => {
        const status = info.getValue();
        return (
          <IncidentBadge label={status} tone={statusTone(status)} showDot />
        );
      },
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("lastInspection", {
      header: () => columnHeader("Last Inspection"),
      size: 120,
      cell: (info) => (
        <Text as="span" className="text4 text-ehs-muted-text">
          {info.getValue()}
        </Text>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      size: 88,
      cell: ({ row }) => {
        const item = row.original;

        // View only, plus the cog the manage-column helper merges in here.
        // Every other register in the app offers exactly that from a row; the
        // lock was a second, LOTO-only action that broke the shared shape.
        // Applying a lockout is a decision made against the machine's detail
        // — its state, its energy sources, its authorized personnel — so it
        // stays on that screen rather than one click from a list row.
        return (
          <div className="flex items-center justify-center gap-0.5">
            <button
              type="button"
              className="text-ehs-muted-text hover:text-ehs-dark-bg hover:bg-ehs-surface-inverse/6 inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
              aria-label={`View ${item.name}`}
              onClick={(event) => {
                event.stopPropagation();
                actions.onView(item);
              }}
            >
              <Icon
                icon="lets-icons:view"
                className="size-5"
                aria-hidden="true"
              />
            </button>
            {actions.onDelete ? (
              <button
                type="button"
                className="text-ehs-muted-text hover:text-ehs-red hover:bg-ehs-red/8 inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
                aria-label={`Delete ${item.name}`}
                onClick={(event) => {
                  event.stopPropagation();
                  actions.onDelete?.(item);
                }}
              >
                <Icon
                  icon="mdi:trash-can-outline"
                  className="size-5"
                  aria-hidden="true"
                />
              </button>
            ) : null}
          </div>
        );
      },
      meta: { align: "center" as const },
    }),
  ];
}
