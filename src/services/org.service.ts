import type { SessionBootstrapDto } from "@/dtos/res/session-response.dto";
import {
  hasSessionData,
  normalizeOrgMeResponse,
} from "@/lib/normalize-session";
import http from "@/lib/axios";

const ORG_ME_PATH = "/organizations/me";

/** GET /organizations/me — organization name, licensed modules, access window, and sites. */
export async function getOrgMe(): Promise<SessionBootstrapDto | null> {
  const { data } = await http.get<unknown>(ORG_ME_PATH);
  const session = normalizeOrgMeResponse(data);

  return hasSessionData(session) ? session : null;
}
