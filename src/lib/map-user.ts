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
