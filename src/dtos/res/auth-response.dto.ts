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
  sites: SiteDto[];
};

export type LoginResponseDto = {
  accessToken: string;
  refreshToken: string;
};
