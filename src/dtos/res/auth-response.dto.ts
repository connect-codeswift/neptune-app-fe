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
  /** Free-text job title, distinct from the role. Null until someone sets it. */
  jobTitle?: string | null;
  /** The user's phone number, as stored. Null until they set one. */
  contactNo?: string | null;
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

/** POST /api/v1/auth/mfa/setup — the shared secret plus the otpauth:// URI to encode as a QR. */
export type MfaSetupResponseDto = {
  mfaSecret: string;
  otpAuthUri: string;
};
