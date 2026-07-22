import type { SelectOption } from "@/components/form-builder";
import type { UserDropdownItemDto } from "@/dtos/res/user-response.dto";

/**
 * Turn GET /User/dropdown rows into select options. The id becomes the option
 * value (that is what the hazard payload's `assignedTo` expects) and the first
 * available name-ish field becomes the label.
 */
export function toAssigneeOptions(
  items: readonly UserDropdownItemDto[],
): SelectOption[] {
  return items.flatMap((item) => {
    const id = item.id ?? item.userId ?? item.value;
    if (id === undefined) return [];

    const label =
      item.name ?? item.fullName ?? item.userName ?? item.label ?? item.email;

    return [{ value: String(id), label: label ?? `User ${String(id)}` }];
  });
}

/**
 * Map of user id -> display name, for resolving the `userId` the near-miss and
 * hazard payloads carry instead of a reporter name.
 *
 * Every id-ish field is indexed, not just the first one present: a row may
 * carry both a table `id` and a `userId`, and only the latter matches the
 * `userId` on a report.
 */
export function toUserNameLookup(
  items: readonly UserDropdownItemDto[],
): ReadonlyMap<string, string> {
  const lookup = new Map<string, string>();
  for (const item of items) {
    const name =
      item.name ?? item.fullName ?? item.userName ?? item.label ?? item.email;
    if (!name) continue;

    for (const id of [item.userId, item.id, item.value]) {
      if (id !== undefined && id !== null) lookup.set(String(id), name);
    }
  }

  return lookup;
}

/** Display name for a user id, falling back to "User 3" when unknown. */
export function userNameFor(
  lookup: ReadonlyMap<string, string> | undefined,
  userId: number | string,
): string {
  const id = String(userId);
  return lookup?.get(id) ?? `User ${id}`;
}
