import type {
  FormSchema,
  FormValues,
  SelectOption,
  TileOption,
} from "@/components/form-builder";
import type { ObservationDetail } from "@/app/dashboard/bbs/bbs-data";

/** Safe / At-Risk rendered as the compact segmented control. */
const EDIT_TYPE_OPTIONS: readonly TileOption[] = [
  {
    value: "Safe",
    label: "Safe",
  },
  {
    value: "At-Risk",
    label: "At-Risk",
  },
];

/** Locations offered in the edit dropdown. */
const EDIT_LOCATION_OPTIONS: readonly SelectOption[] = [
  { value: "Plant A - Assembly", label: "Plant A - Assembly" },
  { value: "Plant A - Fabrication", label: "Plant A - Fabrication" },
  { value: "Plant B - Warehouse", label: "Plant B - Warehouse" },
  { value: "Plant B - Dispatch", label: "Plant B - Dispatch" },
];

/** Behavior categories offered in the edit dropdown (fallback when API empty). */
const EDIT_CATEGORY_OPTIONS: readonly SelectOption[] = [
  { value: "PPE Usage", label: "PPE Usage" },
  { value: "Lifting Technique", label: "Lifting Technique" },
  { value: "Housekeeping", label: "Housekeeping" },
  { value: "Lockout/Tagout", label: "Lockout/Tagout" },
  { value: "Pedestrian / FPV", label: "Pedestrian / FPV" },
];

function withCurrentOption(
  options: readonly SelectOption[],
  current: string,
): SelectOption[] {
  const trimmed = current.trim();
  if (!trimmed) return [...options];
  if (options.some((option) => option.value === trimmed)) return [...options];
  return [{ value: trimmed, label: trimmed }, ...options];
}

/** Observation Information card fields. */
export function buildObservationInfoSchema(args: {
  categoryOptions?: readonly SelectOption[];
  locationOptions?: readonly SelectOption[];
  currentCategory?: string;
  currentLocation?: string;
}): FormSchema {
  const categoryOptions = withCurrentOption(
    args.categoryOptions?.length
      ? args.categoryOptions
      : EDIT_CATEGORY_OPTIONS,
    args.currentCategory ?? "",
  );
  const locationOptions = withCurrentOption(
    args.locationOptions?.length
      ? args.locationOptions
      : EDIT_LOCATION_OPTIONS,
    args.currentLocation ?? "",
  );

  return [
    {
      type: "text",
      name: "observer",
      label: "Observer",
      required: true,
      colSpan: 6,
      placeholder: "Observer name",
    },
    {
      type: "date",
      name: "date",
      label: "Date",
      required: true,
      colSpan: 6,
    },
    {
      type: "time",
      name: "time",
      label: "Time",
      required: true,
      colSpan: 6,
    },
    {
      type: "select",
      name: "location",
      label: "Location",
      required: true,
      colSpan: 6,
      options: locationOptions,
      allowCustom: true,
      placeholder: "Select a location",
    },
    {
      type: "select",
      name: "category",
      label: "Behavior Category",
      required: true,
      colSpan: 6,
      options: categoryOptions,
      placeholder: "Select a category",
    },
    {
      type: "tiles",
      name: "type",
      label: "Observation Type",
      required: true,
      colSpan: 6,
      columns: 2,
      variant: "segmented",
      options: EDIT_TYPE_OPTIONS,
    },
  ];
}

/** Behavior Details card fields. */
export const observationDetailsSchema: FormSchema = [
  {
    type: "textarea",
    name: "observed",
    label: "What was observed",
    required: true,
    colSpan: 12,
    rows: 5,
    placeholder: "Describe what was observed...",
  },
];

/** Photo Evidence card — same photo field as the log observation flow. */
export const observationPhotosSchema: FormSchema = [
  {
    type: "photo",
    name: "photos",
    label: "Photo Evidence",
    required: true,
    colSpan: 12,
    fileModule: "Bbs",
    placeholder: "Tap to add photo",
    helperText: "Drop files here or click to upload",
  },
];

/** Detail fields -> FormBuilder value map, keeping the raw display strings. */
export function toObservationEditValues(detail: ObservationDetail): FormValues {
  return {
    observer: detail.observer,
    date: toDateInputValue(detail.date),
    time: toTimeInputValue(detail.time),
    location: detail.location,
    category: detail.category,
    type: detail.type,
    observed: detail.observed,
    // Prefer remote URLs so Save can send photoUrl; fall back to name for mocks.
    photos: detail.photos.map((photo) => photo.url ?? photo.name),
  };
}

/** "April 22, 2025" -> "2025-04-22" for the native date input. */
function toDateInputValue(dateLabel: string): string {
  const parsed = new Date(dateLabel);
  if (Number.isNaN(parsed.getTime())) return "";
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${String(year)}-${month}-${day}`;
}

/** "2:30 PM" -> "14:30" for the native time input; blank when unparseable. */
function toTimeInputValue(timeLabel: string): string {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(timeLabel.trim());
  if (!match) return "";
  let hours = Number(match[1]);
  const minutes = match[2];
  const meridiem = match[3].toUpperCase();
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

/** "14:30" -> "2:30 PM" for the detail display. */
