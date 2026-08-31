import Papa from "papaparse";
import type { ChemicalRequestDto } from "@/dtos/req/hazcom-request.dto";
import {
  CHEMICAL_STATUS_OPTIONS,
  HAZARD_CATEGORY_OPTIONS,
  SIGNAL_WORDS,
} from "./chemical-options";

/**
 * The import template's columns, in order.
 *
 * Deliberately the export's header minus `ID`: a round trip — export, edit in a
 * spreadsheet, import back — is the obvious thing to try, and it should work.
 * The id is omitted because the backend assigns it and an import only ever
 * creates.
 */
export const IMPORT_COLUMNS = [
  "Chemical Name",
  "CAS #",
  "Location",
  "Quantity",
  "Hazard Class",
  "Signal Word",
  "Status",
  "Expiry Date",
] as const;

/** Matches the backend's per-request ceiling, so a too-large file is caught here. */
export const MAX_IMPORT_ROWS = 500;

export type ImportRow = Readonly<{
  /** 1-based row number as the author sees it in their spreadsheet, header excluded. */
  rowNumber: number;
  values: ChemicalRequestDto;
  /** Empty when the row is importable. */
  errors: readonly string[];
}>;

export type ParsedImport = Readonly<{
  rows: readonly ImportRow[];
  /** A problem with the file as a whole — nothing can be imported. */
  fatalError: string | null;
}>;

const HAZARD_CLASSES = HAZARD_CATEGORY_OPTIONS.map((option) => option.value)
  .filter((value) => value !== "")
  .map((value) => value.toLowerCase());

const STATUSES = CHEMICAL_STATUS_OPTIONS.map((option) =>
  option.value.toLowerCase(),
);

const SIGNALS = SIGNAL_WORDS.map((word) => word.toLowerCase());

function cell(row: Record<string, unknown>, column: string): string {
  const value = row[column];
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return formatDate(value);
  return String(value).trim();
}

