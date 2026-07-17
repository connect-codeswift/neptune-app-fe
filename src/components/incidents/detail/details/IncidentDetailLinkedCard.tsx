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

  const handleAddCapa = onAddCapa ?? (() => {
    toast.info("Add CAPA coming soon", "This feature is being developed.");
  });

  const handleViewAll = onViewAll ?? (() => {
    toast.info("View all linked items coming soon", "This feature is being developed.");
  });

  return (
    <IncidentGlassCard
      paddingClassName="p-4 sm:p-5"
      className={className}
    >
      <div className="flex items-center justify-between border-b border-[rgba(15,23,42,0.06)] pb-2.5">
        <Text
          as="h3"
          className="text-ehs-dark-bg text-[15px] font-bold"
        >
          Linked items
        </Text>
        <button
          type="button"
          onClick={handleAddCapa}
          className="flex items-center gap-0.5 rounded-[6px] border border-[#0891a6]/20 bg-[#0891a6]/5 px-2 py-0.5 text-[11px] font-bold text-[#056e7e] transition-colors hover:bg-[#0891a6]/10"
        >
          <Icon icon="mdi:plus" className="size-3" />
          <span>Add CAPA</span>
        </button>
      </div>

      <div className="flex flex-col gap-2 pt-3">
        {linkedItems.map((item) => (
          <div
            key={item.id}
            className="flex cursor-pointer items-center gap-3 rounded-[10px] border border-[rgba(15,23,42,0.06)] bg-white/50 p-2.5 transition-colors hover:border-[rgba(15,23,42,0.12)] hover:bg-white/80"
          >
            <div className="text-ehs-gray flex size-[30px] shrink-0 items-center justify-center rounded-[8px] bg-[rgba(15,23,42,0.04)]">
              <Icon icon={item.icon} className="size-4" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-ehs-dark-bg text-[11.5px] leading-snug font-bold">
                {item.id}
              </span>
              <span className="text-ehs-gray truncate text-[10px]">
                {item.label}
              </span>
            </div>
            <Icon
              icon="mdi:chevron-right"
              className="text-ehs-muted-text size-4"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleViewAll}
        className="mt-3.5 inline-flex items-center gap-1 text-[11.5px] font-bold text-[#056e7e] transition-colors hover:text-[#067485]"
      >
        <span>View all linked items</span>
        <Icon icon="mdi:arrow-right" className="size-3.5" />
      </button>
    </IncidentGlassCard>
  );
}
