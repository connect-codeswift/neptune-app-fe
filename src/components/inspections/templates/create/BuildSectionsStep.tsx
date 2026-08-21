"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { FIELD_INPUT_LG_CLASS } from "@/components/ui/field-styles";
import {
  createItem,
  createSection,
  isItemValueFilled,
  nextId,
  type TemplateItem,
  type TemplateSection,
} from "./template-builder-data";

const labelClass =
  "text-ehs-muted-text text-sm font-bold tracking-wider uppercase";

const inputClass = FIELD_INPUT_LG_CLASS;

/** Small square icon button used along each row. */
function IconButton(
  props: Readonly<{
    icon: string;
    label: string;
    tone?: "default" | "active" | "danger";
    disabled?: boolean;
    onClick: () => void;
  }>,
) {
  const { icon, label, tone = "default", disabled = false, onClick } = props;

  const toneClass =
    tone === "active"
      ? "bg-ehs-normal-blue text-ehs-on-accent"
      : tone === "danger"
        ? "text-ehs-red bg-ehs-red/10 hover:bg-ehs-red/20"
        : "text-ehs-muted-text bg-ehs-light-bg/60 hover:bg-ehs-surface-inverse/5";

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors",
        toneClass,
        disabled ? "cursor-not-allowed opacity-40" : "",
      ].join(" ")}
    >
      <Icon icon={icon} className="size-4" aria-hidden="true" />
    </button>
  );
}

const previewClass = FIELD_INPUT_LG_CLASS;

/**
 * Interactive control for an item, bound to `item.value`. The chosen answer is
 * saved onto the item so it survives step navigation. Every item is a free-text
 * answer — there is no type picker any more.
 */
function ItemPreview(
  props: Readonly<{
    item: TemplateItem;
    onValueChange: (value: string | string[]) => void;
  }>,
) {
  const { item, onValueChange } = props;
  const value = item.value;
  const single = typeof value === "string" ? value : "";

  return (
    <input
      value={single}
      placeholder="Enter question"
      aria-label="Question"
      onChange={(event) => onValueChange(event.target.value)}
      className={previewClass}
    />
  );
}

function ItemRow(
  props: Readonly<{
    item: TemplateItem;
    isDragging: boolean;
    invalid: boolean;
    onChange: (patch: Partial<TemplateItem>) => void;
    onDuplicate: () => void;
    onDelete: () => void;
    deleteDisabled: boolean;
    onDragStart: () => void;
    onDragOver: (event: React.DragEvent) => void;
    onDrop: () => void;
    onDragEnd: () => void;
  }>,
) {
  const {
    item,
    isDragging,
    invalid,
    onChange,
    onDuplicate,
    onDelete,
    deleteDisabled,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
  } = props;

  return (
    <li
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={[
        "bg-ehs-surface overflow-hidden rounded-xl border transition-opacity",
        isDragging
          ? "border-ehs-normal-blue opacity-50"
          : invalid
            ? "border-ehs-red/60"
            : "border-ehs-border-ink/10",
      ].join(" ")}
    >
      <div className="flex items-center gap-2.5 p-2.5">
        <span
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          aria-label="Drag to reorder"
          className="shrink-0 cursor-grab active:cursor-grabbing"
        >
          <Icon
            icon="mdi:drag-vertical"
            className="text-ehs-muted-text size-4"
            aria-hidden="true"
          />
        </span>

        {/* The question text for this item */}
        <div className="min-w-0 flex-1">
          <ItemPreview
            item={item}
            onValueChange={(value) => onChange({ value })}
          />
        </div>

        <IconButton
          icon="mdi:content-copy"
          label="Duplicate item"
          onClick={onDuplicate}
        />
        <IconButton
          icon="mdi:trash-can-outline"
          label="Delete item"
          tone="danger"
          disabled={deleteDisabled}
          onClick={onDelete}
        />
      </div>
    </li>
  );
}

export type BuildSectionsStepProps = Readonly<{
  sections: TemplateSection[];
  onSectionsChange: (sections: TemplateSection[]) => void;
  /** Flag required items with an unfilled value after a failed "Next". */
  highlightUnfilled?: boolean;
  /** Item ids exempt from the unfilled check (pre-loaded on edit). */
  exemptItemIds?: ReadonlySet<string>;
}>;

