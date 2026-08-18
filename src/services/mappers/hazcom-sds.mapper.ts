import type {
  HazcomSdsRecord,
  HazcomSdsStatus,
  HazcomSignalWord,
  HazcomStatementCode,
} from "@/components/hazcom/shared";
import { formatRecordDisplayId } from "@/lib/format-record-id";
import {
  asString,
  isRecord,
  readProp,
  toIsoDate,
  toStringList,
} from "@/services/mappers/record-readers";
import { toHazcomPictograms } from "@/services/mappers/hazcom-chemical.mapper";

/**
 * Maps rows from the /api/hazcom/sds endpoints onto the `HazcomSdsRecord`
 * shape the library table and viewer render.
 */

function toSignalWord(value: unknown): HazcomSignalWord {
  return asString(value).trim().toLowerCase() === "danger"
    ? "Danger"
    : "Warning";
}

/**
 * How long a sheet stays current before the library flags it. OSHA sets no
 * fixed re-issue interval, so this is the common three-year review cycle —
 * adjust if the business uses a different one.
 */
const SDS_REVIEW_YEARS = 3;
const DUE_SOON_DAYS = 90;
const MS_PER_DAY = 86_400_000;

/**
 * `SafetyDataSheetDto` carries no status column, so compliance is derived
 * from how old the revision is: overdue past the review cycle, due soon
 * within 90 days of it. A sheet with no revision date can't be judged and
 * reads as Compliant rather than alarming the whole library.
 */
function toSdsStatus(revisedOn: string): HazcomSdsStatus {
  if (revisedOn === "") {
    return "Compliant";
  }

  const revised = new Date(revisedOn);
  if (Number.isNaN(revised.getTime())) {
    return "Compliant";
  }

  const dueOn = new Date(revised);
  dueOn.setFullYear(dueOn.getFullYear() + SDS_REVIEW_YEARS);

  const daysUntilDue = Math.floor((dueOn.getTime() - Date.now()) / MS_PER_DAY);

  if (daysUntilDue < 0) {
    return "Overdue";
  }
  return daysUntilDue <= DUE_SOON_DAYS ? "Due Soon" : "Compliant";
}

function mapSdsDtoToHazcomSdsRecord(raw: unknown): HazcomSdsRecord {
  const record = isRecord(raw) ? raw : {};
  const revisedOn = toIsoDate(
    readProp(record, "revisionDate", "RevisionDate", "revisedOn", "RevisedOn"),
  );

  return {
    id: formatRecordDisplayId("SDS", asString(readProp(record, "id", "Id"))),
    chemicalName: asString(
      readProp(
        record,
        "productName",
        "ProductName",
        "chemicalName",
        "ChemicalName",
      ),
    ),
    manufacturer: asString(readProp(record, "manufacturer", "Manufacturer")),
    casNumber: asString(
      readProp(record, "casNumber", "CasNumber", "caS_Number", "CAS_Number"),
    ),
    hazardClass: asString(readProp(record, "hazardClass", "HazardClass")),
    signalWord: toSignalWord(
      readProp(record, "signalWord", "SignalWord", "ghsSignal", "GhsSignal"),
    ),
    pictograms: toHazcomPictograms(
      readProp(record, "ghsPictograms", "GhsPictograms", "pictograms"),
    ),
    revisedOn,
    version: asString(readProp(record, "version", "Version")),
    status: toSdsStatus(revisedOn),
  };
}

export function mapSdsDtosToHazcomSdsRecords(
  rows: readonly unknown[],
): HazcomSdsRecord[] {
  return rows.map((row) => mapSdsDtoToHazcomSdsRecord(row));
}

/** Fields the table doesn't show but the viewer and label generator need. */
export type HazcomSdsDetail = Readonly<{
  record: HazcomSdsRecord;
  /** Cloudinary URL of the uploaded sheet, or "" when none was attached. */
  pdfUrl: string;
  /** Chemical this sheet is linked to, or null when it stands alone. */
  chemicalId: number | null;
  isDraft: boolean;
  /** Codes written on the record itself, before /statements is consulted. */
  hazardStatements: readonly string[];
  precautionaryStatements: readonly string[];
}>;

export function mapSdsDtoToHazcomSdsDetail(raw: unknown): HazcomSdsDetail {
  const record = isRecord(raw) ? raw : {};
  const chemicalId = Number(
    asString(readProp(record, "chemicalId", "ChemicalId")),
  );

  return {
    record: mapSdsDtoToHazcomSdsRecord(raw),
    pdfUrl: asString(readProp(record, "pdfUrl", "PdfUrl", "fileUrl")),
    chemicalId:
      Number.isFinite(chemicalId) && chemicalId > 0 ? chemicalId : null,
    isDraft: readProp(record, "isDraft", "IsDraft") === true,
    hazardStatements: toStringList(
      readProp(record, "hazardStatement", "HazardStatement"),
    ),
    precautionaryStatements: toStringList(
      readProp(record, "precautionaryStatement", "PrecautionaryStatement"),
    ),
  };
}

/**
 * Rows from the two GHS code libraries, `/hazard-hcode` and
 * `/precautionary-code`.
 *
 * Both are "dropdown entities, not linked to any table" server-side: a row is
 * an id plus one free string, under `codes` and `p_Codes` respectively. There
 * is no statement-text column on either, so `text` is always blank — whatever
 * descriptive wording exists lives inside the code string itself.
 */
export function mapGhsCodeDtos(
  rows: readonly unknown[],
): HazcomStatementCode[] {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .map((raw) => {
      if (!isRecord(raw)) {
        return { code: asString(raw), text: "" };
      }

      return {
        code: asString(
          readProp(raw, "codes", "Codes", "p_Codes", "P_Codes", "code", "Code"),
        ),
        text: asString(readProp(raw, "statement", "Statement", "text", "Text")),
      };
    })
    .filter((item) => item.code !== "");
}

/**
 * GET /api/hazcom/sds/{id}/statements.
 *
 * Despite the plural route this returns ONE projected row —
 * `{ id, hazardStatement, precautionaryStatement }` — whose two fields are the
 * comma-separated code strings stored on the sheet, not a list of code rows.
 * Splitting them back out is what gives the viewer its statement list.
 */
export function mapSdsStatementsDto(raw: unknown): HazcomStatementCode[] {
  const record = isRecord(raw) ? raw : {};

  return [
    ...toStringList(readProp(record, "hazardStatement", "HazardStatement")),
    ...toStringList(
      readProp(record, "precautionaryStatement", "PrecautionaryStatement"),
    ),
  ]
    .map((code) => ({ code, text: "" }))
    .filter((item) => item.code !== "");
}
