"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents";
import {
  SCORE_WEIGHT_OPTIONS,
  TEMPLATE_ITEM_ICONS,
  TEMPLATE_ITEM_TYPES,
  createItem,
  createSection,
  nextId,
  type TemplateItem,
  type TemplateItemType,
  type TemplateSection,
} from "./template-builder-data";

const labelClass =
  "text-ehs-muted-text text-sm font-bold tracking-wider uppercase";

const inputClass =
  "w-full rounded-lg border border-slate-900/10 bg-white px-3 py-2.5 text-sm text-ehs-dark-bg outline-none transition placeholder:text-ehs-muted-text focus:border-ehs-normal-blue focus:ring-2 focus:ring-ehs-normal-blue/20";

/** Small square icon button used along each row. */
function IconButton(
  props: Readonly<{
    icon: string;
    label: string;
    tone?: "default" | "active" | "danger";
    onClick: () => void;
  }>,
) {
  const { icon, label, tone = "default", onClick } = props;

  const toneClass =
    tone === "active"
      ? "bg-ehs-normal-blue text-white"
      : tone === "danger"
        ? "text-ehs-red bg-ehs-red/10 hover:bg-ehs-red/20"
        : "text-ehs-muted-text bg-ehs-light-bg/60 hover:bg-black/5";

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={[
        "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors",
        toneClass,
      ].join(" ")}
    >
      <Icon icon={icon} className="size-4" aria-hidden="true" />
    </button>
  );
}

