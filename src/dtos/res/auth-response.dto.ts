type SubcompanyDto = {
  id: number;
  industryType: string;
  companySize: string;
  companyName: string;
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
  subcompany: SubcompanyDto[];
};

export type LoginResponseDto = {
  accessToken: string;
  refreshToken: string;
};
