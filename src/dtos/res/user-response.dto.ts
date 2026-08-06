import type { ApiEnvelopeDto, PagedDataDto } from "@/dtos/res/api-envelope.dto";

/**
 * One entry of GET /api/User/dropdown. The backend's exact key names aren't
 * pinned down yet, so the common spellings are all optional here and
 * `toAssigneeOptions` picks whichever is present.
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
};

/** Matches backend response for GET /api/User/dropdown. */
export type GetUserDropdownResponseDto = ApiEnvelopeDto<
  UserDropdownItemDto[] | null
>;

/**
 * One row of GET /api/Auth/GetUsersBySiteId/{siteId}. Unlike `/User/dropdown`
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
  organizationId?: number | null;
  siteId?: number | null;
  roleId?: number | null;
  roleName?: string | null;
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

/** Matches backend response for GET /api/Auth/GetUsersBySiteId/{siteId}. */
export type GetUsersBySiteIdResponseDto =
  ApiEnvelopeDto<PagedDataDto<SiteUserDto> | null>;