export function BuildSectionsStep(props: BuildSectionsStepProps) {
  const {
    sections,
    onSectionsChange,
    highlightUnfilled = false,
    exemptItemIds,
  } = props;

  const [activeSectionId, setActiveSectionId] = useState(
    () => sections[0]?.id ?? "",
  );
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);

  const activeSection =
    sections.find((section) => section.id === activeSectionId) ?? sections[0];

  const patchActiveSection = (patch: Partial<TemplateSection>) => {
    onSectionsChange(
      sections.map((section) =>
        section.id === activeSection.id ? { ...section, ...patch } : section,
      ),
    );
  };

  const patchItems = (items: TemplateItem[]) => {
    patchActiveSection({ items });
  };

  const handleAddSection = () => {
    const section = createSection();
    onSectionsChange([...sections, section]);
    setActiveSectionId(section.id);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (sections.length <= 1) return;

    const remaining = sections.filter((section) => section.id !== sectionId);
    onSectionsChange(remaining);

    if (sectionId === activeSectionId) {
      setActiveSectionId(remaining[0]?.id ?? "");
    }
  };

  const handleAddItem = () => {
    patchItems([...activeSection.items, createItem("Text")]);
  };

  const handleDeleteItem = (itemId: string) => {
    if (activeSection.items.length <= 1) return;

    patchItems(activeSection.items.filter((entry) => entry.id !== itemId));
  };

  /** Move the dragged item to the drop target's position within the section. */
  const handleItemDrop = (targetId: string) => {
    if (!draggingItemId || draggingItemId === targetId) return;

    const items = [...activeSection.items];
    const from = items.findIndex((entry) => entry.id === draggingItemId);
    const to = items.findIndex((entry) => entry.id === targetId);
    if (from === -1 || to === -1) return;

    const [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);
    patchItems(items);
    setDraggingItemId(null);
  };

  return (
    <div className="grid min-w-0 gap-3.5 xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
      {/* Section rail */}
      <IncidentGlassCard
        paddingClassName="p-4"
        incidentGlassCardClassName="gap-3 justify-between"
      >
        <div className="flex flex-col gap-1.5">
          <h3 className={labelClass}>
            {`Sections (${String(sections.length)})`}
          </h3>

          <ul className="flex flex-col gap-2">
            {sections.map((section) => {
              const isActive = section.id === activeSection.id;

              return (
                <li key={section.id}>
                  <div
                    className={[
                      "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors",
                      isActive
                        ? "border-ehs-normal-blue bg-ehs-normal-blue/8"
                        : "hover:bg-ehs-surface-inverse/5 border-transparent",
                    ].join(" ")}
                    onClick={() => setActiveSectionId(section.id)}
                  >
                    <Icon
                      icon="mdi:drag-vertical"
                      className="text-ehs-muted-text size-4 shrink-0"
                      aria-hidden="true"
                    />

                    <span className="flex min-w-0 flex-1 flex-col">
                      <span
                        className={[
                          "truncate font-semibold",
                          isActive ? "text-ehs-dark-blue" : "text-ehs-dark-bg",
                        ].join(" ")}
                      >
                        {section.title || "Untitled"}
                      </span>
                      <span className="text-ehs-muted-text text-xs">
                        {`${String(section.items.length)} items`}
                      </span>
                    </span>

                    <IconButton
                      icon="mdi:trash-can-outline"
                      label={`Delete ${section.title || "Untitled"}`}
                      disabled={sections.length <= 1}
                      onClick={() => handleDeleteSection(section.id)}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <button
          type="button"
          onClick={handleAddSection}
          className="text-ehs-normal-blue border-ehs-border-ink/10 bg-ehs-surface inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors"
        >
          <Icon icon="mdi:plus" className="size-4" aria-hidden="true" />
          Add Section
        </button>
      </IncidentGlassCard>

      {/* Active section editor */}
      <IncidentGlassCard
        paddingClassName="p-5"
        incidentGlassCardClassName="gap-5"
      >
        {activeSection ? (
          <>
            <div className="flex flex-col gap-1.5">
              <span className={labelClass}>
                Section Title <span className="text-ehs-red">*</span>
              </span>

              <div className="flex items-center gap-2.5">
                <input
                  value={activeSection.title}
                  placeholder="Untitled"
                  aria-label="Section title"
                  onChange={(event) => {
                    patchActiveSection({ title: event.target.value });
                  }}
                  className={inputClass}
                />
                <IconButton
                  icon="mdi:content-copy"
                  label="Duplicate section"
                  onClick={() => {
                    onSectionsChange([
                      ...sections,
                      {
                        ...activeSection,
                        id: nextId("section"),
                        items: activeSection.items.map((item) => ({
                          ...item,
                          id: nextId("item"),
                        })),
                      },
                    ]);
                  }}
                />
              </div>
            </div>

            <div className="border-ehs-border-ink/10 flex flex-col gap-2.5 border-t pt-4">
              <h3 className={labelClass}>
                {`Items (${String(activeSection.items.length)})`}
              </h3>

              {activeSection.items.length > 0 ? (
                <ul className="flex flex-col gap-2.5">
                  {activeSection.items.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      isDragging={draggingItemId === item.id}
                      invalid={
                        highlightUnfilled &&
                        !exemptItemIds?.has(item.id) &&
                        !isItemValueFilled(item)
                      }
                      onChange={(patch) => {
                        patchItems(
                          activeSection.items.map((entry) =>
                            entry.id === item.id
                              ? { ...entry, ...patch }
                              : entry,
                          ),
                        );
                      }}
                      onDuplicate={() => {
                        patchItems([
                          ...activeSection.items,
                          { ...item, id: nextId("item") },
                        ]);
                      }}
                      onDelete={() => handleDeleteItem(item.id)}
                      deleteDisabled={activeSection.items.length <= 1}
                      onDragStart={() => setDraggingItemId(item.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handleItemDrop(item.id)}
                      onDragEnd={() => setDraggingItemId(null)}
                    />
                  ))}
                </ul>
              ) : (
                <p className="text-ehs-muted-text text-sm">
                  No items yet. Add one to start building this section.
                </p>
              )}

              {/* Add item — appends a new text item directly, no type picker */}
              <button
                type="button"
                onClick={handleAddItem}
                className="bg-ehs-normal-blue/12 text-ehs-dark-blue hover:bg-ehs-normal-blue/20 inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
              >
                <Icon icon="mdi:plus" className="size-4" aria-hidden="true" />
                Add Item
              </button>
            </div>
          </>
        ) : (
          <p className="text-ehs-muted-text text-sm">
            Add a section to start building the template.
          </p>
        )}
      </IncidentGlassCard>
    </div>
  );
}
