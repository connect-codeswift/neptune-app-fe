import type { FormSchema, SelectOption } from "@/components/form-builder";

export const HAZARD_TYPE_OPTIONS: readonly SelectOption[] = [
  { value: "slip-trip-fall", label: "Slip / Trip / Fall" },
  { value: "electrical", label: "Electrical" },
  { value: "chemical", label: "Chemical" },
  { value: "mechanical", label: "Mechanical" },
  { value: "ergonomic", label: "Ergonomic" },
  { value: "fire-explosion", label: "Fire / Explosion" },
  { value: "environmental", label: "Environmental" },
];

/** Compact type labels for tight layouts like the heatmap columns. */
export const HAZARD_TYPE_SHORT_LABELS: Readonly<Record<string, string>> = {
  "slip-trip-fall": "Slip",
  electrical: "Elec",
  chemical: "Chem",
  mechanical: "Mech",
  ergonomic: "Ergo",
  "fire-explosion": "Fire",
  environmental: "Envt",
};

export const LOCATION_OPTIONS: readonly SelectOption[] = [
  { value: "plant-a-line-1", label: "Plant A · Line 1" },
  { value: "plant-a-line-2", label: "Plant A · Line 2" },
  { value: "plant-b-fab-1", label: "Plant B · Fab 1" },
  { value: "warehouse-1", label: "Warehouse 1" },
  { value: "warehouse-2", label: "Warehouse 2" },
  { value: "warehouse-3", label: "Warehouse 3" },
];

/** Strongly-typed shape of a submitted Hazard report. */
export type HazardReportValues = {
  hazardType: string;
  location: string;
  description: string;
  /** Secure Cloudinary URLs of the attached photo evidence. */
  photos: string[];
};

export const hazardReportSchema: FormSchema = [
  {
    type: "select",
    name: "hazardType",
    label: "Hazard Type",
    required: true,
    colSpan: 6,
    placeholder: "Select hazard type",
    options: HAZARD_TYPE_OPTIONS,
    allowCustom: true,
    addCustomLabel: "Add custom hazard type",
    addCustomPlaceholder: "e.g. Confined space entry",
  },
  {
    type: "select",
    name: "location",
    label: "Location",
    required: true,
    colSpan: 6,
    placeholder: "Select location",
    options: LOCATION_OPTIONS,
    allowCustom: true,
    addCustomLabel: "Add custom location",
    addCustomPlaceholder: "e.g. Plant C · Loading Dock 2",
  },
  {
    type: "textarea",
    name: "description",
    label: "Description",
    required: true,
    colSpan: 12,
    rows: 4,
    placeholder:
      "Describe the hazard in detail. What did you observe? Where exactly? What is the potential risk?",
  },
  {
    type: "photo",
    name: "photos",
    label: "Photo Evidence",
    colSpan: 12,
    // The create endpoint stores a single image URL.
    maxFiles: 1,
    placeholder: "Attach Photo Evidence",
    helperText: "Photos greatly improve resolution speed",
  },
];
