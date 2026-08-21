import type { FormValues } from "@/components/form-builder";

/**
 * Answer control an inspector can get for a checklist item. Free-text is the
 * only control offered — the old 12-option type picker (Number, Date/Time,
 * Yes/No, Signature, …) was removed, so every item is created and answered as
 * text.
 */
export const TEMPLATE_ITEM_TYPES = ["Text"] as const;

export type TemplateItemType = (typeof TEMPLATE_ITEM_TYPES)[number];

export type TemplateItem = {
  id: string;
  type: TemplateItemType;
  label: string;
  /** Inspectors must answer this item. New items default to required. */
  required: boolean;
  /** Captured value for the item's control: a string, or string[] for
   * multi-select controls. */
  value: string | string[];
};

export type TemplateSection = {
  id: string;
  title: string;
  description: string;
  items: TemplateItem[];
};

let idCounter = 0;

/** Unique enough for client-side list keys; ids come from the API later. */
export function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${String(idCounter)}`;
}

export function createItem(type: TemplateItemType = "Text"): TemplateItem {
  return {
    id: nextId("item"),
    type,
    label: "",
    required: true,
    value: "",
  };
}

/** Longest display name before it gets ellipsised in lists and dropdowns. */
const MAX_DISPLAY_LENGTH = 40;

/** Human-readable form of an item's captured value, or "" when empty. */
export function itemValueText(item: TemplateItem): string {
  const value = item.value;

  if (Array.isArray(value)) return value.join(", ");
  if (typeof value !== "string") return "";

  return value.trim();
}

/**
 * Display name for an item: its label, else its entered value, else its type —
 * so the scoring/rules screens show what the inspector filled in. Long values are
 * ellipsised so they don't stretch dropdowns and lists.
 */
export function itemDisplayName(item: TemplateItem): string {
  const name = item.label.trim() || itemValueText(item) || item.type;

  return name.length > MAX_DISPLAY_LENGTH
    ? `${name.slice(0, MAX_DISPLAY_LENGTH)}…`
    : name;
}

/** Whether a required item's control has an acceptable value. */
export function isItemValueFilled(item: TemplateItem): boolean {
  if (!item.required) return true;

  const value = item.value;
  return typeof value === "string" && value.trim() !== "";
}

/** Title starts blank — the input shows "Untitled" as a placeholder instead. */
export function createSection(): TemplateSection {
  return {
    id: nextId("section"),
    title: "",
    description: "",
    items: [createItem()],
  };
}

/** Starting content, matching the design's two seeded sections. */
export function createInitialSections(): TemplateSection[] {
  return [
    {
      id: nextId("section"),
      title: "",
      description: "",
      items: [createItem()],
    },
  ];
}

/** The full set of data the 3-step wizard edits. */
export type WizardState = {
  values: FormValues;
  sections: TemplateSection[];
};
