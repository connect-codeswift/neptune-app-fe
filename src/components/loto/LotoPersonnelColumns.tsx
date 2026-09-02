import { createColumnHelper } from "@tanstack/react-table";
import { Text } from "@/components/Text";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import { CompliancePill } from "@/components/regulatory-compliance/compliance-ui";
import type { TableColumns } from "@/components/ui/table-columns";
import type {
  LotoPersonnel,
  LotoPersonnelStatus,
} from "@/app/dashboard/lockout-tagout/loto-data";

const columnHelper = createColumnHelper<LotoPersonnel>();

/**
 * Four states, four tones. "Not certified" is muted rather than red: an untrained person is a
 * gap to fill, not a failure, and colouring it like an expiry hides the people who actually
 * lapsed.
 */
function personnelStatusTone(status: LotoPersonnelStatus) {
  if (status === "Current") return "teal" as const;
  if (status === "Expiring") return "warn" as const;
  if (status === "Expired") return "danger" as const;
  return "muted" as const;
}

function columnHeader(label: string) {
  return (
    <Text as="span" className="text6 text-ehs-muted-text">
      {label}
    </Text>
  );
}

export function buildLotoPersonnelColumns(): TableColumns<LotoPersonnel> {
  return [
    columnHelper.accessor("name", {
      header: () => columnHeader("Name"),
      size: 120,
      cell: (info) => {
        const item = info.row.original;
        return (
          <div className="flex items-center gap-2.5">
            <Text
              as="span"
              className="text7 bg-ehs-normal-blue/18 text-ehs-dark-blue rounded-2.25 flex size-8 shrink-0 items-center justify-center font-bold"
            >
              {item.initials}
            </Text>
            <Text as="span" className="text4 text-ehs-darker">
              {item.name}
            </Text>
          </div>
        );
      },
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("certifiedOn", {
      header: () => columnHeader("Certified"),
      size: 120,
      cell: (info) => (
        <Text as="span" className="text4 text-ehs-gray">
          {info.getValue()}
        </Text>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("expiresOn", {
      header: () => columnHeader("Expires"),
      size: 120,
      cell: (info) => {
        const expired = info.row.original.status === "Expired";
        return (
          <Text
            as="span"
            className={[
              "text4",
              expired ? "text-ehs-red" : "text-ehs-gray",
            ].join(" ")}
          >
            {info.getValue()}
          </Text>
        );
      },
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("equipmentIds", {
      header: () => columnHeader("Equipment"),
      size: 120,
      cell: (info) => (
        <div className="flex max-w-70 flex-wrap gap-1">
          {info.getValue().map((equipmentId: string) => (
            <CompliancePill key={equipmentId} label={equipmentId} />
          ))}
        </div>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("status", {
      header: () => columnHeader("Status"),
      size: 120,
      cell: (info) => {
        const status = info.getValue() as LotoPersonnelStatus;
        return (
          <IncidentBadge
            label={status}
            tone={personnelStatusTone(status)}
            showDot
          />
        );
      },
      meta: { align: "left" as const },
    }),
  ];
}
