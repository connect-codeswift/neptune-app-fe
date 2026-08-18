import { createColumnHelper } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import type { IncidentBadgeTone } from "@/components/near-miss/IncidentBadge";
import { CompliancePill } from "@/components/regulatory-compliance/compliance-ui";
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
  onLock: (item: LotoEquipmentItem) => void;
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
    columnHelper.accessor("energySources", {
      header: () => columnHeader("Energy Sources"),
      size: 220,
      cell: (info) => (
        <div className="flex max-w-55 flex-wrap gap-1">
          {info.getValue().map((source: string) => (
            <CompliancePill key={source} label={source} />
          ))}
        </div>
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
        const isLockedOut = item.status === "Locked Out";

        return (
          <div className="flex items-center justify-center gap-0.5">
            <button
              type="button"
              className="text-ehs-muted-text hover:text-ehs-dark-bg inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-[rgba(11,19,32,0.06)]"
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
            <button
              type="button"
              disabled={isLockedOut}
              className={[
                "inline-flex size-8 items-center justify-center rounded-lg transition-colors",
                isLockedOut
                  ? "text-ehs-red cursor-default"
                  : "text-ehs-muted-text hover:text-ehs-dark-bg cursor-pointer hover:bg-[rgba(11,19,32,0.06)]",
              ].join(" ")}
              aria-label={
                isLockedOut
                  ? `${item.name} is locked out`
                  : `Apply lockout to ${item.name}`
              }
              onClick={(event) => {
                event.stopPropagation();
                if (!isLockedOut) {
                  actions.onLock(item);
                }
              }}
            >
              <Icon
                icon="material-symbols:lock-outline"
                className="size-5"
                aria-hidden="true"
              />
            </button>
          </div>
        );
      },
      meta: { align: "center" as const },
    }),
  ];
}
