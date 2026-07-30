import type { ComplianceDeadlinesItem } from "@/components/ComplianceDeadlinesCard";
import type { MyActionItemDto } from "@/dtos/res/ehs-command-center-response.dto";

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

function formatDueBadge(rawDue: unknown): string {
  const dueString = asString(rawDue);
  if (!dueString) {
    return "—";
  }
  const due = new Date(dueString);
  if (Number.isNaN(due.getTime())) {
    return "—";
  }
  const days = Math.ceil((due.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  if (days < 0) {
    return "Overdue";
  }
  return `${String(days)}d`;
}

/**
 * Maps one `actions[]` entry from GET /api/EHSCommandCenter/GetMyActions.
 * The endpoint has only ever returned an empty array so far, so these key
 * candidates are unconfirmed guesses (mirroring CAPA-style naming used
 * elsewhere) — verify and adjust once a populated response is available.
 */
export function mapMyActionToItem(raw: MyActionItemDto): ComplianceDeadlinesItem {
  const title =
    asString(readProp(raw, "title", "Title", "name", "Name")) ??
    "Untitled action";
  const code = asString(
    readProp(raw, "code", "Code", "referenceCode", "ReferenceCode", "actionCode", "ActionCode"),
  );
  const site = asString(
    readProp(raw, "site", "Site", "plant", "Plant", "location", "Location"),
  );
  const category = asString(
    readProp(raw, "category", "Category", "type", "Type", "actionType", "ActionType"),
  );
  const assignee = asString(
    readProp(raw, "assignee", "Assignee", "assignedTo", "AssignedTo", "ownerName", "OwnerName"),
  );

  const subtitle =
    [code, site, category ?? assignee].filter(Boolean).join(" · ") || "—";

  const badge = formatDueBadge(
    readProp(raw, "dueDate", "DueDate", "dueAt", "DueAt", "due", "Due"),
  );

  return { title, subtitle, badge };
}

export function mapMyActionsToItems(
  actions: readonly MyActionItemDto[] | null | undefined,
): readonly ComplianceDeadlinesItem[] {
  if (!actions) {
    return [];
  }
  return actions.map(mapMyActionToItem);
}
