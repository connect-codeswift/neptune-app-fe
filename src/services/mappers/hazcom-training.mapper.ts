import type {
  HazcomTrainingMaterial,
  HazcomTrainingSession,
  HazcomTrainingStatus,
} from "@/components/hazcom/shared";
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

/**
 * `status` is server-assigned (the create body has no such field), so it is
 * read when present and inferred from the session date otherwise: a session
 * that has already happened reads as Completed.
 */
function toTrainingStatus(
  value: unknown,
  sessionDate: string,
): HazcomTrainingStatus {
  const lower = asString(value).trim().toLowerCase();
  if (lower === "completed") {
    return "Completed";
  }
  if (lower === "scheduled") {
    return "Scheduled";
  }

  if (sessionDate === "") {
    return "Scheduled";
  }
  const parsed = new Date(sessionDate);
  if (Number.isNaN(parsed.getTime())) {
    return "Scheduled";
  }

  return parsed.getTime() <= Date.now() ? "Completed" : "Scheduled";
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

function toTrainingMaterials(value: unknown): readonly HazcomTrainingMaterial[] {
  if (!Array.isArray(value)) {
    // Legacy single-link responses before materials[] shipped.
    const legacyLink = asString(value);
    if (legacyLink === "") {
      return [];
    }
    const fileName =
      legacyLink.split("/").pop()?.trim() || "Training material";
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

export function mapTrainingLogDtoToHazcomSession(
  raw: unknown,
): HazcomTrainingSession {
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

  return {
    id: asString(readProp(record, "id", "Id")),
    date,
    trainer: asString(readProp(record, "trainer", "Trainer")),
    // The form labels this "Topic / Training Title"; `trainerTitle` is the
    // only field on the wire it can land in.
    topic: asString(
      readProp(record, "trainerTitle", "TrainerTitle", "topic", "Topic"),
    ),
    chemicals: toStringList(
      readProp(record, "chemicalsCovered", "ChemicalsCovered", "chemicals"),
    ),
    attendees: toAttendeeCount(record),
    status: toTrainingStatus(readProp(record, "status", "Status"), date),
    materials: toTrainingMaterials(materialsRaw),
    notes: asString(readProp(record, "notes", "Notes")),
  };
}

export function mapTrainingLogDtosToHazcomSessions(
  rows: readonly unknown[],
): HazcomTrainingSession[] {
  return rows.map((row) => mapTrainingLogDtoToHazcomSession(row));
}
