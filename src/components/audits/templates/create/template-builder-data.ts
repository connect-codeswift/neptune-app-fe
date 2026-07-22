/** Answer control an auditor gets for a checklist item. */
export const TEMPLATE_ITEM_TYPES = [
  "Number",
  "Text",
  "Date / Time",
  "Yes / No",
] as const;

export type TemplateItemType = (typeof TEMPLATE_ITEM_TYPES)[number];

/** Iconify icon shown on each item's type chip. */
export const TEMPLATE_ITEM_ICONS: Readonly<Record<TemplateItemType, string>> = {
  Number: "mdi:pound",
  Text: "mdi:format-align-left",
  "Date / Time": "mdi:calendar-outline",
  "Yes / No": "mdi:toggle-switch-outline",
};

export type TemplateItem = {
  id: string;
  type: TemplateItemType;
  label: string;
  guidance: string;
  /** Contribution to the section score; 0 means unscored. */
  scoreWeight: number;
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
  return { id: nextId("item"), type, label: "", guidance: "", scoreWeight: 0 };
}

export function createSection(index: number): TemplateSection {
  return {
    id: nextId("section"),
    title: `Section ${String(index)}: Untitled`,
    description: "",
    items: [],
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
        { ...createItem("Text"), label: "Auditor Name" },
        { ...createItem("Date / Time"), label: "Audit Date" },
        { ...createItem("Yes / No"), label: "Question Label" },
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
