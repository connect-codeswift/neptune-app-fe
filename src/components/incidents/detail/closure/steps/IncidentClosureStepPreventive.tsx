"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type {
  ClosureLinkedCapaItem,
  IncidentClosureData,
} from "@/components/incidents/detail/incident-detail-types";
import {
  IncidentModalShell,
  IncidentModalCancelButton,
  IncidentModalPrimaryButton,
} from "@/components/incidents/shared/capa/IncidentModalShell";

export type IncidentClosureStepPreventiveProps = Readonly<{
  data: IncidentClosureData;
  onChangeField: <K extends keyof IncidentClosureData>(
    field: K,
    value: IncidentClosureData[K],
  ) => void;
  onToggleCheckItem?: (itemId: string) => void;
  onLinkAdditionalCapa?: () => void;
}>;

const AVAILABLE_CAPA_ITEMS: readonly ClosureLinkedCapaItem[] = [
  {
    id: "capa-12",
    title: "CAPA-012",
    subtitle: "Preventive replacement schedule for high-risk transfer lines",
    progressPercent: 100,
    status: "Completed",
  },
  {
    id: "capa-14",
    title: "CAPA-014",
    subtitle: "Revised ultrasonic inspection SOP & checklist update",
    progressPercent: 70,
    status: "In Progress",
  },
  {
    id: "capa-18",
    title: "CAPA-018",
    subtitle: "Secondary containment valve gasket upgrade & torque spec review",
    progressPercent: 35,
    status: "In Progress",
  },
  {
    id: "capa-22",
    title: "CAPA-022",
    subtitle: "Pre-shift operator equipment safety briefing module",
    progressPercent: 0,
    status: "Planning",
  },
  {
    id: "capa-25",
    title: "CAPA-025",
    subtitle: "Automated pressure transducer calibration protocol",
    progressPercent: 10,
    status: "Planning",
  },
  {
    id: "capa-30",
    title: "CAPA-030",
    subtitle: "Emergency isolation valve accessibility redesign",
    progressPercent: 100,
    status: "Completed",
  },
];

function capaBadgeStyle(status: ClosureLinkedCapaItem["status"]) {
  switch (status) {
    case "Completed":
      return "bg-[#e6f7f5] text-[#008ba3]";
    case "In Progress":
      return "bg-[#eef2ff] text-[#4f46e5]";
    case "Planning":
    default:
      return "bg-[#f1f5f9] text-[#64748b]";
  }
}

type LinkCapaModalProps = Readonly<{
  isOpen: boolean;
  onClose: () => void;
  currentlyLinked: readonly ClosureLinkedCapaItem[];
  onSave: (selectedCapas: ClosureLinkedCapaItem[]) => void;
}>;

