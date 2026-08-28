import type {
  HazcomChemical,
  HazcomChemicalStatus,
  HazcomPictogram,
  HazcomSignalWord,
  HazcomStatementCode,
} from "@/components/hazcom/shared";
import { formatRecordDisplayId } from "@/lib/format-record-id";
import {
  asNumber,
  asString,
  isRecord,
  readProp,
  toIsoDate,
  toStringList,
} from "@/services/mappers/record-readers";

/**
 * Maps rows from GET /api/hazcom/chemical onto the `HazcomChemical` shape the
 * inventory table renders.
 *
 * Write-side field names are known (see `ChemicalRequestDto`) but responses
 * are undocumented, so each value is read with the backend's spelling first
 * and older guesses as fallbacks.
 */

const PICTOGRAMS: readonly HazcomPictogram[] = [
  "Flammable",
  "Toxic",
  "Irritant",
  "Environmental",
  "Corrosive",
  "Oxidizer",
  "Explosive",
  "Compressed Gas",
  "Health Hazard",
];

/**
 * Backend pictogram labels are free text. Anything outside the nine GHS values
 * the UI can draw is dropped — an unmapped string would render as a blank icon.
 *
 * `ghsPictograms` is a single column on the wire, so the comma-separated form
 * the writer produces is accepted alongside a list.
 */
export function toHazcomPictograms(value: unknown): HazcomPictogram[] {
  const raw = Array.isArray(value)
    ? value.map((item) =>
        isRecord(item)
          ? asString(readProp(item, "name", "Name", "pictogram", "Pictogram"))
          : asString(item),
      )
    : typeof value === "string"
      ? value.split(",")
      : [];

  return raw
    .map((label) => {
      const lower = label.trim().toLowerCase();
      return PICTOGRAMS.find((known) => known.toLowerCase() === lower);
    })
    .filter((item): item is HazcomPictogram => item !== undefined);
}

export function toSignalWord(value: unknown): HazcomSignalWord {
  return asString(value).trim().toLowerCase() === "danger"
    ? "Danger"
    : "Warning";
}

function toChemicalStatus(value: unknown): HazcomChemicalStatus {
  const lower = asString(value).trim().toLowerCase();
  // Only an explicit inactive/archived marker greys a row out; an unrecognised
  // or absent status stays Active so rows don't all read as disabled.
  if (
    lower === "inactive" ||
    lower === "archived" ||
    lower === "disabled" ||
    lower === "false"
  ) {
    return "Inactive";
  }
  return "Active";
}

/**
 * The table prints quantity as one string ("15 Liters"). Accepts either a
 * combined field or a separate amount + unit pair.
 */
function toQuantity(raw: Record<string, unknown>): string {
  const combined = asString(
    readProp(raw, "currentQuantity", "CurrentQuantity", "quantity", "Quantity"),
  );
  if (combined !== "") {
    return combined;
  }

  const amount = asString(
    readProp(raw, "quantityAmount", "QuantityAmount", "amount", "Amount"),
  );
  const unit = asString(
    readProp(raw, "quantityUnit", "QuantityUnit", "unit", "Unit", "uom", "Uom"),
  );

  return [amount, unit].filter((part) => part !== "").join(" ");
}

/**
 * `GET /chemicals/{id}` joins in `hazardStatement`/`precautionaryStatement`
 * (singular) from the chemical's latest linked SDS — a single comma-separated
 * code string, exactly like the SDS entity's own fields, not a list of
 * pre-shaped code rows. `null` when the chemical has no SDS on file.
 */
function toStatementCodes(value: unknown): HazcomStatementCode[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (isRecord(item)) {
          return {
            code: asString(readProp(item, "code", "Code")),
            text: asString(
              readProp(item, "statement", "Statement", "text", "Text"),
            ),
          };
        }
        return { code: asString(item), text: "" };
      })
      .filter((item) => item.code !== "");
  }

  return toStringList(value).map((code) => ({ code, text: "" }));
}

