import { createColumnHelper } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import type { TableColumns } from "@/components/ui/table-columns";
import type { PpeInventoryItem } from "@/app/dashboard/ppe-management/ppe-data";

const columnHelper = createColumnHelper<PpeInventoryItem>();

function formatStock(value: number): string {
  return value.toLocaleString("en-US");
}

export type PpeInventoryColumnHandlers = Readonly<{
  selectedId: string | null;
  onViewMore: (id: string) => void;
}>;

/** Inventory table columns — eye icon toggles the right-side detail panel. */
export function makePpeInventoryColumns(
  handlers: PpeInventoryColumnHandlers,
): TableColumns<PpeInventoryItem> {
  const { selectedId, onViewMore } = handlers;

  return [
    columnHelper.accessor("itemName", {
      header: "Item name",
      size: 200,
      cell: (info) => (
        <span className="text4 text-ehs-darker">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("category", {
      header: "Category",
      size: 160,
      cell: (info) => (
        <span className="text4 text-ehs-gray">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("onHand", {
      header: "On hand",
      size: 120,
      cell: ({ row }) => (
        <span className="text4 text-ehs-gray tabular-nums">
          {`${formatStock(row.original.onHand)} / ${formatStock(row.original.stockCapacity)}`}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("reorderDate", {
      header: "Reorder",
      size: 110,
      cell: (info) => (
        <span className="text4 text-ehs-gray">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("supplier", {
      header: "Supplier",
      size: 140,
      cell: (info) => (
        <span className="text4 text-ehs-gray">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.display({
      id: "view",
      header: "",
      size: 56,
      cell: ({ row }) => {
        const isOpen = selectedId === row.original.id;

        return (
          <button
            type="button"
            className="text-ehs-muted-text hover:text-ehs-dark-bg inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
            aria-label={
              isOpen
                ? `Close details for ${row.original.itemName}`
                : `View ${row.original.itemName}`
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
      meta: { align: "center" as const },
    }),
  ];
}