function LinkCapaModal(props: Readonly<LinkCapaModalProps>) {
  const { isOpen, onClose, currentlyLinked, onSave } = props;

  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    currentlyLinked.map((item) => item.id),
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(currentlyLinked.map((item) => item.id));
      setSearchQuery("");
    }
  }, [isOpen, currentlyLinked]);

  if (!isOpen) return null;

  // Deduplicate and combine available items with any currently linked items
  const allItemsMap = new Map<string, ClosureLinkedCapaItem>();
  AVAILABLE_CAPA_ITEMS.forEach((item) => allItemsMap.set(item.id, item));
  currentlyLinked.forEach((item) => allItemsMap.set(item.id, item));

  const allItems = Array.from(allItemsMap.values());

  const filteredItems = allItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSave = () => {
    const selectedCapas = allItems.filter((item) =>
      selectedIds.includes(item.id),
    );
    onSave(selectedCapas);
    onClose();
  };

  return (
    <IncidentModalShell
      title="Link CAPAs & Action Items"
      subtitle="Select corrective and preventive action items to attach to this incident closure."
      onClose={onClose}
      maxWidthClassName="max-w-[720px]"
      footerHint={
        <span className="text-[13px] font-medium text-[#64748b]">
          {selectedIds.length} {selectedIds.length === 1 ? "item" : "items"}{" "}
          selected
        </span>
      }
      footerActions={
        <>
          <IncidentModalCancelButton onClick={onClose} label="Cancel" />
          <IncidentModalPrimaryButton
            onClick={handleSave}
            label={`Link Selected (${selectedIds.length})`}
            iconSrc="/icons/capa/plus.svg"
          />
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Search Bar */}
        <div className="relative flex items-center rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2.5 shadow-xs">
          <Icon icon="mdi:magnify" className="mr-2 size-5 text-[#94a3b8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search CAPAs or action items by title or description..."
            className="w-full bg-transparent text-[13px] font-normal text-[#0f172a] outline-none placeholder:text-[#94a3b8]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-[#94a3b8] hover:text-[#0f172a]"
              aria-label="Clear search"
            >
              <Icon icon="mdi:close-circle" className="size-4" />
            </button>
          )}
        </div>

        {/* List of CAPAs */}
        <div className="flex max-h-[380px] flex-col gap-2.5 overflow-y-auto pr-1">
          {filteredItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleSelect(item.id)}
                className={[
                  "flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all select-none",
                  isSelected
                    ? "border-[#008ba3] bg-[#f0fdfa]"
                    : "border-[#e2e8f0] bg-white hover:border-[#cbd5e1]",
                ].join(" ")}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={[
                      "flex size-5 shrink-0 items-center justify-center rounded border transition-colors",
                      isSelected
                        ? "border-[#008ba3] bg-[#008ba3] text-white"
                        : "border-[#cbd5e1] bg-white",
                    ].join(" ")}
                  >
                    {isSelected && (
                      <Icon icon="mdi:check" className="size-3.5" />
                    )}
                  </div>

                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-[#0f172a]">
                        {item.title}
                      </span>
                    </div>
                    <span className="truncate text-[12px] font-normal text-[#64748b]">
                      {item.subtitle}
                    </span>
                  </div>
                </div>

                <div className="ml-3 flex shrink-0 items-center gap-3">
                  <div className="hidden items-center gap-2 sm:flex">
                    <div className="h-[6px] w-16 overflow-hidden rounded-full bg-[#e2e8f0]">
                      <div
                        className="h-full rounded-full bg-[#008ba3]"
                        style={{ width: `${String(item.progressPercent)}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-[#64748b]">
                      {item.progressPercent}%
                    </span>
                  </div>

                  <span
                    className={[
                      "rounded-full px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap",
                      capaBadgeStyle(item.status),
                    ].join(" ")}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Icon
                icon="mdi:clipboard-text-off-outline"
                className="size-8 text-[#94a3b8]"
              />
              <span className="mt-2 text-[13px] font-medium text-[#64748b]">
                No CAPA or action items match your search.
              </span>
            </div>
          )}
        </div>
      </div>
    </IncidentModalShell>
  );
}

export function IncidentClosureStepPreventive(
  props: Readonly<IncidentClosureStepPreventiveProps>,
) {
  const { data, onChangeField, onLinkAdditionalCapa } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const linkedCapas = data.closureLinkedCapas ?? [];

  const handleOpenModal = () => {
    setIsModalOpen(true);
    onLinkAdditionalCapa?.();
  };

  const handleSaveCapas = (newLinkedCapas: ClosureLinkedCapaItem[]) => {
    onChangeField("closureLinkedCapas", newLinkedCapas);
  };

  return (
    <div className="flex flex-col gap-6">
      <Text
        as="h2"
        className="text-[18px] leading-tight font-bold tracking-tight text-[#0f172a]"
      >
        Preventive Measures & CAPAs
      </Text>

      {/* Actions Taken */}
      <div className="flex flex-col">
        <label className="mb-2 text-[12px] font-bold tracking-[0.08em] text-[#94a3b8] uppercase">
          ACTIONS TAKEN
        </label>
        <textarea
          value={data.actionsTaken}
          onChange={(e) => onChangeField("actionsTaken", e.target.value)}
          rows={3}
          placeholder="Detail preventive actions taken..."
          className="w-full resize-y rounded-[14px] border border-[#e2e8f0] bg-white px-3.5 py-3 text-[13px] leading-[20px] font-medium text-[#1e293b] shadow-xs transition outline-none focus:border-[#008ba3] focus:ring-2 focus:ring-[#008ba3]/20"
        />
      </div>

      {/* Linked CAPAs */}
      <div className="flex flex-col">
        <label className="mb-2.5 text-[12px] font-bold tracking-[0.08em] text-[#94a3b8] uppercase">
          LINKED CAPAS
        </label>

        <div className="flex flex-col gap-3">
          {linkedCapas.map((capa) => (
            <div
              key={capa.id}
              className="flex items-center justify-between rounded-[14px] border border-[#e2e8f0] bg-white px-4 py-3.5 shadow-xs transition-all hover:border-[#cbd5e1]"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#d2eff4]/60 text-[#008ba3]">
                  <Icon icon="mdi:check-circle-outline" className="size-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <Text
                    as="span"
                    className="text-[13px] font-bold text-[#0f172a]"
                  >
                    {capa.title}
                  </Text>
                  <Text
                    as="span"
                    className="text-[12px] font-medium text-[#94a3b8]"
                  >
                    {capa.subtitle}
                  </Text>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-[6px] w-24 overflow-hidden rounded-full bg-[#e2e8f0]">
                  <div
                    className="h-full rounded-full bg-[#008ba3] transition-all duration-300"
                    style={{ width: `${String(capa.progressPercent)}%` }}
                  />
                </div>
                <span
                  className={[
                    "rounded-full px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap",
                    capaBadgeStyle(capa.status),
                  ].join(" ")}
                >
                  {capa.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="mt-3 flex items-center gap-1.5 text-[13px] font-bold text-[#008ba3] transition-colors hover:underline"
        >
          <Icon icon="mdi:plus" className="size-4" />
          <span>Link additional CAPA or Action Item</span>
        </button>
      </div>

      {/* Link CAPA Modal */}
      <LinkCapaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentlyLinked={linkedCapas}
        onSave={handleSaveCapas}
      />
    </div>
  );
}
