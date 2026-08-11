import { createColumnHelper } from "@tanstack/react-table";
import type { TableColumns } from "@/components/ui/table-columns";
import type { PpeInventoryItem } from "@/app/dashboard/ppe-management/ppe-data";

const columnHelper = createColumnHelper<PpeInventoryItem>();

function formatStock(value: number): string {
  return value.toLocaleString("en-US");
}

function stockLevelTone(
  item: PpeInventoryItem,
): "good" | "warn" | "danger" {
  if (item.attention || item.stockLevel < 50) return "danger";
  if (item.stockLevel < 75) return "warn";
  return "good";
}

const progressClassName: Record<"good" | "warn" | "danger", string> = {
  good: "bg-[#10b981]",
  warn: "bg-[#f59e0b]",
  danger: "bg-[#ef4444]",
};

export const ppeInventoryColumns: TableColumns<PpeInventoryItem> = [
  columnHelper.accessor("category", {
    header: "Category",
    size: 180,
    cell: (info) => (
      <span className="text-[12px] leading-normal text-[#0b1320]">
        {info.getValue()}
      </span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("onHand", {
    header: "On hand",
    size: 120,
    cell: ({ row }) => (
      <span className="text-[12px] leading-normal tabular-nums text-[#566072]">
        {`${formatStock(row.original.onHand)} / ${formatStock(row.original.stockCapacity)}`}
      </span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("stockLevel", {
    header: "Stock level",
    size: 180,
    cell: ({ row }) => {
      const { stockLevel } = row.original;
      const tone = stockLevelTone(row.original);

      return (
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="h-1.5 min-w-16 flex-1 overflow-hidden rounded-[3px] bg-[rgba(136,146,163,0.2)]">
            <div
              className={`h-full rounded-[3px] ${progressClassName[tone]}`}
              style={{ width: `${String(stockLevel)}%` }}
            />
          </div>
          <span
            className={[
              "shrink-0 text-[12px] font-semibold tabular-nums",
              tone === "danger"
                ? "text-[#ef4444]"
                : tone === "warn"
                  ? "text-[#f59e0b]"
                  : "text-[#566072]",
            ].join(" ")}
          >
            {`${String(stockLevel)}%`}
          </span>
        </div>
      );
    },
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("reorderDate", {
    header: "Reorder",
    size: 110,
    cell: (info) => (
      <span className="text-[12px] leading-normal text-[#566072]">
        {info.getValue()}
      </span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("supplier", {
    header: "Supplier",
    size: 140,
    cell: (info) => (
      <span className="text-[12px] leading-normal text-[#566072]">
        {info.getValue()}
      </span>
    ),
    meta: { align: "left" as const },
  }),
];
