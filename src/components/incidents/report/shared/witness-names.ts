import type { UserPickerValue } from "@/components/inputs/UserPickerInput";

/**
 * Witnesses are stored as one comma-separated string of names, which is the
 * shape `toReportIncidentRequest` sends. The picker works in
 * `{ userId, name }` entries, so the two formats meet here rather than inside
 * either of them — the payload keeps its shape and the picker stays reusable.
 *
 * Ids are lost in the round trip because the string has nowhere to keep them.
 * That is the existing contract, not a regression: the backend takes witness
 * names, not witness accounts.
 */
export function parseWitnessNames(value: string): string[] {
  const seen = new Set<string>();
  const names: string[] = [];

  for (const entry of value.split(",")) {
    const name = entry.trim();
    if (!name) {
      continue;
    }

    const key = name.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    names.push(name);
  }

  return names;
}

/** The stored string → picker entries. */
export function toWitnessValues(value: string): UserPickerValue[] {
  return parseWitnessNames(value).map((name) => ({ userId: "", name }));
}

/** Picker entries → the stored string. */
export function joinWitnessNames(entries: readonly UserPickerValue[]): string {
  return entries.map((entry) => entry.name).join(", ");
}
