/*
 * The vocabulary the chemical form offers, in a module of its own with no
 * imports.
 *
 * It sits apart from `chemical-utils` because the importer validates against
 * these same lists — a second copy is a second thing to forget when a category
 * is added — and `chemical-utils` pulls in enough of the app that importing it
 * just to read three lists is more than the importer needs.
 */
export const CHEMICAL_STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
] as const;

/**
 * GHS hazard category — the severity level, where Category 1 is the most
 * severe. The *kind* of hazard is captured by the GHS Pictograms field, so this
 * field carries the level only.
 */
export const HAZARD_CATEGORY_OPTIONS = [
  { value: "", label: "Select category" },
  { value: "Category 1", label: "Category 1 (most severe)" },
  { value: "Category 2", label: "Category 2" },
  { value: "Category 3", label: "Category 3" },
  { value: "Category 4", label: "Category 4" },
  { value: "Category 5", label: "Category 5 (least severe)" },
] as const;

export const SIGNAL_WORDS = ["Danger", "Warning"] as const;
