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
/**
 * Outcomes, not categories — "someone could slip" rather than "slip hazard".
 * The draft turns this into the risk clause of the narrative, so a category
 * here produces a sentence that restates the hazard type instead of saying
 * what it could do.
 */
export const POTENTIAL_CONSEQUENCE_OPTIONS: readonly SelectOption[] = [
  { value: "slip-trip-fall", label: "Someone could slip, trip or fall" },
  {
    value: "struck-caught",
    label: "Someone could be struck by or caught in equipment",
  },
  {
    value: "harmful-exposure",
    label: "Someone could be exposed to a harmful substance",
  },
  { value: "fire-explosion", label: "Fire or explosion" },
  { value: "property-damage", label: "Equipment or property damage" },
  { value: "environmental-release", label: "Environmental release" },
];

export type HazardReportValues = {
  hazardType: string;
  location: string;
  /**
   * Feeds the AI draft only. `POST /api/v1/hazards` neither accepts nor stores
   * it, so it must not reach the create payload — persisting it is a backend
   * change and a migration.
   */
  potentialConsequence: string;
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
  },
  {
    // Above Description because the draft is composed from answers already
    // given. It is also what makes the draft possible at all: type and
    // location alone are below the backend's threshold, so without this every
    // hazard draft call would come back null.
    type: "select",
    name: "potentialConsequence",
    label: "What could happen if this isn't fixed?",
    colSpan: 12,
    placeholder: "Select potential consequence",
    options: POTENTIAL_CONSEQUENCE_OPTIONS,
    allowCustom: true,
    addCustomLabel: "Describe it yourself",
    addCustomPlaceholder: "e.g. Someone could be pinned against the racking",
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
    fileModule: "Hazard",
    // The create endpoint stores a single image URL.
    maxFiles: 1,
    placeholder: "Attach Photo Evidence",
    helperText: "Photos greatly improve resolution speed",
  },
];
