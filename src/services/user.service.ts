import type { AuthResponseDto } from "@/dtos/res/auth-response.dto";
import type {
  GetUserDropdownResponseDto,
  GetUsersBySiteIdResponseDto,
  SiteUserDto,
  UserSummaryDto,
} from "@/dtos/res/user-response.dto";
import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";
import {
  normalizeSessionBootstrap,
  hasSessionData,
} from "@/lib/normalize-session";
import http from "@/lib/axios";

const USER_DROPDOWN_PATH = "/users/dropdown";
const USERS_PATH = "/users";
const SITES_PATH = "/sites";

function mapSessionToUserDto(
  session: NonNullable<ReturnType<typeof normalizeSessionBootstrap>>,
): AuthResponseDto {
  return {
    id: session.id ?? 0,
    fullName: session.fullName ?? "",
    email: session.email ?? "",
    isDemo: false,
    passwordHash: "",
    roleId: 0,
    organizationId: session.organizationId ?? 0,
    organizationName: session.organizationName ?? "",
    activatedModules: session.activatedModules ?? "",
    profileUrl: session.profileUrl,
    jobTitle: session.jobTitle,
    contactNo: session.contactNo,
    sites: [...session.sites],
  };
}

export async function getUserDropdown() {
  const { data } =
    await http.get<GetUserDropdownResponseDto>(USER_DROPDOWN_PATH);

  return data;
}

export type SiteUsersParams = Readonly<{
  /** Server-side substring match on name / email. Blank returns the first page. */
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}>;

/**
 * GET /api/v1/sites/{siteId}/users — the people who belong to one site.
 *
 * The endpoint filters server-side via `search`, so the affected-person picker
 * does not have to hold the whole roster in memory to be searchable.
 *
 * Deactivated accounts and unaccepted invitations are stripped here as well as
 * server-side: nothing in the app has a reason to offer a soft-deleted account,
 * and an outstanding invite has no `fullName` yet — it is collected when the
 * person accepts — so it would show up as a nameless row.
 */
export async function getUsersBySiteId(
  siteId: number,
  params: SiteUsersParams = {},
): Promise<readonly SiteUserDto[]> {
  const { data } = await http.get<GetUsersBySiteIdResponseDto>(
    `${SITES_PATH}/${String(siteId)}/users`,
    {
      params: {
        ...(params.search?.trim() ? { search: params.search.trim() } : {}),
        pageNumber: params.pageNumber ?? 1,
        pageSize: params.pageSize ?? 50,
      },
    },
  );

  return (data.dataModel?.data ?? []).filter(
    (user) => !user.isDrop && !user.isInvited,
  );
}

/**
 * The one field of a user record the incident form needs: their gender.
 *
 * Separate from `getUserById` on purpose. `GET /api/v1/users/{id}` returns
 * the entire row — `passwordHash`, `resetOtp`, `totpSecret` — and none of that
 * should be sitting in a React Query cache in the browser because a form wanted
 * one string. This reads the field and drops the rest on the floor.
 *
 * It exists at all only because `GET /api/v1/sites/{siteId}/users` doesn't
 * project `gender`, so the picker can't read it off the roster row it already
 * has. Once that endpoint carries it this whole call goes away — the caller
 * checks the row first and only falls back to here.
 */
export async function getUserGenderById(userId: number): Promise<string> {
  const { data } = await http.get<ApiEnvelopeDto<unknown>>(
    `${USERS_PATH}/${String(userId)}`,
  );

  const model = data.dataModel;
  if (typeof model !== "object" || model === null) {
    return "";
  }

  const record = model as Record<string, unknown>;
  for (const key of ["gender", "Gender", "sex", "Sex"]) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** ASP.NET serializes camelCase and PascalCase inconsistently, even in one payload. */
function readProp(
  source: Record<string, unknown>,
  ...keys: readonly string[]
): unknown {
  for (const key of keys) {
    if (source[key] !== undefined) {
      return source[key];
    }
  }
  return undefined;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * One person by id, for showing who someone is — a name and a photo.
 *
 * Distinct from {@link getUserById}, which normalizes the same endpoint into a
 * session shape for the Org/me fallback. This returns the person as a person.
 * The endpoint projects to a summary server-side, so no credential fields come
 * back with it.
 *
 * Returns `null` rather than throwing when the id matches nobody: the caller is
 * decorating a record that already exists, and a missing person should degrade
 * to initials, not fail the page.
 *
 * GET /api/v1/users/{id}
 */
export async function getUserSummaryById(
  userId: number,
): Promise<UserSummaryDto | null> {
  if (!Number.isFinite(userId) || userId <= 0) {
    return null;
  }

  try {
    const { data } = await http.get<ApiEnvelopeDto<unknown>>(
      `${USERS_PATH}/${String(userId)}`,
    );

    const model = data.dataModel;
    if (!isRecord(model)) {
      return null;
    }

    const id = Number(readProp(model, "id", "Id") ?? 0);
    const fullName = asString(readProp(model, "fullName", "FullName"));
    if (!Number.isFinite(id) || id <= 0) {
      return null;
    }

    return {
      id,
      fullName,
      email: asString(readProp(model, "email", "Email")),
      profileUrl: asString(readProp(model, "profileUrl", "ProfileUrl")) || null,
      jobTitle: asString(readProp(model, "jobTitle", "JobTitle")) || null,
      roleName: asString(readProp(model, "roleName", "RoleName")) || null,
    };
  } catch {
    return null;
  }
}

/** GET /api/v1/users/{id} — fallback when Org/me is unavailable. */
export async function getUserById(
  userId: number,
): Promise<AuthResponseDto | null> {
  try {
    const { data } = await http.get<ApiEnvelopeDto<unknown>>(
      `${USERS_PATH}/${String(userId)}`,
    );

    const session = normalizeSessionBootstrap(data);
    if (!hasSessionData(session)) {
      return null;
    }

    return mapSessionToUserDto(session!);
  } catch {
    return null;
  }
}
