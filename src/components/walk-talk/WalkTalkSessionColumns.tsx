import { createColumnHelper } from "@tanstack/react-table";
import type { TableColumns } from "@/components/ui/table-columns";
import { CompliancePill } from "@/components/regulatory-compliance/compliance-ui";
import type { WalkTalkSession } from "@/app/dashboard/walk-talk/walk-talk-data";

const columnHelper = createColumnHelper<WalkTalkSession>();

export const walkTalkSessionColumns: TableColumns<WalkTalkSession> = [
  columnHelper.accessor("id", {
    header: "ID",
    size: 110,
    cell: (info) => (
      <span className="text-2.5 leading-normal font-bold text-[#8892a3]">
        {info.getValue()}
      </span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("type", {
    header: "Type",
    size: 160,
    cell: (info) => <CompliancePill label={info.getValue()} />,
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("observer", {
    header: "Observer",
    size: 150,
    cell: (info) => (
      <span className="text-xs leading-normal text-[#566072]">
        {info.getValue()}
      </span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("focusArea", {
    header: "Focus area",
    size: 200,
    cell: (info) => {
      const session = info.row.original;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs leading-normal text-[#0b1320]">
            {info.getValue()}
          </span>
          <span className="text-2.5 leading-normal text-[#8892a3]">
            {session.when}
          </span>
        </div>
      );
    },
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("site", {
    header: "Site",
    size: 160,
    cell: (info) => (
      <span className="text-xs leading-normal text-[#566072]">
        {info.getValue()}
      </span>
    ),
    meta: { align: "left" as const },
  }),
];
