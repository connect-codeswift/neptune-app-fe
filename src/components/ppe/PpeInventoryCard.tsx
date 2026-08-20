"use client";

import { Icon } from "@iconify/react";
import type { PpeInventoryItem } from "@/app/dashboard/ppe-management/ppe-data";
import { formatPpeDisplayId } from "@/lib/map-ppe";

export type PpeInventoryCardProps = Readonly<{
  item: PpeInventoryItem;
  onClick?: () => void;
}>;

/** Mobile inventory row — opens the right-side detail panel on tap. */
export function PpeInventoryCard(props: Readonly<PpeInventoryCardProps>) {
  const { item, onClick } = props;

  return (
    <button
      type="button"
      onClick={onClick}
      className="border-ehs-border bg-ehs-surface hover:bg-ehs-surface-raised/80 flex w-full cursor-pointer flex-col gap-2.5 rounded-xl border p-3.5 text-left shadow-[0px_2px_4px_rgba(15,23,42,0.02)] transition-colors"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-col">
          <span className="text7 text-ehs-muted-text">
            {formatPpeDisplayId(item.id)}
          </span>
          <span className="text4 text-ehs-darker truncate">
            {item.itemName}
          </span>
        </div>
        <span className="text7 text-ehs-darker shrink-0 whitespace-nowrap">
          {`${item.onHand.toLocaleString("en-US")} / ${item.stockCapacity.toLocaleString("en-US")}`}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text8 text-ehs-muted-text inline-flex items-center gap-1">
          <Icon icon="mdi:account-outline" className="size-2.5 shrink-0" />
          {item.supplier}
        </span>
        <span className="text8 text-ehs-muted-text inline-flex items-center gap-1">
          <Icon icon="mdi:calendar-outline" className="size-2.5 shrink-0" />
          {item.reorderDate}
        </span>
      </div>
    </button>
  );
}
