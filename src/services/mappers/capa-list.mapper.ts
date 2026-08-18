import type { MyActionItemDto } from "@/dtos/res/ehs-command-center-response.dto";
import { formatRecordDisplayId } from "@/lib/format-record-id";

/** One row of the CAPA register table. */
export type CapaListRow = Readonly<{
  id: string;
  code: string;
  title: string;
  capaType: string;
  priority: string;
  owner: string;
  site: string;
  status: string;
  /** Raw due date, kept for sorting once a real payload exists. */
  dueDate: string | null;
  /** "3d" / "Overdue" / "—" */
  dueLabel: string;
  /** Completion 0–100, or null when the payload doesn't carry one. */
  progressPercent: number | null;
}>;

const EM_DASH = "—";

function readProp(record: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (key in record && record[key] !== undefined && record[key] !== null) {
      return record[key];
    }
  }
  return undefined;
}

function asString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim() !== "") {
    return value.trim();
  }
  if (typeof value === "number") {
    return String(value);
  }
  return undefined;
}

function asPercent(value: unknown): number | null {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(numeric)) {
    return null;
  }

  return Math.min(100, Math.max(0, Math.round(numeric)));
}

/** Days until `dueDate`, rendered the same way the My Actions card does. */
function formatDueLabel(rawDue: unknown): string {
  const dueString = asString(rawDue);
  if (!dueString) {
    return EM_DASH;
  }

  const due = new Date(dueString);
  if (Number.isNaN(due.getTime())) {
    return EM_DASH;
  }

  const days = Math.ceil((due.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  if (days < 0) {
    return "Overdue";
  }

  return `${String(days)}d`;
}

/**
 * Maps one `actions[]` entry from GET /api/EHSCommandCenter/GetMyActions into a
 * register row.
 *
 * That endpoint has only ever returned an empty array, and its field names are
 * unconfirmed — see the note on `MyActionItemDto`. So every field is read
 * through a candidate list covering both casings and the CAPA-style naming used
 * elsewhere in the app, and falls back to an em dash rather than throwing.
 * Narrow these key lists once a populated response exists.
 */
function mapActionToCapaRow(
  raw: MyActionItemDto,
  index: number,
): CapaListRow {
  const id =
    asString(readProp(raw, "id", "Id", "capaId", "CapaId")) ??
    String(index);

  const code = formatRecordDisplayId("CAPA", id);

  return {
    id,
    code,
    title:
      asString(
        readProp(raw, "title", "Title", "description", "Description", "name"),
      ) ?? "Untitled action",
    capaType:
      asString(
        readProp(
          raw,
          "capaType",
          "CapaType",
          "actionType",
          "ActionType",
          "category",
          "Category",
          "type",
          "Type",
        ),
      ) ?? EM_DASH,
    priority:
      asString(readProp(raw, "priority", "Priority", "severity", "Severity")) ??
      EM_DASH,
    owner:
      asString(
        readProp(
          raw,
          "assignee",
          "Assignee",
          "assignedTo",
          "AssignedTo",
          "ownerName",
          "OwnerName",
          "owner",
          "Owner",
        ),
      ) ?? EM_DASH,
    site:
      asString(
        readProp(raw, "site", "Site", "plant", "Plant", "location", "Location"),
      ) ?? EM_DASH,
    status:
      asString(readProp(raw, "status", "Status", "state", "State")) ?? "Open",
    dueDate:
      asString(readProp(raw, "dueDate", "DueDate", "dueAt", "DueAt", "due")) ??
      null,
    dueLabel: formatDueLabel(
      readProp(raw, "dueDate", "DueDate", "dueAt", "DueAt", "due", "Due"),
    ),
    progressPercent: asPercent(
      readProp(raw, "progressPercent", "ProgressPercent", "progress"),
    ),
  };
}

export function mapActionsToCapaRows(
  actions: readonly MyActionItemDto[] | null | undefined,
): readonly CapaListRow[] {
  if (!actions) {
    return [];
  }

  return actions.map((action, index) => mapActionToCapaRow(action, index));
}

/** Counts driving the KPI row above the table. */
export function summariseCapaRows(rows: readonly CapaListRow[]) {
  const overdue = rows.filter((row) => row.dueLabel === "Overdue").length;
  const closed = rows.filter((row) =>
    ["closed", "completed", "done"].includes(row.status.toLowerCase()),
  ).length;

  return {
    total: rows.length,
    open: rows.length - closed,
    overdue,
    closed,
  };
}
