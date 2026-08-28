import {
  readUserGender,
  readUserProfileUrl,
  type SiteUserDto,
  type UserDropdownItemDto,
} from "@/dtos/res/user-response.dto";

/**
 * One person, however the backend happened to spell them.
 *
 * Two endpoints answer "who can I pick here" and they disagree about almost
 * every key: `GET /api/v1/sites/{siteId}/users` returns a confirmed
 * `SiteUserDto`, while `GET /api/v1/users/dropdown` returns a `UserDropdownItemDto`
 * with four possible spellings of the id and five of the name. Normalizing that
 * used to happen in four places — the report person picker, the witnesses
 * picker, the LOTO personnel picker and `lib/map-user` — which is why the same
 * person could render as "Jane Doe" on one screen and "User 42" on the next.
 *
 * Every field is a plain string so a consumer never has to null-check before
 * rendering. `id` is the exception worth knowing: it is always non-empty here,
 * because `""` is reserved to mean "this name was typed, not picked".
 */
export type UserOption = Readonly<{
  id: string;
  name: string;
  email: string;
  roleName: string;
  profileUrl: string;
  /** From the person's own record; `""` until the backend serves it. */
  gender: string;
  /** Roster-only flags. Always `false` for org-dropdown rows, which omit them. */
  isInvited: boolean;
  isDrop: boolean;
}>;

function firstNonEmpty(
  ...values: readonly (string | null | undefined)[]
): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return "";
}

function toIdString(value: number | string | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }

  const id = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(id) || id <= 0) {
    return "";
  }

  return String(Math.trunc(id));
}

/** A site roster row → `UserOption`. `null` when the row has no usable id. */
export function fromSiteUser(user: SiteUserDto): UserOption | null {
  const id = toIdString(user.id);
  if (!id) {
    return null;
  }

  return {
    id,
    name: firstNonEmpty(user.fullName, user.email) || `User ${id}`,
    email: firstNonEmpty(user.email),
    roleName: firstNonEmpty(user.roleName).replaceAll("_", " "),
    profileUrl: readUserProfileUrl(user),
    gender: readUserGender(user),
    isInvited: user.isInvited ?? false,
    isDrop: user.isDrop ?? false,
  };
}

/**
 * An org dropdown row → `UserOption`.
 *
 * `id` is tried before `userId` before `value` because a row may carry both a
 * table id and a user id, and only the latter matches what a payload's
 * assignee field expects — the same order `toUserNameLookup` indexes in.
 */
export function fromDropdownItem(item: UserDropdownItemDto): UserOption | null {
  const id = firstNonEmpty(
    toIdString(item.id),
    toIdString(item.userId),
    toIdString(item.value),
  );
  if (!id) {
    return null;
  }

  return {
    id,
    name:
      firstNonEmpty(
        item.name,
        item.fullName,
        item.userName,
        item.label,
        item.email,
      ) || `User ${id}`,
    email: firstNonEmpty(item.email),
    roleName: "",
    profileUrl: firstNonEmpty(item.profileUrl),
    gender: "",
    isInvited: false,
    isDrop: false,
  };
}

/** The muted second line of an option row: "jane@acme.com · Site Manager". */
export function secondaryLineFor(user: UserOption): string {
  return [user.email, user.roleName].filter(Boolean).join(" · ");
}

/** Client-side search, for the org list that loads once instead of per term. */
export function matchesQuery(user: UserOption, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return true;
  }

  return (
    user.name.toLowerCase().includes(needle) ||
    user.email.toLowerCase().includes(needle)
  );
}

/** Case-insensitive name comparison — the test both pickers use for free text. */
export function isSameName(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
