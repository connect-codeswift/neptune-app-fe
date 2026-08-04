import type {
  FormSchema,
  FormValues,
  SelectOption,
  TileOption,
} from "@/components/form-builder";
import type { ObservationDetail } from "@/app/dashboard/bbs/bbs-data";

/** Safe / At-Risk rendered as the compact segmented control. */
export const EDIT_TYPE_OPTIONS: readonly TileOption[] = [
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
export const EDIT_LOCATION_OPTIONS: readonly SelectOption[] = [
  { value: "Plant A - Assembly", label: "Plant A - Assembly" },
  { value: "Plant A - Fabrication", label: "Plant A - Fabrication" },
  { value: "Plant B - Warehouse", label: "Plant B - Warehouse" },
  { value: "Plant B - Dispatch", label: "Plant B - Dispatch" },
];

/** Behavior categories offered in the edit dropdown. */
export const EDIT_CATEGORY_OPTIONS: readonly SelectOption[] = [
  { value: "PPE Usage", label: "PPE Usage" },
  { value: "Lifting Technique", label: "Lifting Technique" },
  { value: "Housekeeping", label: "Housekeeping" },
  { value: "Lockout/Tagout", label: "Lockout/Tagout" },
  { value: "Pedestrian / FPV", label: "Pedestrian / FPV" },
];

/** Observation Information card fields. */
export const observationInfoSchema: FormSchema = [
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
    options: EDIT_LOCATION_OPTIONS,
    placeholder: "Select a location",
  },
  {
    type: "select",
    name: "category",
    label: "Behavior Category",
    required: true,
    colSpan: 6,
    options: EDIT_CATEGORY_OPTIONS,
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
    colSpan: 12,
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
    // Photo field value is a string[] (Cloudinary URLs once uploaded; mock
    // attachments seed with the file name until real URLs are available).
    photos: detail.photos.map((photo) => photo.name),
  };
}

/** "April 22, 2025" -> "2025-04-22" for the native date input. */
export function toDateInputValue(dateLabel: string): string {
  const parsed = new Date(dateLabel);
  if (Number.isNaN(parsed.getTime())) return "";
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${String(year)}-${month}-${day}`;
}

/** "2:30 PM" -> "14:30" for the native time input; blank when unparseable. */
export function toTimeInputValue(timeLabel: string): string {
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
export function fromTimeInputValue(timeValue: string): string {
  const match = /^(\d{2}):(\d{2})$/.exec(timeValue);
  if (!match) return timeValue;
  let hours = Number(match[1]);
  const minutes = match[2];
  const meridiem = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${String(hours)}:${minutes} ${meridiem}`;
}
