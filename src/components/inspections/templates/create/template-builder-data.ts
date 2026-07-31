import type { FormValues } from "@/components/form-builder";

/** Answer controls an inspector can get for a checklist item, in picker order. */
export const TEMPLATE_ITEM_TYPES = [
  "Text",
  "Number",
  "Yes / No",
  "Single Choice",
  "Multi Choice",
  "Checkbox",
  "Score / Rating",
  "Date / Time",
  "Photo / Media",
  "File Attachment",
  "Signature",
  "Location",
  "Instruction",
] as const;

export type TemplateItemType = (typeof TEMPLATE_ITEM_TYPES)[number];

/** Icon + one-line description shown in the "Choose item type" dialog. */
export const TEMPLATE_ITEM_META: Readonly<
  Record<TemplateItemType, { icon: string; description: string }>
> = {
  Text: { icon: "mdi:format-align-left", description: "Open-ended response" },
  Number: { icon: "mdi:pound", description: "Numeric input" },
  "Yes / No": {
    icon: "mdi:toggle-switch-outline",
    description: "Pass / fail response",
  },
  "Single Choice": {
    icon: "mdi:format-list-bulleted",
    description: "One selectable option",
  },
  "Multi Choice": {
    icon: "mdi:checkbox-multiple-marked-outline",
    description: "Multiple selections",
  },
  Checkbox: {
    icon: "mdi:checkbox-marked-outline",
    description: "Single acknowledgement",
  },
  "Score / Rating": {
    icon: "mdi:star-outline",
    description: "Rating scale 1-10",
  },
  "Date / Time": {
    icon: "mdi:calendar-outline",
    description: "Date and time picker",
  },
  "Photo / Media": {
    icon: "mdi:camera-outline",
    description: "Photo evidence",
  },
  "File Attachment": {
    icon: "mdi:paperclip",
    description: "Upload document",
  },
  Signature: { icon: "mdi:draw", description: "Sign-off capture" },
  Location: { icon: "mdi:map-marker-outline", description: "GPS or address" },
  Instruction: {
    icon: "mdi:information-outline",
    description: "Non-answerable block",
  },
};

/** Iconify icon shown on each item's type chip. */
export const TEMPLATE_ITEM_ICONS: Readonly<Record<TemplateItemType, string>> =
  Object.fromEntries(
    TEMPLATE_ITEM_TYPES.map((type) => [type, TEMPLATE_ITEM_META[type].icon]),
  ) as Record<TemplateItemType, string>;

