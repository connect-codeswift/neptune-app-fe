import type { SessionSiteDto } from "@/dtos/res/session-response.dto";

/** GET /api/v1/organizations/me — organization context for the signed-in tenant session. */
export type OrgMeResponseDto = Readonly<{
  id: number;
  name: string;
  activatedModules: string;
  accessExpiresAt: string | null;
  daysRemaining: number | null;
  sites: readonly SessionSiteDto[];
}>;
