import type { SessionBootstrapDto } from "@/dtos/res/session-response.dto";
import { getAuthContext } from "@/lib/auth-context";
import { getCurrentUser } from "@/lib/current-user";
import { getOrgMe } from "@/services/org.service";
import { getUserById } from "@/services/user.service";

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
    jobTitle: user.jobTitle ?? null,
    contactNo: user.contactNo ?? null,
    // GetUserById deliberately does not expose MFA state (UserSummaryDto omits it), so this
    // fallback cannot know. False is the safe default: the Security screen treats an unknown
    // state as "off" and offers enrolment, which the API rejects if it is already on.
    mfaEnabled: false,
    mfaPromptDismissed: false,
    organizationId: user.organizationId,
    organizationName: user.organizationName,
    siteId: authContext?.siteId ?? null,
    siteName: authContext?.siteName ?? null,
    profileUrl: user.profileUrl ?? null,
    activatedModules: user.activatedModules,
    permissions: [],
    sites: user.sites,
    accessExpiresAt: null,
    daysRemaining: null,
    maxSeats: null,
    maxSites: null,
    seatsUsed: 0,
    sitesUsed: 0,
    seatsAvailable: null,
    sitesAvailable: null,
    atSeatLimit: false,
    atSiteLimit: false,
  };
}

/**
 * Primary session bootstrap: GET /api/v1/organizations/me.
 * Falls back to GET /api/v1/users/{id}/{id} when Org/me is unavailable.
 */
export async function getOrgSession(): Promise<SessionBootstrapDto | null> {
  try {
    const session = await getOrgMe();

    if (session) {
      const userId = getAuthContext()?.userId ?? getCurrentUser().userId ?? 0;

      if (!session.profileUrl && userId > 0) {
        try {
          const user = await getUserById(userId);
          if (user?.profileUrl) {
            return { ...session, profileUrl: user.profileUrl };
          }
        } catch {
          // Optional profile enrichment — never discard a valid Org/me session.
        }
      }

      return session;
    }
  } catch {
    // Fall through to GetUserById when Org/me fails or returns an unexpected shape.
  }

  const authContext = getAuthContext();
  const userId = authContext?.userId ?? getCurrentUser().userId ?? 0;

  if (userId <= 0) {
    return null;
  }

  try {
    const user = await getUserById(userId);
    return user ? mapUserByIdFallback(user) : null;
  } catch {
    return null;
  }
}