export type TemplateItem = {
  id: string;
  type: TemplateItemType;
  label: string;
  guidance: string;
  /** Contribution to the section score; 0 means unscored. */
  scoreWeight: number;
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

export const SCORE_WEIGHT_OPTIONS = [0, 1, 2, 3, 5, 10] as const;

let idCounter = 0;

/** Unique enough for client-side list keys; ids come from the API later. */
export function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${String(idCounter)}`;
}

export function createItem(type: TemplateItemType): TemplateItem {
  return {
    id: nextId("item"),
    type,
    label: "",
    guidance: "",
    scoreWeight: 0,
    required: true,
    value: type === "Multi Choice" ? [] : "",
  };
}

/** Longest display name before it gets ellipsised in lists and dropdowns. */
const MAX_DISPLAY_LENGTH = 40;

/** Human-readable form of an item's captured value, or "" when empty. */
export function itemValueText(item: TemplateItem): string {
  const value = item.value;

  if (Array.isArray(value)) return value.join(", ");
  if (item.type === "Checkbox") return value === "checked" ? "Checked" : "";
  if (typeof value !== "string") return "";

  const text = value.trim();
  if (text === "") return "";

  // Uploads store a Cloudinary URL — show just the file name, not the URL.
  if (item.type === "Photo / Media" || item.type === "File Attachment") {
    return decodeURIComponent(text.split("/").pop() ?? text);
  }

  return text;
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

/**
 * Whether a required item's control has an acceptable value. Optional items,
 * and types with no fillable control (Signature, Instruction), always pass.
 */
export function isItemValueFilled(item: TemplateItem): boolean {
  if (!item.required) return true;

  const value = item.value;

  switch (item.type) {
    case "Multi Choice":
      return Array.isArray(value) && value.length > 0;
    case "Checkbox":
      return value === "checked";
    case "Number":
      return (
        typeof value === "string" &&
        value.trim() !== "" &&
        !Number.isNaN(Number(value))
      );
    case "Signature":
    case "Instruction":
      return true;
    default:
      return typeof value === "string" && value.trim() !== "";
  }
}

export function createSection(index: number): TemplateSection {
  return {
    id: nextId("section"),
    title: `Section ${String(index)}: Untitled`,
    description: "",
    items: [],
  };
}

/* ---- Step 3: Scoring & Logic ---- */

export const SCORING_METHODS = ["Percentage", "Points", "Weighted"] as const;
export type ScoringMethod = (typeof SCORING_METHODS)[number];

export type ScoringConfig = {
  enabled: boolean;
  method: ScoringMethod;
  /** Pass mark as a percentage, 0-100. */
  passThreshold: number;
  /** Show the running score to the inspector while they fill the form. */
  showScoreToUser: boolean;
};

export function createScoringConfig(): ScoringConfig {
  return {
    enabled: true,
    method: "Percentage",
    passThreshold: 80,
    showScoreToUser: false,
  };
}

/** IF/THEN rule for conditional logic: IF <question> <operator> <value>. */
export type TemplateRule = {
  id: string;
  active: boolean;
  ifQuestion: string;
  ifOperator: string;
  ifValue: string;
  thenAction: string;
  thenValue: string;
};

export const RULE_OPERATORS = [
  "Equals",
  "Not Equals",
  "Is Answered",
  "Is Empty",
] as const;

/** Comparison values for the IF clause, matching the checklist answers. */
export const RULE_VALUES = ["Yes", "No", "N/A", "Partial"] as const;

export const RULE_ACTIONS = [
  "Show Item",
  "Hide Item",
  "Require Item",
  "Show Section",
  "Hide Section",
] as const;

export function createRule(): TemplateRule {
  return {
    id: nextId("rule"),
    active: true,
    ifQuestion: "",
    ifOperator: "",
    ifValue: "",
    thenAction: "",
    thenValue: "",
  };
}

/** The backend rejects a template whose rules lack any of these three. */
export function isRuleComplete(rule: TemplateRule): boolean {
  return (
    rule.ifQuestion.trim() !== "" &&
    rule.ifOperator.trim() !== "" &&
    rule.thenAction.trim() !== ""
  );
}

/* ---- Step 4: Settings ---- */

export const ACCESS_LEVELS = [
  "All Users",
  "Specific Roles",
  "Specific Users / Teams",
] as const;
export type AccessLevel = (typeof ACCESS_LEVELS)[number];

export const SITE_OPTIONS = [
  "All Sites",
  "HQ - Main Facility",
  "Plant B",
  "Warehouse A",
] as const;

export type TemplateSettings = {
  accessLevel: AccessLevel;
  /** Selected site labels; the design defaults to "All Sites". */
  sites: string[];
  allowDuplication: boolean;
  allowEditing: boolean;
};

export function createSettings(): TemplateSettings {
  return {
    accessLevel: "All Users",
    sites: ["All Sites"],
    allowDuplication: true,
    allowEditing: false,
  };
}

/** Starting content, matching the design's two seeded sections. */
export function createInitialSections(): TemplateSection[] {
  return [
    {
      id: nextId("section"),
      title: "Section 1: Basic Information",
      description: "",
      items: [
        createItem("Number"),
        createItem("Text"),
        createItem("Date / Time"),
        createItem("Yes / No"),
      ],
    },
    {
      id: nextId("section"),
      title: "Section 2: Compliance",
      description: "",
      items: [createItem("Yes / No"), createItem("Yes / No")],
    },
  ];
}

/** The full set of data the 5-step wizard edits. */
export type WizardState = {
  values: FormValues;
  sections: TemplateSection[];
  scoring: ScoringConfig;
  rules: TemplateRule[];
  settings: TemplateSettings;
};
