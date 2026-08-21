import type {
  FormSchema,
  FormValues,
  SelectOption,
} from "@/components/form-builder";
import type {
  TrainingLogRequestDto,
  TrainingMaterialRequestDto,
} from "@/dtos/req/hazcom-request.dto";
import { getFileMaxBytes, isLegacyPublicUrl } from "@/lib/files";

export const HAZCOM_TRAINING_FORM_ID = "hazcom-log-training-session";
export const HAZCOM_TRAINING_LOG_ROUTE = "/dashboard/hazcom/training";

const TRAINING_MAX_BYTES = getFileMaxBytes("HazCom");

export type BuildTrainingSessionSchemaArgs = Readonly<{
  chemicalOptions: readonly SelectOption[];
  siteId: number;
  siteName: string | null;
  usersSource: "site" | "dropdown";
}>;

/** Log Training Session — POST /api/hazcom/training. */
export function buildTrainingSessionSchema(
  args: BuildTrainingSessionSchemaArgs,
): FormSchema {
  return [
    {
      type: "select",
      name: "chemicalId",
      label: "Chemical",
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
      placeholder: "Start typing a name…",
      trailingHint: "Search people at your site.",
      usersSource: args.usersSource,
      siteId: args.siteId,
      siteName: args.siteName,
    },
    {
      type: "text",
      name: "trainerTitle",
      label: "Trainer Title",
      colSpan: 6,
      placeholder: "e.g. Safety Officer",
    },
    {
      type: "text",
      name: "chemicalsCovered",
      label: "Chemicals Covered",
      colSpan: 12,
      placeholder: "e.g. Acetone handling",
    },
    {
      type: "text",
      name: "attendees",
      label: "Attendees",
      colSpan: 12,
      placeholder: "e.g. Alice, Bob",
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
  chemicalsCovered: "",
  attendees: "",
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

export function toTrainingLogRequest(
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

  const trainer = String(values.trainer ?? "").trim();
  if (!trainer) {
    return { error: "Trainer is required" };
  }

  const materialUrls = Array.isArray(values.materials) ? values.materials : [];
  const materials: TrainingMaterialRequestDto[] = materialUrls.map(
    (fileUrl, index) => ({
      id: 0,
      fileUrl,
      fileName: fileNameFromStored(fileUrl, index),
      fileType: fileTypeFromStored(fileUrl),
    }),
  );

  const trainerTitle = String(values.trainerTitle ?? "").trim();
  const chemicalsCovered = String(values.chemicalsCovered ?? "").trim();
  const attendees = String(values.attendees ?? "").trim();
  const notes = String(values.notes ?? "").trim();

  return {
    chemicalId,
    sessionDate,
    trainer,
    trainerTitle: trainerTitle || null,
    chemicalsCovered: chemicalsCovered || null,
    attendees: attendees || null,
    materials: materials.length > 0 ? materials : null,
    notes: notes || null,
  };
}
