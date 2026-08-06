type SiteDto = {
  id: number;
  industryType: string;
  siteSize: string;
  siteName: string;
  location: string;
};

export type AuthResponseDto = {
  id: number;
  fullName: string;
  email: string;
  isDemo: boolean;
  passwordHash: string;
  roleId: number;
  organizationId: number;
  organizationName: string;
  activatedModules: string;
  profileUrl?: string | null;
  sites: SiteDto[];
};

export type LoginResponseDto = {
  accessToken: string;
  refreshToken: string;
  /** Present only when the org has a time-boxed access window. */
  accessDaysRemaining?: number;
  /** UTC instant when org access ends. Omitted when access is permanent. */
  accessExpiresAt?: string;
};
