export type SessionSiteDto = Readonly<{
  id: number;
  siteName: string;
  location: string;
  industryType: string;
  siteSize: string;
}>;

/** Normalized session payload for sidebar bootstrap (Org/me or fallbacks). */
export type SessionBootstrapDto = Readonly<{
  id: number | null;
  fullName: string | null;
  email: string | null;
  role: string | null;
  /**
   * What the person does, as stored on their account — not the role, which decides what they
   * may do. Null until someone sets it, and callers that need something to display should fall
   * back to the role rather than treating null as an error.
   */
  jobTitle: string | null;
  /**
   * Whether the signed-in user has two-factor authentication on, from GET /Auth/Org/me.
   *
   * It is user-scoped rather than org-scoped, and lives on this payload for the same reason
   * `jobTitle` does: it is the one call the app already makes at bootstrap, and the Security
   * screen needs the true state to render its toggle. False for the fallback session shapes,
   * which cannot see it.
   */
  mfaEnabled: boolean;
  /** True once the user has turned down the optional MFA offer. */
  mfaPromptDismissed: boolean;
  organizationId: number | null;
  organizationName: string | null;
  siteId: number | null;
  siteName: string | null;
  profileUrl: string | null;
  activatedModules: string | null;
  permissions: readonly string[];
  sites: readonly SessionSiteDto[];
  /** UTC instant when org access ends; null = permanent. From GET /api/v1/organizations/me. */
  accessExpiresAt: string | null;
  /** Whole days left in the access window; null = permanent. Can be 0 on the final day. */
  daysRemaining: number | null;
  maxSeats: number | null;
  maxSites: number | null;
  seatsUsed: number;
  sitesUsed: number;
  seatsAvailable: number | null;
  sitesAvailable: number | null;
  atSeatLimit: boolean;
  atSiteLimit: boolean;
}>;
