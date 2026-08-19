import { createColumnHelper } from "@tanstack/react-table";
import type { TableColumns } from "@/components/ui/table-columns";
import type {
  LotoPersonnel,
  LotoPersonnelStatus,
} from "@/app/dashboard/lockout-tagout/loto-data";

const columnHelper = createColumnHelper<LotoPersonnel>();

const statusClassName: Record<LotoPersonnelStatus, string> = {
  Current: "bg-ehs-green/10 text-ehs-green",
  Expired: "bg-ehs-red/10 text-ehs-red",
};

/**
 * Authorized personnel columns — read-only. Certification management (edit /
 * renew) is moving to the admin dashboard, so there are no row actions here.
 */
export function buildLotoPersonnelColumns(): TableColumns<LotoPersonnel> {
  return [
    columnHelper.accessor("name", {
      header: "Name",
      size: 120,
      cell: (info) => {
        const item = info.row.original;
        return (
          <div className="flex items-center gap-2.5">
            <span className="text7 bg-ehs-normal-blue/18 text-ehs-dark-blue rounded-2.25 flex size-8 shrink-0 items-center justify-center font-bold">
              {item.initials}
            </span>
            <span className="text4 text-ehs-darker">{item.name}</span>
          </div>
        );
      },
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("certifiedOn", {
      header: "Certified",
      size: 120,
      cell: (info) => (
        <span className="text4 text-ehs-gray">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("expiresOn", {
      header: "Expires",
      size: 120,
      cell: (info) => {
        const expired = info.row.original.status === "Expired";
        return (
          <span
            className={[
              "text4",
              expired ? "text-ehs-red font-semibold" : "text-ehs-gray",
            ].join(" ")}
          >
            {info.getValue()}
          </span>
        );
      },
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("equipmentIds", {
      header: "Equipment",
      size: 120,
      cell: (info) => (
        <div className="flex max-w-70 flex-wrap gap-1">
          {info.getValue().map((equipmentId: string) => (
            <span
              key={equipmentId}
              className="text8 text-ehs-gray bg-ehs-surface-inverse/6 rounded-md px-2 py-0.5"
            >
              {equipmentId}
            </span>
          ))}
        </div>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("status", {
      header: "Status",
      size: 120,
      cell: (info) => (
        <span
          className={[
            "text5 inline-flex rounded-full px-2.5 py-0.5",
            statusClassName[info.getValue() as LotoPersonnelStatus],
          ].join(" ")}
        >
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
  ];
}
