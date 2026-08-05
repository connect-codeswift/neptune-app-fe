import type { SessionBootstrapDto } from "@/dtos/res/session-response.dto";
import { getAuthContext } from "@/lib/auth-context";
import { getCurrentUser } from "@/lib/current-user";
import { normalizeSessionBootstrap, hasSessionData } from "@/lib/normalize-session";
import http from "@/lib/axios";
import { getUserById } from "@/services/user.service";

const AUTH_ORG_ME_PATH = "/Auth/Org/me";

function mapUserByIdFallback(
  user: NonNullable<Awaited<ReturnType<typeof getUserById>>>,
): SessionBootstrapDto {
  const currentUser = getCurrentUser();
  const authContext = getAuthContext();

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: currentUser.role,
    organizationId: user.organizationId,
    organizationName: user.organizationName,
    siteId: authContext?.siteId ?? null,
    siteName: authContext?.siteName ?? null,
    activatedModules: user.activatedModules,
    permissions: [],
    sites: user.sites,
  };
}

/**
 * Primary session bootstrap: GET /Auth/Org/me.
 * Falls back to GET /Auth/GetUserById/{id} when Org/me is unavailable.
 */
export async function getOrgSession(): Promise<SessionBootstrapDto | null> {
  try {
    const { data } = await http.get<unknown>(AUTH_ORG_ME_PATH);
    const session = normalizeSessionBootstrap(data);

    if (hasSessionData(session)) {
      return session;
    }
  } catch {
    // Fall through to GetUserById when Org/me fails or returns an unexpected shape.
  }

  const authContext = getAuthContext();
  const userId = authContext?.userId ?? 0;

  if (userId <= 0) {
    return null;
  }

  const user = await getUserById(userId);
  return user ? mapUserByIdFallback(user) : null;
}
