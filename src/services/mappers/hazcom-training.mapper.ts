import type {
  HazcomTrainingSession,
  HazcomTrainingStatus,
} from "@/components/hazcom/shared";
import {
  asLeadingNumber,
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

export function mapTrainingLogDtoToHazcomSession(
  raw: unknown,
): HazcomTrainingSession {
  const record = isRecord(raw) ? raw : {};
  const date = toIsoDate(
    readProp(record, "sessionDate", "SessionDate", "date", "Date"),
  );
  const materialsLink = asString(
    readProp(record, "materialsLink", "MaterialsLink"),
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
    // A string on the wire; the table counts heads.
    attendees: asLeadingNumber(readProp(record, "attendees", "Attendees")),
    status: toTrainingStatus(readProp(record, "status", "Status"), date),
    materialsLink: materialsLink === "" ? null : materialsLink,
    notes: asString(readProp(record, "notes", "Notes")),
  };
}

export function mapTrainingLogDtosToHazcomSessions(
  rows: readonly unknown[],
): HazcomTrainingSession[] {
  return rows.map((row) => mapTrainingLogDtoToHazcomSession(row));
}
