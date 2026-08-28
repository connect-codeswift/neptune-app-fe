import type {
  FormSchema,
  FormValues,
  SelectOption,
} from "@/components/form-builder";
import type {
  TrainingLogRequestDto,
  TrainingMaterialRequestDto,
  UpdateTrainingLogRequestDto,
} from "@/dtos/req/hazcom-request.dto";
import type { HazcomTrainingStatus } from "@/components/hazcom/shared";
import { getFileMaxBytes, isLegacyPublicUrl } from "@/lib/files";

export const HAZCOM_TRAINING_FORM_ID = "hazcom-schedule-training-session";
export const HAZCOM_TRAINING_LOG_ROUTE = "/dashboard/hazcom/training";

/** Allowed status values everywhere a training's status is read or written. */
export const HAZCOM_TRAINING_STATUSES: readonly HazcomTrainingStatus[] = [
  "Scheduled",
  "InProgress",
  "Completed",
  "Cancelled",
];

const TRAINING_MAX_BYTES = getFileMaxBytes("HazCom");

export type BuildTrainingSessionSchemaArgs = Readonly<{
  chemicalOptions: readonly SelectOption[];
  siteId: number;
  siteName: string | null;
  usersSource: "site" | "org";
}>;

/** Schedule Training — POST /api/v1/hazcom/trainings. */
export function buildTrainingSessionSchema(
  args: BuildTrainingSessionSchemaArgs,
): FormSchema {
  return [
    {
      type: "select",
      name: "chemicalId",
      label: "Chemical Covered",
      required: true,
      colSpan: 6,
      placeholder: "Select chemical…",
      options: args.chemicalOptions,
    },
    {
      type: "date",
      name: "sessionDate",
      label: "Session Date",
      required: true,
      colSpan: 6,
      // The screen logs a session that has been delivered, not one being booked.
      limit: "not-future",
    },
    {
      type: "person",
      name: "trainerId",
      label: "Trainer",
      required: true,
      colSpan: 6,
      displayNameField: "trainer",
      placeholder: "Select a trainer…",
      trailingHint: "Search people at your site.",
      usersSource: args.usersSource,
      siteId: args.siteId,
      siteName: args.siteName,
      // Must be a picked person, not free text — `allowFreeText` stays off.
    },
    {
      type: "text",
      name: "trainerTitle",
      label: "Trainer Title",
      colSpan: 6,
      placeholder: "e.g. Safety Officer",
    },
    {
      type: "person-multi",
      name: "attendees",
      label: "Attendees",
      colSpan: 12,
      placeholder: "Select attendees…",
      usersSource: args.usersSource,
      siteId: args.siteId,
      siteName: args.siteName,
      // The API takes `attendeeIds` (a real FK array), so picks are limited
      // to real users — `allowFreeText` stays off.
    },
    {
      type: "photo",
      name: "materials",
      label: "Training Materials",
      colSpan: 12,
      accept: "files",
      listVariant: "rows",
      storage: "cloudinary",
      maxBytes: TRAINING_MAX_BYTES,
      placeholder:
        "Drop files here or click to browse — PDF, DOC, PPT, image, or video",
      helperText:
        "Files upload to Cloudinary immediately. The secure URL is sent with the session.",
    },
    {
      type: "textarea",
      name: "notes",
      label: "Notes",
      colSpan: 12,
      rows: 4,
      placeholder: "Additional notes…",
    },
  ];
}

export const HAZCOM_TRAINING_INITIAL_VALUES: FormValues = {
  chemicalId: "",
  sessionDate: "",
  trainerId: "",
  trainer: "",
  trainerTitle: "",
  attendees: [],
  materials: [],
  notes: "",
};

function fileNameFromStored(fileUrl: string, index: number): string {
  if (isLegacyPublicUrl(fileUrl)) {
    try {
      const path = new URL(fileUrl).pathname;
      const last = decodeURIComponent(path.split("/").pop() ?? "");
      if (last) return last.split("?")[0] ?? last;
    } catch {
      /* fall through */
    }
  }

  return `training-material-${String(index + 1)}`;
}

function fileTypeFromStored(fileUrl: string): string {
  const name = fileUrl.toLowerCase();
  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(name) || name.includes("video")) {
    return "video";
  }
  if (/\.pdf(\?|$)/i.test(name)) return "pdf";
  if (/\.(jpe?g|png|gif|webp|heic)(\?|$)/i.test(name)) return "image";
  if (/\.(ppt|pptx)(\?|$)/i.test(name)) return "presentation";
  if (/\.(doc|docx)(\?|$)/i.test(name)) return "document";
  return "file";
}

function toIsoSessionDate(date: string): string | null {
  const trimmed = date.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;

  const parsed = new Date(`${trimmed}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function toMaterials(values: FormValues): TrainingMaterialRequestDto[] {
  const materialUrls = Array.isArray(values.materials) ? values.materials : [];

  return materialUrls.map((fileUrl, index) => ({
    id: 0,
    fileUrl,
    fileName: fileNameFromStored(fileUrl, index),
    fileType: fileTypeFromStored(fileUrl),
  }));
}

function toAttendeeIds(values: FormValues): number[] {
  const raw = Array.isArray(values.attendees) ? values.attendees : [];

  return raw.map(Number).filter((id) => Number.isFinite(id) && id > 0);
}

/** Shared fields + validation for both create and update requests. */
function toTrainingLogFields(
  values: FormValues,
): TrainingLogRequestDto | { error: string } {
  const chemicalId = Number(String(values.chemicalId ?? "").trim());
  if (!Number.isFinite(chemicalId) || chemicalId <= 0) {
    return { error: "Chemical is required" };
  }

  const sessionDate = toIsoSessionDate(String(values.sessionDate ?? ""));
  if (sessionDate === null) {
    return { error: "Session Date is required" };
  }

  // `trainerId` is populated by the person picker's `allowFreeText` guard —
  // a typed-but-unmatched name is cleared on blur, so a non-empty value here
  // is always a real picked user.
  const trainerId = Number(String(values.trainerId ?? "").trim());
  if (!Number.isFinite(trainerId) || trainerId <= 0) {
    return { error: "Trainer is required" };
  }

  const trainerTitle = String(values.trainerTitle ?? "").trim();
  const attendeeIds = toAttendeeIds(values);
  const materials = toMaterials(values);
  const notes = String(values.notes ?? "").trim();

  return {
    chemicalId,
    sessionDate,
    trainerId,
    trainerTitle: trainerTitle || null,
    // Chemical Covered (the select above) supersedes this free-text field —
    // no longer collected in the form, always sent null on create.
    chemicalsCovered: null,
    attendeeIds: attendeeIds.length > 0 ? attendeeIds : null,
    materials: materials.length > 0 ? materials : null,
    notes: notes || null,
  };
}

/** POST /api/v1/hazcom/trainings — schedule a new training. */
export function toTrainingLogRequest(
  values: FormValues,
): TrainingLogRequestDto | { error: string } {
  return toTrainingLogFields(values);
}

/** PUT /api/v1/hazcom/trainings/{id} — full edit, requires `status`. */
export function toUpdateTrainingLogRequest(
  values: FormValues,
): UpdateTrainingLogRequestDto | { error: string } {
  const fields = toTrainingLogFields(values);
  if ("error" in fields) {
    return fields;
  }

  const status = String(values.status ?? "").trim();
  if (!HAZCOM_TRAINING_STATUSES.includes(status as HazcomTrainingStatus)) {
    return { error: "Status is required" };
  }

  return { ...fields, status };
}
