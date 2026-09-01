"use client";

import { EmptyState } from "@/components/ui/EmptyState";

import { Icon } from "@iconify/react";
import { Can } from "@/components/auth/Can";
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
    <IncidentGlassCard paddingClassName="p-4.75" className={className}>
      <div className="flex items-center justify-between pb-3.5">
        <Text as="h3" className="text-ehs-dark-bg text3">
          Linked items
        </Text>
        {/* Two rules, kept separate. `Can` is the capability POST /api/v1/capas
            checks; the missing handler is the caller saying this particular record
            takes no new CAPA — a closed incident. Withholding it hides the button
            rather than greying it: neither state is one the user can act their way
            out of, so a disabled control would just sit there dead. */}
        {onAddCapa ? (
          <Can do="CAPA.Create">
            <button
              type="button"
              onClick={onAddCapa}
              disabled={isLoading}
              className="bg-ehs-normal-blue text-ehs-on-accent hover:bg-ehs-normal-blue-active rounded-2.5 text5 inline-flex items-center gap-2 px-2.75 py-[7px] shadow-(--ehs-shadow-button-primary-flat) transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon icon="mdi:plus" className="size-3" aria-hidden="true" />
              Add CAPA
            </button>
          </Can>
        ) : null}
      </div>

      {isLoading ? (
        <SkeletonListRows rows={2} />
      ) : linkedItems.length === 0 ? (
        <EmptyState
          variant="plain"
          icon="mdi:link-variant"
          title="No CAPAs linked"
          message="Corrective actions raised from this incident appear here."
          className="border-ehs-border-ink/8 border-t"
        />
      ) : (
        linkedItems.map((item, index) => (
          <button
            key={`${item.id}-${String(index)}`}
            type="button"
            onClick={onSelectItem}
            className={[
              "border-ehs-border-ink/8 hover:bg-ehs-surface/30 flex w-full items-center gap-2.5 border-t pt-2.75 text-left transition-colors",
              index === linkedItems.length - 1 ? "pb-3.5" : "pb-2.5",
            ].join(" ")}
          >
            <div className="text-ehs-gray bg-ehs-surface/82 flex size-7.5 shrink-0 items-center justify-center rounded-lg">
              <Icon icon={item.icon} className="size-3.5" aria-hidden="true" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-ehs-dark-bg text4 leading-normal font-bold">
                {item.id}
              </span>
              <span className="text-ehs-muted-text text4 truncate leading-normal">
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
        <div className="border-ehs-border-ink/8 border-t pt-2.25">
          <button
            type="button"
            onClick={onViewAll}
            className="text-ehs-gray hover:text-ehs-dark-bg rounded-2.5 text5 mx-auto flex items-center gap-2 px-2.5 py-[6px] transition-colors"
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
