import type { ApiEnvelopeDto, PagedDataDto } from "@/dtos/res/api-envelope.dto";

/**
 * One entry of GET /api/v1/users/dropdown. The backend's exact key names aren't
 * pinned down yet, so the common spellings are all optional here and
 * `fromDropdownItem` in `components/inputs/user-option.ts` picks whichever is
 * present.
 */
export type UserDropdownItemDto = {
  id?: number | string;
  subCompId?: number | string;
  userId?: number | string;
  value?: number | string;
  name?: string;
  fullName?: string;
  userName?: string;
  label?: string;
  email?: string;
  profileUrl?: string;
};

/** Matches backend response for GET /api/v1/users/dropdown. */
export type GetUserDropdownResponseDto = ApiEnvelopeDto<
  UserDropdownItemDto[] | null
>;

/**
 * One row of GET /api/v1/sites/{siteId}/users. Unlike `/User/dropdown`
 * above, this shape is confirmed against staging, so the keys are not guesses:
 * `{ id, fullName, email, organizationId, siteId, roleId, roleName, isInvited,
 * isDrop, createdAt }`.
 *
 * Everything but `id` stays optional anyway — a row missing a name is still a
 * usable row, and the picker falls back to the email.
 */
export type SiteUserDto = {
  id: number;
  fullName?: string | null;
  email?: string | null;
  /**
   * The person's profile photo, when their record carries one. Same value the
   * profile screen uploads via POST /users/me/avatar — a stored file id, a
   * legacy public URL, or a plain remote URL, so render it through
   * `UserAvatar` rather than dropping it straight into an `<img>`.
   *
   * Absent from `GET /api/v1/sites/{siteId}/users` until the backend adds
   * `ProfileUrl` to that projection (it is on the `User` entity and already
   * served by `GET /api/Auth/GetUserById/{id}`). Optional so the pickers fall
   * back to initials rather than breaking while that ships.
   */
  profileUrl?: string | null;
  organizationId?: number | null;
  siteId?: number | null;
  roleId?: number | null;
  roleName?: string | null;
  /**
   * True while an invitation is outstanding; cleared when the person sets their
   * password. Such a row has no `fullName` yet, so it is filtered out of the pickers.
   */
  isInvited?: boolean;
  /** Soft-deleted users. Filtered out of the picker. */
  isDrop?: boolean;
  createdAt?: string | null;
  /**
   * Not served yet — as of 2026-08-06 no user endpoint returns a gender and
   * swagger has no such field anywhere. Declared ahead of the backend adding
   * it so the affected-person picker can fill the incident's Gender from the
   * person's own record instead of asking twice. Read it through
   * `readUserGender`, not directly: the casing isn't settled.
   */
  gender?: string | null;
};

/**
 * Pulls a gender off a user row whatever the backend ends up calling it.
 * Returns the raw string; `normalizeGender` is what maps it onto an option.
 */
export function readUserGender(user: SiteUserDto): string {
  const record = user as unknown as Record<string, unknown>;

  for (const key of ["gender", "Gender", "sex", "Sex"]) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

/**
 * Pulls a profile photo off a user row whatever the backend spells it. Mirrors
 * `readUserGender`: ASP.NET serializes camelCase and PascalCase inconsistently,
 * sometimes within one payload.
 */
export function readUserProfileUrl(user: SiteUserDto): string {
  const record = user as unknown as Record<string, unknown>;

  for (const key of ["profileUrl", "ProfileUrl", "profileURL"]) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

/** Matches backend response for GET /api/v1/sites/{siteId}/users. */
export type GetUsersBySiteIdResponseDto =
  ApiEnvelopeDto<PagedDataDto<SiteUserDto> | null>;