export function mapChemicalDtoToHazcomChemical(raw: unknown): HazcomChemical {
  const record = isRecord(raw) ? raw : {};

  const sdsId = readProp(
    record,
    "sdsId",
    "SdsId",
    "sdsRecordId",
    "SdsRecordId",
  );

  return {
    // Prefixed display id (`CHEM-12`) is also the detail/edit route segment.
    id: formatRecordDisplayId("CHEM", asString(readProp(record, "id", "Id"))),
    // `chemi_Name` / `caS_Number` / `ghs*` are the backend's own spellings
    // (see `ChemicalRequestDto`); the rest stay as defensive fallbacks.
    name: asString(
      readProp(
        record,
        "chemi_Name",
        "Chemi_Name",
        "name",
        "Name",
        "chemicalName",
        "ChemicalName",
      ),
    ),
    casNumber: asString(
      readProp(
        record,
        "caS_Number",
        "CAS_Number",
        "casNumber",
        "CasNumber",
        "cas",
        "Cas",
      ),
    ),
    location: asString(readProp(record, "location", "Location")),
    disposeLocation:
      asString(readProp(record, "disposeLocation", "DisposeLocation")) || null,
    quantity: toQuantity(record),
    hazardClass: asString(
      readProp(record, "hazardClass", "HazardClass", "hazardClassification"),
    ),
    pictograms: toHazcomPictograms(
      readProp(
        record,
        "ghsPictograms",
        "GhsPictograms",
        "pictograms",
        "Pictograms",
      ),
    ),
    signalWord: toSignalWord(
      readProp(record, "ghsSignal", "GhsSignal", "signalWord", "SignalWord"),
    ),
    status: toChemicalStatus(readProp(record, "status", "Status")),
    sdsRecordId:
      sdsId === undefined || asString(sdsId) === ""
        ? null
        : formatRecordDisplayId("SDS", asString(sdsId)),
    sdsFileName:
      asString(
        readProp(
          record,
          "linkToSdsRecord",
          "LinkToSdsRecord",
          "sdsFileName",
          "SdsFileName",
          "fileName",
        ),
      ) || null,
    storageNotes: asString(
      readProp(record, "storageNotes", "StorageNotes", "notes", "Notes"),
    ),
    // Date only: the column is a DateTime, but an expiry is a day, and the
    // time half would otherwise shift it across midnight on display.
    expiryDate:
      asString(readProp(record, "expiryDate", "ExpiryDate")).slice(0, 10) ||
      null,
    hazardStatements: toStatementCodes(
      readProp(record, "hazardStatement", "HazardStatement"),
    ),
    precautionaryStatements: toStatementCodes(
      readProp(record, "precautionaryStatement", "PrecautionaryStatement"),
    ),
    addedOn: toIsoDate(
      readProp(record, "createdAt", "CreatedAt", "createdDate", "addedOn"),
    ),
  };
}

export function mapChemicalDtosToHazcomChemicals(
  rows: readonly unknown[],
): HazcomChemical[] {
  return rows.map((row) => mapChemicalDtoToHazcomChemical(row));
}

/** One entry of GET /api/hazcom/chemical/names — the picker lookup list. */
export type HazcomChemicalName = Readonly<{
  id: number;
  name: string;
}>;

/**
 * The lookup list is what turns a chemical *name* chosen in a form into the
 * `chemicalId` the SDS and risk-assessment endpoints require.
 */
export function mapChemicalNameDtos(
  rows: readonly unknown[],
): HazcomChemicalName[] {
  return (
    rows
      .map((raw) => {
        const record = isRecord(raw) ? raw : {};

        return {
          id: asNumber(readProp(record, "id", "Id")),
          name: asString(
            readProp(
              record,
              "chemi_Name",
              "Chemi_Name",
              "name",
              "Name",
              "chemicalName",
              "ChemicalName",
            ),
          ),
        };
      })
      // An entry with no usable id is worse than no entry: picking it would
      // post `chemicalId: 0` and the write would fail server-side.
      .filter((item) => item.id > 0 && item.name !== "")
  );
}
