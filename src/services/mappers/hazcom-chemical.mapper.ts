import type {
  HazcomChemical,
  HazcomChemicalStatus,
  HazcomPictogram,
  HazcomSignalWord,
  HazcomStatementCode,
} from "@/components/hazcom/shared";

/**
 * Maps rows from GET /api/hazcom/chemical onto the `HazcomChemical` shape the
 * inventory table renders.
 *
 * The Swagger `components/schemas` section was not supplied with
 * `api/hazcom.md`, so field names here are read defensively — several spellings
 * per value, every one optional. A key the backend doesn't send degrades to a
 * blank cell instead of throwing. Once the real schema lands, this can collapse
 * to a direct field-to-field map.
 */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readProp(record: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (key in record && record[key] !== undefined && record[key] !== null) {
      return record[key];
    }
  }
  return undefined;
}

function asString(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
}

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
function toPictograms(value: unknown): HazcomPictogram[] {
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

function toSignalWord(value: unknown): HazcomSignalWord {
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

/** Statement lists may arrive as objects, as bare codes, or not at all. */
function toStatementCodes(value: unknown): HazcomStatementCode[] {
  if (!Array.isArray(value)) {
    return [];
  }

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

/** ISO date portion only — the table shows dates, never times. */
function toIsoDate(value: unknown): string {
  const raw = asString(value);
  if (raw === "") {
    return "";
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return raw;
  }
  return parsed.toISOString().slice(0, 10);
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
    // `id` doubles as the row key and the detail/edit route segment, so it
    // always falls back to a string even when the backend omits it.
    id: asString(readProp(record, "id", "Id")),
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
    quantity: toQuantity(record),
    hazardClass: asString(
      readProp(record, "hazardClass", "HazardClass", "hazardClassification"),
    ),
    pictograms: toPictograms(
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
    sdsRecordId: sdsId === undefined ? null : asString(sdsId),
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
    hazardStatements: toStatementCodes(
      readProp(record, "hazardStatements", "HazardStatements", "hazardHCodes"),
    ),
    precautionaryStatements: toStatementCodes(
      readProp(
        record,
        "precautionaryStatements",
        "PrecautionaryStatements",
        "precautionaryCodes",
      ),
    ),
    addedOn: toIsoDate(
      readProp(record, "createdDate", "CreatedDate", "createdAt", "addedOn"),
    ),
  };
}

export function mapChemicalDtosToHazcomChemicals(
  rows: readonly unknown[],
): HazcomChemical[] {
  return rows.map((row) => mapChemicalDtoToHazcomChemical(row));
}
