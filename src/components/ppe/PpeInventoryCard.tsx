"use client";

import { Icon } from "@iconify/react";
import type { PpeInventoryItem } from "@/app/dashboard/ppe-management/ppe-data";

function progressTone(
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

export type PpeInventoryCardProps = Readonly<{
  item: PpeInventoryItem;
  onClick?: () => void;
}>;

/** Mobile inventory row — stock progress card matching Figma 6447:34617. */
export function PpeInventoryCard(props: Readonly<PpeInventoryCardProps>) {
  const { item, onClick } = props;
  const tone = progressTone(item);

  return (
    <button
      type="button"
      onClick={onClick}
      className="border-ehs-border flex w-full cursor-pointer flex-col gap-2.5 rounded-xl border bg-white p-3.5 text-left shadow-[0px_2px_4px_rgba(15,23,42,0.02)] transition-colors hover:bg-slate-50/80"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-ehs-darker truncate text-sm font-bold">
          {item.category}
        </span>
        <span className="shrink-0 text-xs whitespace-nowrap">
          <span className="text-ehs-darker font-bold tabular-nums">
            {`${item.onHand.toLocaleString("en-US")} / ${item.stockCapacity.toLocaleString("en-US")}`}
          </span>
          <span className="text-ehs-muted-text ml-1 font-medium">
            {`(${String(item.stockLevel)}%)`}
          </span>
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-0.75 bg-[#e5e7eb]">
        <div
          className={`h-full rounded-0.75 transition-[width] ${progressClassName[tone]}`}
          style={{ width: `${String(item.stockLevel)}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-ehs-muted-text inline-flex items-center gap-1 text-2.75 font-semibold">
          <Icon icon="mdi:account-outline" className="size-2.5 shrink-0" />
          {item.supplier}
        </span>
        <span className="inline-flex items-center gap-1 text-2.75 font-medium text-[#8892a3]">
          <Icon icon="mdi:calendar-outline" className="size-2.5 shrink-0" />
          {item.reorderDate}
        </span>
      </div>
    </button>
  );
}
