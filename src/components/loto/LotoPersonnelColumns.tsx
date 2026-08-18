import { createColumnHelper } from "@tanstack/react-table";
import type { TableColumns } from "@/components/ui/table-columns";
import type {
  LotoPersonnel,
  LotoPersonnelStatus,
} from "@/app/dashboard/lockout-tagout/loto-data";

const columnHelper = createColumnHelper<LotoPersonnel>();

const statusClassName: Record<LotoPersonnelStatus, string> = {
  Current: "bg-[rgba(16,185,129,0.1)] text-[#10b981]",
  Expired: "bg-[rgba(239,68,68,0.1)] text-[#ef4444]",
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
            <span className="text7 bg-ehs-normal-blue/18 text-ehs-dark-blue flex size-8 shrink-0 items-center justify-center rounded-2.25 font-bold">
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
              expired ? "font-semibold text-[#ef4444]" : "text-ehs-gray",
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
              className="text8 text-ehs-gray rounded-md bg-[rgba(15,23,42,0.06)] px-2 py-0.5"
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
