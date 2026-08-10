"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { SkeletonListRows } from "@/components/ui/skeletons";

export type IncidentLinkedItem = Readonly<{
  id: string;
  label: string;
  icon: string;
}>;

export type IncidentDetailLinkedCardProps = Readonly<{
  linkedItems?: readonly IncidentLinkedItem[];
  totalLinkedCount?: number;
  isLoading?: boolean;
  onAddCapa?: () => void;
  onViewAll?: () => void;
  onSelectItem?: () => void;
  className?: string;
}>;

export function IncidentDetailLinkedCard(
  props: Readonly<IncidentDetailLinkedCardProps>,
) {
  const {
    linkedItems = [],
    totalLinkedCount,
    isLoading = false,
    onAddCapa,
    onViewAll,
    onSelectItem,
    className = "",
  } = props;

  const totalCount = totalLinkedCount ?? linkedItems.length;
  const hasMoreThanPreview = totalCount > linkedItems.length;

  return (
    <IncidentGlassCard paddingClassName="p-[19px]" className={className}>
      <div className="flex items-center justify-between pb-3.5">
        <Text as="h3" className="text-ehs-dark-bg text-lg font-semibold">
          Linked items
        </Text>
        <button
          type="button"
          onClick={onAddCapa}
          disabled={!onAddCapa || isLoading}
          className="bg-ehs-normal-blue text-ehs-light-text hover:bg-ehs-normal-blue-active inline-flex items-center gap-2 rounded-[10px] px-[11px] py-[6.5px] text-sm font-bold shadow-[0px_6px_18px_-6px_var(--ehs-normal-blue)] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon icon="mdi:plus" className="size-3" aria-hidden="true" />
          Add CAPA
        </button>
      </div>

      {isLoading ? (
        <SkeletonListRows rows={2} />
      ) : linkedItems.length === 0 ? (
        <div className="text-ehs-muted-text border-t border-[rgba(15,23,42,0.08)] py-6 text-center text-sm">
          No CAPAs linked to this incident yet.
        </div>
      ) : (
        linkedItems.map((item, index) => (
          <button
            key={`${item.id}-${String(index)}`}
            type="button"
            onClick={onSelectItem}
            className={[
              "flex w-full items-center gap-[10px] border-t border-[rgba(15,23,42,0.08)] pt-[11px] text-left transition-colors hover:bg-white/30",
              index === linkedItems.length - 1 ? "pb-3.5" : "pb-[10px]",
            ].join(" ")}
          >
            <div className="text-ehs-gray flex size-[30px] shrink-0 items-center justify-center rounded-lg bg-[rgba(255,255,255,0.82)]">
              <Icon icon={item.icon} className="size-3.5" aria-hidden="true" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-ehs-dark-bg text-sm leading-normal font-bold">
                {item.id}
              </span>
              <span className="text-ehs-muted-text truncate text-sm leading-normal">
                {item.label}
              </span>
            </div>
            <Icon
              icon="mdi:chevron-right"
              className="text-ehs-muted-text size-3.5 shrink-0"
              aria-hidden="true"
            />
          </button>
        ))
      )}

      {!isLoading && onViewAll ? (
        <div className="border-t border-[rgba(15,23,42,0.08)] pt-[9px]">
          <button
            type="button"
            onClick={onViewAll}
            className="text-ehs-gray hover:text-ehs-dark-bg mx-auto flex items-center gap-2 rounded-[10px] px-2.5 py-[5.5px] text-sm font-bold transition-colors"
          >
            {hasMoreThanPreview
              ? `View all ${String(totalCount)} linked items`
              : "View all linked items"}
            <Icon
              icon="mdi:arrow-right"
              className="size-3"
              aria-hidden="true"
            />
          </button>
        </div>
      ) : null}
    </IncidentGlassCard>
  );
}
