import type { AuthResponseDto } from "@/dtos/res/auth-response.dto";
import type {
  GetUserDropdownResponseDto,
  GetUsersBySiteIdResponseDto,
  SiteUserDto,
} from "@/dtos/res/user-response.dto";
import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";
import {
  normalizeSessionBootstrap,
  hasSessionData,
} from "@/lib/normalize-session";
import http from "@/lib/axios";

const USER_DROPDOWN_PATH = "/User/dropdown";
const AUTH_GET_USER_BY_ID_PATH = "/Auth/GetUserById";
const AUTH_USERS_BY_SITE_PATH = "/Auth/GetUsersBySiteId";

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
 * GET /Auth/GetUsersBySiteId/{siteId} — the people who belong to one site.
 *
 * The endpoint filters server-side via `search`, so the affected-person picker
 * does not have to hold the whole roster in memory to be searchable. Dropped
 * users are stripped here rather than in the component: nothing in the app has
 * a reason to offer a soft-deleted account.
 */
export async function getUsersBySiteId(
  siteId: number,
  params: SiteUsersParams = {},
): Promise<readonly SiteUserDto[]> {
  const { data } = await http.get<GetUsersBySiteIdResponseDto>(
    `${AUTH_USERS_BY_SITE_PATH}/${String(siteId)}`,
    {
      params: {
        ...(params.search?.trim() ? { search: params.search.trim() } : {}),
        pageNumber: params.pageNumber ?? 1,
        pageSize: params.pageSize ?? 50,
      },
    },
  );

  return (data.dataModel?.data ?? []).filter((user) => !user.isDrop);
}

/**
 * The one field of a user record the incident form needs: their gender.
 *
 * Separate from `getUserById` on purpose. `GET /Auth/GetUserById/{id}` returns
 * the entire row — `passwordHash`, `resetOtp`, `totpSecret` — and none of that
 * should be sitting in a React Query cache in the browser because a form wanted
 * one string. This reads the field and drops the rest on the floor.
 *
 * It exists at all only because `GET /Auth/GetUsersBySiteId/{siteId}` doesn't
 * project `gender`, so the picker can't read it off the roster row it already
 * has. Once that endpoint carries it this whole call goes away — the caller
 * checks the row first and only falls back to here.
 */
export async function getUserGenderById(userId: number): Promise<string> {
  const { data } = await http.get<ApiEnvelopeDto<unknown>>(
    `${AUTH_GET_USER_BY_ID_PATH}/${String(userId)}`,
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

/** GET /Auth/GetUserById/{id} — fallback when Org/me is unavailable. */
export async function getUserById(userId: number): Promise<AuthResponseDto | null> {
  try {
    const { data } = await http.get<ApiEnvelopeDto<unknown>>(
      `${AUTH_GET_USER_BY_ID_PATH}/${userId}`,
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