/** `Date` → `yyyy-MM-dd`. Excel hands back real Dates; CSV hands back text. */
function formatDate(value: Date): string {
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${String(value.getFullYear())}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

/**
 * Title-cases a value the author may have typed in any case, against the list
 * the form offers. Returns null when it is not on the list.
 *
 * Matching case-insensitively is not a nicety: the columns behind these are
 * `citext`, so "active" and "Active" are already the same value to the
 * database, and rejecting one of them would be the import inventing a rule.
 */
function canonical(
  value: string,
  allowed: readonly string[],
  originals: readonly string[],
): string | null {
  const index = allowed.indexOf(value.toLowerCase());
  return index === -1 ? null : (originals[index] ?? null);
}

function validateRow(
  raw: Record<string, unknown>,
  rowNumber: number,
  seen: Map<string, number>,
): ImportRow {
  const errors: string[] = [];

  const name = cell(raw, "Chemical Name");
  const casNumber = cell(raw, "CAS #");
  const location = cell(raw, "Location");
  const quantity = cell(raw, "Quantity");
  const hazardRaw = cell(raw, "Hazard Class");
  const signalRaw = cell(raw, "Signal Word");
  const statusRaw = cell(raw, "Status");
  const expiry = cell(raw, "Expiry Date");

  if (!name) errors.push("Chemical Name is required");
  if (!location) errors.push("Location is required");
  if (!quantity) errors.push("Quantity is required");

  const hazardClass = hazardRaw
    ? canonical(
        hazardRaw,
        HAZARD_CLASSES,
        HAZARD_CATEGORY_OPTIONS.map((option) => option.value).filter(
          (value) => value !== "",
        ),
      )
    : null;
  if (!hazardRaw) {
    errors.push("Hazard Class is required");
  } else if (!hazardClass) {
    errors.push(`Hazard Class "${hazardRaw}" is not one of Category 1–5`);
  }

  const signalWord = signalRaw
    ? canonical(signalRaw, SIGNALS, [...SIGNAL_WORDS])
    : null;
  if (signalRaw && !signalWord) {
    errors.push(`Signal Word "${signalRaw}" must be Danger or Warning`);
  }

  const status = statusRaw
    ? canonical(
        statusRaw,
        STATUSES,
        CHEMICAL_STATUS_OPTIONS.map((option) => option.value),
      )
    : null;
  if (statusRaw && !status) {
    errors.push(`Status "${statusRaw}" must be Active or Inactive`);
  }

  let expiryDate: string | undefined;
  if (expiry) {
    const parsed = new Date(expiry);
    if (Number.isNaN(parsed.getTime())) {
      errors.push(`Expiry Date "${expiry}" is not a date`);
    } else {
      expiryDate = formatDate(parsed);
    }
  }

  // Duplicates *within the file* only. The register itself has no uniqueness
  // rule — no constraint, no application check — so flagging a clash with an
  // existing chemical would be the import enforcing something the product does
  // not. Two identical rows in one upload is still almost certainly a mistake.
  const key = `${name.toLowerCase()}|${casNumber.toLowerCase()}`;
  if (name) {
    const first = seen.get(key);
    if (first !== undefined) {
      errors.push(`Duplicate of row ${String(first)} in this file`);
    } else {
      seen.set(key, rowNumber);
    }
  }

  return {
    rowNumber,
    values: {
      chemi_Name: name,
      caS_Number: casNumber || undefined,
      hazardClass: hazardClass ?? hazardRaw,
      location,
      currentQuantity: quantity,
      ghsSignal: signalWord ?? undefined,
      status: status ?? undefined,
      expiryDate,
      isDraft: false,
    },
    errors,
  };
}

export function validateImportRows(
  records: readonly Record<string, unknown>[],
): ParsedImport {
  const meaningful = records.filter((record) =>
    Object.values(record).some(
      (value) => value !== null && value !== undefined && String(value).trim(),
    ),
  );

  if (meaningful.length === 0) {
    return { rows: [], fatalError: "That file has no rows in it." };
  }

  if (meaningful.length > MAX_IMPORT_ROWS) {
    return {
      rows: [],
      fatalError: `An import is limited to ${String(MAX_IMPORT_ROWS)} chemicals at a time — that file has ${String(meaningful.length)}.`,
    };
  }

  const present = Object.keys(meaningful[0] ?? {});
  if (!IMPORT_COLUMNS.some((column) => present.includes(column))) {
    return {
      rows: [],
      fatalError:
        "None of the expected columns were found. Download the template and use its header row.",
    };
  }

  const seen = new Map<string, number>();
  return {
    rows: meaningful.map((record, index) =>
      validateRow(record, index + 1, seen),
    ),
    fatalError: null,
  };
}

function parseCsv(file: File): Promise<ParsedImport> {
  return new Promise((resolve) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (result) => {
        resolve(validateImportRows(result.data));
      },
      error: () => {
        resolve({ rows: [], fatalError: "That file could not be read." });
      },
    });
  });
}

async function parseXlsx(file: File): Promise<ParsedImport> {
  // read-excel-file returns a matrix, not objects, so the header row is mapped
  // onto the rows below it here.
  // Imported here, not at the top: it is browser-only and the heavier of the
  // two parsers, so a CSV import never loads it and the row validation below
  // stays importable outside a browser.
  const { readSheet } = await import("read-excel-file/browser");
  const matrix = await readSheet(file);
  const [header, ...body] = matrix;
  if (!header) {
    return { rows: [], fatalError: "That file has no rows in it." };
  }

  const columns = header.map((value) => String(value ?? "").trim());
  return validateImportRows(
    body.map((row) =>
      Object.fromEntries(columns.map((column, index) => [column, row[index]])),
    ),
  );
}

export function isSpreadsheet(file: File): boolean {
  return /\.(csv|xlsx)$/i.test(file.name);
}

/** Reads a CSV or XLSX into validated rows. The file never leaves the browser. */
export async function parseChemicalImport(file: File): Promise<ParsedImport> {
  try {
    return file.name.toLowerCase().endsWith(".csv")
      ? await parseCsv(file)
      : await parseXlsx(file);
  } catch {
    return {
      rows: [],
      fatalError:
        "That file could not be read. Is it a valid CSV or Excel file?",
    };
  }
}

/** Downloads the blank template, so the header row is never guessed at. */
export function downloadImportTemplate(): void {
  const example = [
    "Acetone",
    "67-64-1",
    "Store A",
    "20 Liters",
    "Category 2",
    "Danger",
    "Active",
    "2027-01-31",
  ];

  const csv = [
    IMPORT_COLUMNS.join(","),
    example.map((value) => `"${value}"`).join(","),
  ].join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "chemical-import-template.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
