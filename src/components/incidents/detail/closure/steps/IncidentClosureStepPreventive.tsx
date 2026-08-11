"use client";

import { useState } from "react";
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
import {
  FIELD_INPUT_LG_CLASS,
  FIELD_TEXTAREA_CLASS,
} from "@/components/ui/field-styles";

export type IncidentClosureStepPreventiveProps = Readonly<{
  data: IncidentClosureData;
  onChangeField: <K extends keyof IncidentClosureData>(
    field: K,
    value: IncidentClosureData[K],
  ) => void;
  onToggleCheckItem?: (itemId: string) => void;
  onLinkAdditionalCapa?: () => void;
}>;

function capaBadgeStyle(status: ClosureLinkedCapaItem["status"]) {
  switch (status) {
    case "Completed":
      return "bg-ehs-light-blue text-ehs-normal-blue";
    case "In Progress":
      return "bg-ehs-blue/10 text-ehs-purple";
    case "Planning":
    default:
      return "bg-ehs-light-bg text-ehs-gray";
  }
}

type LinkCapaModalProps = Readonly<{
  onClose: () => void;
  currentlyLinked: readonly ClosureLinkedCapaItem[];
  onSave: (selectedCapas: ClosureLinkedCapaItem[]) => void;
}>;

function LinkCapaModal(props: Readonly<LinkCapaModalProps>) {
  const { onClose, currentlyLinked, onSave } = props;

  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    currentlyLinked.map((item) => item.id),
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Only CAPAs actually linked to this incident are selectable. This list used
  // to be seeded with six invented CAPAs (CAPA-012 … CAPA-030), which let a
  // reviewer attach a CAPA that does not exist to a real closure record.
  // There is no org-wide CAPA list endpoint yet — use-capa-queries only
  // exposes per-incident, task and review queries — so until one exists there
  // is nothing further to offer here.
  const allItemsMap = new Map<string, ClosureLinkedCapaItem>();
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
        <span className="text-ehs-gray text4 font-medium">
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
            icon="mdi:plus"
          />
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Search Bar */}
        <div className={`${FIELD_INPUT_LG_CLASS} relative flex items-center`}>
          <Icon
            icon="mdi:magnify"
            className="text-ehs-muted-text mr-2 size-5"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search CAPAs or action items by title or description..."
            className="text-ehs-dark-bg placeholder:text-ehs-muted-text w-full bg-transparent text4 font-normal outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-ehs-muted-text hover:text-ehs-dark-bg"
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
                    ? "border-ehs-normal-blue bg-ehs-light-blue"
                    : "border-ehs-border hover:border-ehs-border bg-white",
                ].join(" ")}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={[
                      "flex size-5 shrink-0 items-center justify-center rounded border transition-colors",
                      isSelected
                        ? "border-ehs-normal-blue bg-ehs-normal-blue text-ehs-light-text"
                        : "border-ehs-border bg-white",
                    ].join(" ")}
                  >
                    {isSelected && (
                      <Icon icon="mdi:check" className="size-3.5" />
                    )}
                  </div>

                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-ehs-dark-bg text5">
                        {item.title}
                      </span>
                    </div>
                    <span className="text-ehs-gray truncate text4 font-normal">
                      {item.subtitle}
                    </span>
                  </div>
                </div>

                <div className="ml-3 flex shrink-0 items-center gap-3">
                  <div className="hidden items-center gap-2 sm:flex">
                    <div className="bg-ehs-border h-[6px] w-16 overflow-hidden rounded-full">
                      <div
                        className="bg-ehs-normal-blue h-full rounded-full"
                        style={{ width: `${String(item.progressPercent)}%` }}
                      />
                    </div>
                    <span className="text-ehs-gray text4 font-semibold">
                      {item.progressPercent}%
                    </span>
                  </div>

                  <span
                    className={[
                      "rounded-full px-2.5 py-0.5 text8 font-bold whitespace-nowrap",
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
                className="text-ehs-muted-text size-8"
              />
              <span className="text-ehs-gray mt-2 text4 font-medium">
                {allItems.length === 0
                  ? "No CAPAs are linked to this incident yet."
                  : "No CAPA or action items match your search."}
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
        className="text-ehs-dark-bg text5 leading-normal font-bold"
      >
        Preventive Measures & CAPAs
      </Text>

      {/* Actions Taken */}
      <div className="flex flex-col">
        <label className="text-ehs-muted-text mb-2 text8 font-bold tracking-[0.5px] uppercase">
          ACTIONS TAKEN
        </label>
        <textarea
          value={data.actionsTaken}
          onChange={(e) => onChangeField("actionsTaken", e.target.value)}
          rows={3}
          placeholder="Detail preventive actions taken..."
          className={FIELD_TEXTAREA_CLASS}
        />
      </div>

      {/* Linked CAPAs */}
      <div className="flex flex-col">
        <label className="text-ehs-muted-text mb-2.5 text8 font-bold tracking-[0.5px] uppercase">
          LINKED CAPAS
        </label>

        <div className="flex flex-col gap-3">
          {linkedCapas.map((capa) => (
            <div
              key={capa.id}
              className="rounded-3.5 border-ehs-border hover:border-ehs-border flex items-center justify-between border bg-white px-4 py-3.5 shadow-xs transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="bg-ehs-light-blue/60 text-ehs-normal-blue flex size-7 shrink-0 items-center justify-center rounded-full">
                  <Icon icon="mdi:check-circle-outline" className="size-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <Text
                    as="span"
                    className="text-ehs-dark-bg text4 font-bold"
                  >
                    {capa.title}
                  </Text>
                  <Text
                    as="span"
                    className="text-ehs-muted-text text4 font-normal"
                  >
                    {capa.subtitle}
                  </Text>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-ehs-border h-[6px] w-24 overflow-hidden rounded-full">
                  <div
                    className="bg-ehs-normal-blue h-full rounded-full transition-all duration-300"
                    style={{ width: `${String(capa.progressPercent)}%` }}
                  />
                </div>
                <span
                  className={[
                    "rounded-full px-2.5 py-0.5 text8 font-bold whitespace-nowrap",
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
          className="text-ehs-normal-blue mt-3 flex items-center gap-1.5 text4 font-bold transition-colors hover:underline"
        >
          <Icon icon="mdi:plus" className="size-4" />
          <span>Link additional CAPA or Action Item</span>
        </button>
      </div>

      {/* Link CAPA Modal — mounted only while open, so each open starts from
          the current links via the state initialiser rather than being reset
          by an effect. */}
      {isModalOpen ? (
        <LinkCapaModal
          onClose={() => setIsModalOpen(false)}
          currentlyLinked={linkedCapas}
          onSave={handleSaveCapas}
        />
      ) : null}
    </div>
  );
}
