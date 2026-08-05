import type { AuthResponseDto } from "@/dtos/res/auth-response.dto";
import type { GetUserDropdownResponseDto } from "@/dtos/res/user-response.dto";
import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";
import { normalizeSessionBootstrap, hasSessionData } from "@/lib/normalize-session";
import http from "@/lib/axios";

const USER_DROPDOWN_PATH = "/User/dropdown";
const AUTH_GET_USER_BY_ID_PATH = "/Auth/GetUserById";

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
    sites: [...session.sites],
  };
}

export async function getUserDropdown() {
  const { data } =
    await http.get<GetUserDropdownResponseDto>(USER_DROPDOWN_PATH);

  return data;
}

/** GET /Auth/GetUserById/{id} — fallback when Org/me is unavailable. */
export async function getUserById(userId: number): Promise<AuthResponseDto | null> {
  const { data } = await http.get<ApiEnvelopeDto<unknown>>(
    `${AUTH_GET_USER_BY_ID_PATH}/${userId}`,
  );

  const session = normalizeSessionBootstrap(data);
  if (!hasSessionData(session)) {
    return null;
  }

  return mapSessionToUserDto(session!);
}
