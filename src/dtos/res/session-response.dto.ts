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
  organizationId: number | null;
  organizationName: string | null;
  siteId: number | null;
  siteName: string | null;
  profileUrl: string | null;
  activatedModules: string | null;
  permissions: readonly string[];
  sites: readonly SessionSiteDto[];
  /** UTC instant when org access ends; null = permanent. From GET /Auth/Org/me. */
  accessExpiresAt: string | null;
  /** Whole days left in the access window; null = permanent. Can be 0 on the final day. */
  daysRemaining: number | null;
}>;
