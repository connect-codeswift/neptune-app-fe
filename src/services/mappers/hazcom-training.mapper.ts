import type {
  HazcomTrainingMaterial,
  HazcomTrainingSession,
  HazcomTrainingStatus,
} from "@/components/hazcom/shared";
import { formatRecordDisplayId } from "@/lib/format-record-id";
import {
  asLeadingNumber,
  asNumber,
  asString,
  isRecord,
  readProp,
  toIsoDate,
  toStringList,
} from "@/services/mappers/record-readers";

/**
 * Maps rows from the /api/hazcom/training endpoints onto the
 * `HazcomTrainingSession` shape the log table renders.
 */

const STATUS_BY_LOWER: Readonly<Record<string, HazcomTrainingStatus>> = {
  scheduled: "Scheduled",
  inprogress: "InProgress",
  "in-progress": "InProgress",
  "in progress": "InProgress",
  completed: "Completed",
  cancelled: "Cancelled",
  canceled: "Cancelled",
};

/**
 * `status` is server-assigned and always starts `"Scheduled"` on create.
 * Null/blank only happens for a legacy row written before the status field
 * existed, and still falls back to "No status found" rather than guessing.
 */
function toTrainingStatus(value: unknown): HazcomTrainingStatus | null {
  const lower = asString(value).trim().toLowerCase();
  return STATUS_BY_LOWER[lower] ?? null;
}

function mapTrainingMaterial(raw: unknown): HazcomTrainingMaterial | null {
  if (!isRecord(raw)) {
    return null;
  }

  const fileUrl = asString(readProp(raw, "fileUrl", "FileUrl"));
  const fileName = asString(readProp(raw, "fileName", "FileName"));
  if (fileUrl === "" || fileName === "") {
    return null;
  }

  const id = asNumber(readProp(raw, "id", "Id"));
  const fileType = asString(readProp(raw, "fileType", "FileType"));

  return {
    ...(id === null ? {} : { id }),
    fileUrl,
    fileName,
    ...(fileType === "" ? {} : { fileType }),
  };
}

function toTrainingMaterials(
  value: unknown,
): readonly HazcomTrainingMaterial[] {
  if (!Array.isArray(value)) {
    // Legacy single-link responses before materials[] shipped.
    const legacyLink = asString(value);
    if (legacyLink === "") {
      return [];
    }
    const fileName = legacyLink.split("/").pop()?.trim() || "Training material";
    return [{ fileUrl: legacyLink, fileName }];
  }

  return value
    .map((item) => mapTrainingMaterial(item))
    .filter((item): item is HazcomTrainingMaterial => item !== null);
}

function toAttendeeCount(record: Record<string, unknown>): number {
  const attendeesCount = asNumber(
    readProp(record, "attendeesCount", "AttendeesCount"),
  );
  if (attendeesCount !== null && attendeesCount >= 0) {
    return attendeesCount;
  }

  return asLeadingNumber(readProp(record, "attendees", "Attendees"));
}

function toAttendeeIds(value: unknown): readonly number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => asNumber(item)).filter((id) => id > 0);
}

function toOptionalId(value: unknown): number | null {
  const id = asNumber(value, Number.NaN);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function mapTrainingLogDtoToHazcomSession(raw: unknown): HazcomTrainingSession {
  const record = isRecord(raw) ? raw : {};
  const date = toIsoDate(
    readProp(record, "sessionDate", "SessionDate", "date", "Date"),
  );

  const materialsRaw = readProp(
    record,
    "materials",
    "Materials",
    "materialsLink",
    "MaterialsLink",
  );

  // `trainerName` (assigned user's FullName) is the current field; legacy
  // rows written before the FK existed fall back to the free-text `trainer`
  // string. "TBD" only when neither is present.
  const trainer =
    asString(readProp(record, "trainerName", "TrainerName")) ||
    asString(readProp(record, "trainer", "Trainer")) ||
    "TBD";

  return {
    id: formatRecordDisplayId("TR", asString(readProp(record, "id", "Id"))),
    date,
    chemicalId: toOptionalId(readProp(record, "chemicalId", "ChemicalId")),
    chemicalName: asString(readProp(record, "chemicalName", "ChemicalName")),
    trainerId: toOptionalId(readProp(record, "trainerId", "TrainerId")),
    trainer,
    // The form labels this "Topic / Training Title"; `trainerTitle` is the
    // only field on the wire it can land in.
    topic: asString(
      readProp(record, "trainerTitle", "TrainerTitle", "topic", "Topic"),
    ),
    chemicals: toStringList(
      readProp(record, "chemicalsCovered", "ChemicalsCovered", "chemicals"),
    ),
    attendeeIds: toAttendeeIds(readProp(record, "attendeeIds", "AttendeeIds")),
    attendeeNames: asString(readProp(record, "attendees", "Attendees")),
    attendees: toAttendeeCount(record),
    status: toTrainingStatus(readProp(record, "status", "Status")),
    materials: toTrainingMaterials(materialsRaw),
    notes: asString(readProp(record, "notes", "Notes")),
  };
}

export function mapTrainingLogDtosToHazcomSessions(
  rows: readonly unknown[],
): HazcomTrainingSession[] {
  return rows.map((row) => mapTrainingLogDtoToHazcomSession(row));
}