function ItemRow(
  props: Readonly<{
    item: TemplateItem;
    isExpanded: boolean;
    onToggleSettings: () => void;
    onChange: (patch: Partial<TemplateItem>) => void;
    onDuplicate: () => void;
    onDelete: () => void;
  }>,
) {
  const {
    item,
    isExpanded,
    onToggleSettings,
    onChange,
    onDuplicate,
    onDelete,
  } = props;

  return (
    <li className="overflow-hidden rounded-xl border border-slate-900/10 bg-white">
      <div className="flex items-center gap-2.5 p-2.5">
        <Icon
          icon="mdi:drag-vertical"
          className="text-ehs-muted-text size-4 shrink-0"
          aria-hidden="true"
        />

        <span className="bg-ehs-normal-blue/12 text-ehs-dark-blue inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold">
          <Icon
            icon={TEMPLATE_ITEM_ICONS[item.type]}
            className="size-3.5"
            aria-hidden="true"
          />
          {item.type}
        </span>

        <input
          value={item.label}
          placeholder="Question label *"
          aria-label="Question label"
          onChange={(event) => onChange({ label: event.target.value })}
          className={inputClass}
        />

        <IconButton
          icon="mdi:cog-outline"
          label="Item settings"
          tone={isExpanded ? "active" : "default"}
          onClick={onToggleSettings}
        />
        <IconButton
          icon="mdi:content-copy"
          label="Duplicate item"
          onClick={onDuplicate}
        />
        <IconButton
          icon="mdi:trash-can-outline"
          label="Delete item"
          tone="danger"
          onClick={onDelete}
        />
      </div>

      {isExpanded ? (
        <div className="grid gap-4 border-t border-slate-900/10 bg-[rgba(238,241,246,0.5)] p-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <span className={labelClass}>Guidance / Hint</span>
            <input
              value={item.guidance}
              placeholder="Optional helper text"
              onChange={(event) => onChange({ guidance: event.target.value })}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className={labelClass}>Score Weight</span>
            <div className="relative">
              <select
                value={item.scoreWeight}
                onChange={(event) => {
                  onChange({ scoreWeight: Number(event.target.value) });
                }}
                className={`${inputClass} appearance-none pr-9`}
              >
                {SCORE_WEIGHT_OPTIONS.map((weight) => (
                  <option key={weight} value={weight}>
                    {weight}
                  </option>
                ))}
              </select>
              <Icon
                icon="mdi:chevron-down"
                className="text-ehs-muted-text pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      ) : null}
    </li>
  );
}

export type BuildSectionsStepProps = Readonly<{
  sections: TemplateSection[];
  onSectionsChange: (sections: TemplateSection[]) => void;
}>;

export function BuildSectionsStep(props: BuildSectionsStepProps) {
  const { sections, onSectionsChange } = props;

  const [activeSectionId, setActiveSectionId] = useState(
    () => sections[0]?.id ?? "",
  );
  const [expandedItemId, setExpandedItemId] = useState<string | null>(
    () => sections[0]?.items[0]?.id ?? null,
  );
  const [isAddingItem, setIsAddingItem] = useState(false);

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
    const section = createSection(sections.length + 1);
    onSectionsChange([...sections, section]);
    setActiveSectionId(section.id);
  };

  const handleDeleteSection = (sectionId: string) => {
    const remaining = sections.filter((section) => section.id !== sectionId);
    onSectionsChange(remaining);

    if (sectionId === activeSectionId) {
      setActiveSectionId(remaining[0]?.id ?? "");
    }
  };

  const handleAddItem = (type: TemplateItemType) => {
    const item = createItem(type);
    patchItems([...activeSection.items, item]);
    setExpandedItemId(item.id);
    setIsAddingItem(false);
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
                        : "border-transparent hover:bg-black/5",
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
                        {section.title}
                      </span>
                      <span className="text-ehs-muted-text text-xs">
                        {`${String(section.items.length)} items`}
                      </span>
                    </span>

                    <IconButton
                      icon="mdi:trash-can-outline"
                      label={`Delete ${section.title}`}
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
          className="text-ehs-normal-blue inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-900/10 bg-white px-4 py-2.5 text-sm font-semibold transition-colors"
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

            <div className="flex flex-col gap-1.5">
              <span className={labelClass}>
                Description{" "}
                <span className="text-ehs-muted-text normal-case">
                  (optional)
                </span>
              </span>
              <input
                value={activeSection.description}
                placeholder="Optional guidance text for the auditor"
                aria-label="Section description"
                onChange={(event) => {
                  patchActiveSection({ description: event.target.value });
                }}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-2.5 border-t border-slate-900/10 pt-4">
              <h3 className={labelClass}>
                {`Items (${String(activeSection.items.length)})`}
              </h3>

              {activeSection.items.length > 0 ? (
                <ul className="flex flex-col gap-2.5">
                  {activeSection.items.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      isExpanded={expandedItemId === item.id}
                      onToggleSettings={() => {
                        setExpandedItemId(
                          expandedItemId === item.id ? null : item.id,
                        );
                      }}
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
                      onDelete={() => {
                        patchItems(
                          activeSection.items.filter(
                            (entry) => entry.id !== item.id,
                          ),
                        );
                      }}
                    />
                  ))}
                </ul>
              ) : (
                <p className="text-ehs-muted-text text-sm">
                  No items yet. Add one to start building this section.
                </p>
              )}

              {/* Add item, with its type picker */}
              <div className="relative w-fit">
                <button
                  type="button"
                  aria-expanded={isAddingItem}
                  onClick={() => setIsAddingItem(!isAddingItem)}
                  className="bg-ehs-normal-blue/12 text-ehs-dark-blue hover:bg-ehs-normal-blue/20 inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
                >
                  <Icon icon="mdi:plus" className="size-4" aria-hidden="true" />
                  Add Item
                  <Icon
                    icon="mdi:chevron-down"
                    className={[
                      "size-4 transition-transform",
                      isAddingItem ? "rotate-180" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-hidden="true"
                  />
                </button>

                {isAddingItem ? (
                  <ul className="absolute z-20 mt-1.5 w-52 overflow-hidden rounded-xl border border-slate-900/10 bg-white py-1 shadow-[0px_12px_32px_-8px_rgba(15,23,42,0.24)]">
                    {TEMPLATE_ITEM_TYPES.map((type) => (
                      <li key={type}>
                        <button
                          type="button"
                          onClick={() => handleAddItem(type)}
                          className="hover:bg-ehs-light-bg/60 text-ehs-dark-bg flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm transition-colors"
                        >
                          <Icon
                            icon={TEMPLATE_ITEM_ICONS[type]}
                            className="text-ehs-muted-text size-4"
                            aria-hidden="true"
                          />
                          {type}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
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
