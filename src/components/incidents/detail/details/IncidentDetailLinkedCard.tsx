"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { toast } from "@/lib/toast";

export type IncidentLinkedItem = Readonly<{
  id: string;
  label: string;
  icon: string;
}>;

export type IncidentDetailLinkedCardProps = Readonly<{
  linkedItems?: readonly IncidentLinkedItem[];
  onAddCapa?: () => void;
  onViewAll?: () => void;
  className?: string;
}>;

const DEFAULT_LINKED_ITEMS: readonly IncidentLinkedItem[] = [
  { id: "CAPA-512", label: "Root-cause analysis", icon: "mdi:sitemap-outline" },
  {
    id: "SOP-204 v3.0",
    label: "Hydraulic press SOP — review",
    icon: "mdi:file-document-outline",
  },
  {
    id: "A-2204",
    label: "Internal EHS audit — finding #4",
    icon: "mdi:shield-check-outline",
  },
];

export function IncidentDetailLinkedCard(
  props: Readonly<IncidentDetailLinkedCardProps>,
) {
  const {
    linkedItems = DEFAULT_LINKED_ITEMS,
    onAddCapa,
    onViewAll,
    className = "",
  } = props;

  const handleAddCapa =
    onAddCapa ??
    (() => {
      toast.info("Add CAPA coming soon", "This feature is being developed.");
    });

  const handleViewAll =
    onViewAll ??
    (() => {
      toast.info(
        "View all linked items coming soon",
        "This feature is being developed.",
      );
    });

  return (
    <IncidentGlassCard paddingClassName="p-[19px]" className={className}>
      <div className="flex items-center justify-between pb-[14px]">
        <Text
          as="h3"
          className="text-ehs-dark-bg text-lg font-semibold"
        >
          Linked items
        </Text>
        <button
          type="button"
          onClick={handleAddCapa}
          className="inline-flex items-center gap-2 rounded-[10px] bg-ehs-normal-blue px-[11px] py-[6.5px] text-sm font-bold text-ehs-light-text shadow-[0px_6px_18px_-6px_var(--ehs-normal-blue)] transition-colors hover:bg-ehs-normal-blue-active"
        >
          <Icon icon="mdi:plus" className="size-3" aria-hidden="true" />
          Add CAPA
        </button>
      </div>

      {linkedItems.map((item, index) => (
        <button
          key={item.id}
          type="button"
          className={[
            "flex w-full items-center gap-[10px] border-t border-[rgba(15,23,42,0.08)] pt-[11px] text-left transition-colors hover:bg-white/30",
            index === linkedItems.length - 1 ? "pb-[14px]" : "pb-[10px]",
          ].join(" ")}
        >
          <div className="flex size-[30px] shrink-0 items-center justify-center rounded-lg bg-[rgba(255,255,255,0.82)] text-ehs-gray">
            <Icon icon={item.icon} className="size-3.5" aria-hidden="true" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm leading-normal font-bold text-ehs-dark-bg">
              {item.id}
            </span>
            <span className="truncate text-sm leading-normal text-ehs-muted-text">
              {item.label}
            </span>
          </div>
          <Icon
            icon="mdi:chevron-right"
            className="size-3.5 shrink-0 text-ehs-muted-text"
            aria-hidden="true"
          />
        </button>
      ))}

      <div className="border-t border-[rgba(15,23,42,0.08)] pt-[9px]">
        <button
          type="button"
          onClick={handleViewAll}
          className="mx-auto flex items-center gap-2 rounded-[10px] px-2.5 py-[5.5px] text-sm font-bold text-ehs-gray transition-colors hover:text-ehs-dark-bg"
        >
          View all linked items
          <Icon icon="mdi:arrow-right" className="size-3" aria-hidden="true" />
        </button>
      </div>
    </IncidentGlassCard>
  );
}
