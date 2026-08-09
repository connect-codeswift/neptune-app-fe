"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { GlassSelect } from "@/components/ui/GlassSelect";
import { FIELD_INPUT_LG_CLASS } from "@/components/ui/field-styles";
import { uploadFileToCloudinary } from "@/lib/upload-to-cloudinary";
import { ChooseItemTypeDialog } from "./ChooseItemTypeDialog";
import {
  SCORE_WEIGHT_OPTIONS,
  TEMPLATE_ITEM_ICONS,
  createItem,
  createSection,
  isItemValueFilled,
  nextId,
  type TemplateItem,
  type TemplateItemType,
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

const previewClass = FIELD_INPUT_LG_CLASS;

const choiceLabelClass = "flex cursor-pointer items-center gap-2 text-ehs-gray";

const SAMPLE_OPTIONS = ["Option 1", "Option 2", "Option 3"];

/** Teal donut radio indicator, paired with an sr-only native input. */
function RadioDot(props: Readonly<{ checked: boolean }>) {
  return (
    <span
      aria-hidden="true"
      className={[
        "flex size-5.5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
        props.checked
          ? "border-ehs-normal-blue bg-ehs-normal-blue"
          : "border-slate-900/25",
      ].join(" ")}
    >
      {props.checked ? (
        <span className="size-2.5 rounded-full bg-white" />
      ) : null}
    </span>
  );
}

/** Teal checkbox indicator, paired with an sr-only native input. */
function CheckBox(props: Readonly<{ checked: boolean }>) {
  return (
    <span
      aria-hidden="true"
      className={[
        "flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
        props.checked
          ? "border-ehs-normal-blue bg-ehs-normal-blue text-white"
          : "border-slate-900/25",
      ].join(" ")}
    >
      {props.checked ? <Icon icon="mdi:check" className="size-3.5" /> : null}
    </span>
  );
}

/** Upload control for Photo / File items; stores the Cloudinary URL as value. */
function ItemUploadControl(
  props: Readonly<{
    value: string;
    accept: string;
    icon: string;
    label: string;
    variant: "image" | "file";
    onValueChange: (value: string) => void;
  }>,
) {
  const { value, accept, icon, label, variant, onValueChange } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setIsUploading(true);
    try {
      const result = await uploadFileToCloudinary(file);
      onValueChange(result.secureUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const fileName = value
    ? decodeURIComponent(value.split("/").pop() ?? "file")
    : "";

  return (
    <div className="flex flex-col gap-2">
      {/* Hidden native picker, shared by the empty and uploaded states. */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          void upload(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {value ? (
        <>
          {variant === "image" ? (
            <div className="relative size-28 overflow-hidden rounded-lg border border-slate-900/10">
              <Image
                src={value}
                alt="Uploaded preview"
                fill
                sizes="112px"
                className="object-cover"
              />
            </div>
          ) : (
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="text-ehs-dark-bg flex items-center gap-2 rounded-lg border border-slate-900/10 bg-white px-3 py-2 text-sm"
            >
              <Icon
                icon="mdi:file-document-outline"
                className="text-ehs-normal-blue size-5 shrink-0"
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate">{fileName}</span>
            </a>
          )}

          <div className="flex items-center gap-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="text-ehs-normal-blue cursor-pointer disabled:opacity-50"
            >
              {isUploading ? "Uploading..." : "Replace"}
            </button>
            <button
              type="button"
              onClick={() => onValueChange("")}
              className="text-ehs-red cursor-pointer"
            >
              Remove
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="text-ehs-gray hover:border-ehs-normal-blue/60 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-900/15 px-3 py-3 transition-colors disabled:cursor-not-allowed"
        >
          <Icon
            icon={isUploading ? "mdi:loading" : icon}
            className={["size-4", isUploading ? "animate-spin" : ""]
              .filter(Boolean)
              .join(" ")}
            aria-hidden="true"
          />
          {isUploading ? "Uploading..." : label}
        </button>
      )}

      {error ? <p className="text-ehs-red text-xs">{error}</p> : null}
    </div>
  );
}

/**
 * Interactive control for an item, bound to `item.value`. The chosen answer is
 * saved onto the item so it survives step navigation.
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
  const many = Array.isArray(value) ? value : [];

  const toggleMany = (option: string) => {
    onValueChange(
      many.includes(option)
        ? many.filter((entry) => entry !== option)
        : [...many, option],
    );
  };

  switch (item.type) {
    case "Text":
      return (
        <input
          value={single}
          placeholder="Short text answer"
          aria-label="Text answer"
          onChange={(event) => onValueChange(event.target.value)}
          className={previewClass}
        />
      );
    case "Number":
      return (
        <input
          type="number"
          value={single}
          placeholder="0"
          aria-label="Number answer"
          onChange={(event) => onValueChange(event.target.value)}
          className={previewClass}
        />
      );
    case "Location":
      return (
        <input
          value={single}
          placeholder="GPS or address"
          aria-label="Location"
          onChange={(event) => onValueChange(event.target.value)}
          className={previewClass}
        />
      );
    case "Date / Time":
      return (
        <input
          type="date"
          value={single}
          aria-label="Date"
          onChange={(event) => onValueChange(event.target.value)}
          className={previewClass}
        />
      );
    case "Yes / No":
      return (
        <div className="flex gap-5">
          {["Yes", "No"].map((option) => (
            <label key={option} className={choiceLabelClass}>
              <input
                type="radio"
                name={item.id}
                checked={single === option}
                onChange={() => onValueChange(option)}
                className="sr-only"
              />
              <RadioDot checked={single === option} />
              {option}
            </label>
          ))}
        </div>
      );
    case "Single Choice":
      return (
        <div className="flex flex-col gap-1.5">
          {SAMPLE_OPTIONS.map((option) => (
            <label key={option} className={choiceLabelClass}>
              <input
                type="radio"
                name={item.id}
                checked={single === option}
                onChange={() => onValueChange(option)}
                className="sr-only"
              />
              <RadioDot checked={single === option} />
              {option}
            </label>
          ))}
        </div>
      );
    case "Multi Choice":
      return (
        <div className="flex flex-col gap-1.5">
          {SAMPLE_OPTIONS.map((option) => (
            <label key={option} className={choiceLabelClass}>
              <input
                type="checkbox"
                checked={many.includes(option)}
                onChange={() => toggleMany(option)}
                className="sr-only"
              />
              <CheckBox checked={many.includes(option)} />
              {option}
            </label>
          ))}
        </div>
      );
    case "Checkbox":
      return (
        <label className={choiceLabelClass}>
          <input
            type="checkbox"
            checked={single === "checked"}
            onChange={(event) =>
              onValueChange(event.target.checked ? "checked" : "")
            }
            className="sr-only"
          />
          <CheckBox checked={single === "checked"} />I acknowledge this item
        </label>
      );
    case "Score / Rating": {
      const rating = Number(single) || 0;

      return (
        <div className="flex items-center gap-1">
          {Array.from({ length: 10 }).map((_, index) => {
            const score = index + 1;

            return (
              <button
                key={score}
                type="button"
                aria-label={`Rate ${String(score)}`}
                onClick={() => onValueChange(String(score))}
                className="cursor-pointer"
              >
                <Icon
                  icon={score <= rating ? "mdi:star" : "mdi:star-outline"}
                  className={
                    score <= rating
                      ? "text-ehs-yellow size-5"
                      : "text-ehs-muted-text size-5"
                  }
                />
              </button>
            );
          })}
        </div>
      );
    }
    case "Photo / Media":
      return (
        <ItemUploadControl
          value={single}
          accept="image/*"
          icon="mdi:camera-outline"
          label="Attach photo evidence"
          variant="image"
          onValueChange={onValueChange}
        />
      );
    case "File Attachment":
      return (
        <ItemUploadControl
          value={single}
          accept="*/*"
          icon="mdi:paperclip"
          label="Upload document"
          variant="file"
          onValueChange={onValueChange}
        />
      );
    case "Signature":
      return (
        <div className="text-ehs-muted-text flex h-14 items-center justify-center rounded-lg border border-dashed border-slate-900/15 text-sm">
          Sign-off capture
        </div>
      );
    case "Instruction":
      return (
        <p className="text-ehs-gray bg-ehs-light-bg/40 rounded-lg px-3 py-2 text-sm">
          Non-answerable instruction block
        </p>
      );
    default:
      return null;
  }
}

function ItemRow(
  props: Readonly<{
    item: TemplateItem;
    isExpanded: boolean;
    isDragging: boolean;
    invalid: boolean;
    onToggleSettings: () => void;
    onChange: (patch: Partial<TemplateItem>) => void;
    onDuplicate: () => void;
    onDelete: () => void;
    onDragStart: () => void;
    onDragOver: (event: React.DragEvent) => void;
    onDrop: () => void;
    onDragEnd: () => void;
  }>,
) {
  const {
    item,
    isExpanded,
    isDragging,
    invalid,
    onToggleSettings,
    onChange,
    onDuplicate,
    onDelete,
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
        "overflow-hidden rounded-xl border bg-white transition-opacity",
        isDragging
          ? "border-ehs-normal-blue opacity-50"
          : invalid
            ? "border-ehs-red/60"
            : "border-slate-900/10",
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

        <span className="bg-ehs-normal-blue/12 text-ehs-dark-blue inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold">
          <Icon
            icon={TEMPLATE_ITEM_ICONS[item.type]}
            className="size-3.5"
            aria-hidden="true"
          />
          {item.type}
        </span>

        {/* The proper answer field for the selected type */}
        <div className="min-w-0 flex-1">
          <ItemPreview
            item={item}
            onValueChange={(value) => onChange({ value })}
          />
        </div>

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
        <div className="bg-ehs-normal-blue-bg-light/30 grid gap-4 border-t border-slate-900/10 p-4 sm:grid-cols-2">
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
            <GlassSelect
              options={SCORE_WEIGHT_OPTIONS.map((weight) => ({
                value: String(weight),
                label: String(weight),
              }))}
              value={String(item.scoreWeight)}
              onChange={(value) => {
                onChange({ scoreWeight: Number(value) });
              }}
              aria-label="Score weight"
            />
          </div>
        </div>
      ) : null}
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
  const [expandedItemId, setExpandedItemId] = useState<string | null>(
    () => sections[0]?.items[0]?.id ?? null,
  );
  const [isAddingItem, setIsAddingItem] = useState(false);
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
                placeholder="Optional guidance text for the inspector"
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
                      isDragging={draggingItemId === item.id}
                      invalid={
                        highlightUnfilled &&
                        !exemptItemIds?.has(item.id) &&
                        !isItemValueFilled(item)
                      }
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

              {/* Add item — opens the "Choose item type" dialog */}
              <button
                type="button"
                onClick={() => setIsAddingItem(true)}
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

      <ChooseItemTypeDialog
        open={isAddingItem}
        onSelect={handleAddItem}
        onClose={() => setIsAddingItem(false)}
      />
    </div>
  );
}
