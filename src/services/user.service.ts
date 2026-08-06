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

/** GET /Auth/GetUserById/{id} — fallback when Org/me is unavailable. */
export async function getUserById(
  userId: number,
): Promise<AuthResponseDto | null> {
  const { data } = await http.get<ApiEnvelopeDto<unknown>>(
    `${AUTH_GET_USER_BY_ID_PATH}/${userId}`,
  );

  const session = normalizeSessionBootstrap(data);
  if (!hasSessionData(session)) {
    return null;
  }

  return mapSessionToUserDto(session!);
}
