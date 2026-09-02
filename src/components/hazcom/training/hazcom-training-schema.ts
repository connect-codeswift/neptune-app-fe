import type { ReactNode } from "react";
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
  /**
   * The trainer currently picked, as the form holds it. Kept out of the
   * Attendees roster: someone cannot attend the session they are running, and
   * saving them as both made the attendee count read one higher than the
   * people actually trained. Empty until a trainer is chosen, which excludes
   * nobody.
   */
  trainerId: string;
  /**
   * Rendered inside the Notes box. Proofread, paraphrase and draft — the notes
   * are the trainer's own prose, unlike the SDS statement fields, which are
   * quotations and are held to transcription tidying.
   */
  notesAssistant?: (control: {
    value: string;
    onChange: (next: string) => void;
  }) => ReactNode;
}>;

/** Schedule Training — POST /api/v1/hazcom/trainings. */
export function buildTrainingSessionSchema(
  args: BuildTrainingSessionSchemaArgs,
): FormSchema {
  return [
    {
      // A dropdown with removable chips rather than `chips`, whose always-visible
      // pills do not scale to a site's chemical inventory.
      type: "select-multi",
      name: "chemicalIds",
      label: "Chemicals Covered",
      required: true,
      colSpan: 6,
      placeholder: "Select chemicals…",
      options: args.chemicalOptions,
    },
    {
      type: "date",
      name: "sessionDate",
      label: "Session Date",
      required: true,
      colSpan: 6,
      /*
       * Deliberately unbounded in both directions.
       *
       * This carried `limit: "not-future"` on the reading that the screen only
       * logs a session already delivered. The API disagrees: a training is
       * created at `Scheduled`, and `PromoteDueTrainingsAsync` moves it to
       * `InProgress` once `SessionDate` has passed. Verified against the
       * running API — a future date stays `Scheduled`, a past date comes back
       * `InProgress` on the very next read. So the old bound meant no session
       * could ever rest in `Scheduled`, which left that status and the
       * "Start Before Schedule" action unreachable.
       *
       * Past dates stay allowed: recording a session that has already happened
       * is still valid, and the promotion above gives it the right status.
       */
    },
    {
      type: "person",
      name: "trainerId",
      label: "Trainer",
      required: true,
      colSpan: 6,
      displayNameField: "trainer",
      placeholder: "Select a trainer…",
      trailingHint: "Search people.",
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
      // Everyone at the site except whoever is running the session. This drops
      // the trainer from the dropdown *and* removes them if they were already
      // picked as an attendee before being made trainer.
      excludeUserIds: args.trainerId ? [args.trainerId] : [],
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
      assistant: args.notesAssistant,
    },
  ];
}

export const HAZCOM_TRAINING_INITIAL_VALUES: FormValues = {
  chemicalIds: [],
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

function toChemicalIds(values: FormValues): number[] {
  const raw = Array.isArray(values.chemicalIds) ? values.chemicalIds : [];

  return raw.map(Number).filter((id) => Number.isFinite(id) && id > 0);
}

function toAttendeeIds(values: FormValues): number[] {
  const raw = Array.isArray(values.attendees) ? values.attendees : [];

  return raw.map(Number).filter((id) => Number.isFinite(id) && id > 0);
}

/** Shared fields + validation for both create and update requests. */
function toTrainingLogFields(
  values: FormValues,
): TrainingLogRequestDto | { error: string } {
  const chemicalIds = toChemicalIds(values);
  if (chemicalIds.length === 0) {
    return { error: "At least one chemical is required" };
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
  // Belt and braces over the field's own exclusion: this is the last point
  // before the payload leaves, and it covers the update request too, so a
  // stale value carried in from anywhere cannot save the trainer as their own
  // attendee.
  const attendeeIds = toAttendeeIds(values).filter((id) => id !== trainerId);
  const materials = toMaterials(values);
  const notes = String(values.notes ?? "").trim();

  return {
    chemicalIds,
    // Kept in step with the first pick. The API derives this itself, but sending
    // it keeps the request readable against the older contract.
    chemicalId: chemicalIds[0],
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
