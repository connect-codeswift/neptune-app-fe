import { MODULES, type SiteInfo } from "@/components/onboarding/constants";
import {
  parseRegisterRequest,
  type RegisterRequestDto,
} from "@/dtos/req/auth-request.dto";
import type { OnboardingPersistedState } from "@/lib/onboarding-storage";
import type { SignupPersistedState } from "@/lib/signup-storage";

const DEFAULT_ROLE_ID = 1;
const DEFAULT_ORGANIZATION_ID = 0;

function siteHasRegisterableData(site: SiteInfo) {
  return Boolean(
    site.siteName.trim() &&
      site.region.trim() &&
      site.industry &&
      site.companySize,
  );
}

function getRegisterableSites(sites: readonly SiteInfo[]) {
  const configuredSites = sites.filter(siteHasRegisterableData);
  return configuredSites.length > 0 ? configuredSites : sites.slice(0, 1);
}

function getActivatedModules(onboarding: OnboardingPersistedState) {
  return MODULES.filter((module) => onboarding.moduleState[module.id])
    .map((module) => module.id)
    .join(",");
}

export function buildRegisterRequest(
  signup: SignupPersistedState,
  onboarding: OnboardingPersistedState,
): RegisterRequestDto {
  const activatedModules = getActivatedModules(onboarding);

  const subcompany = getRegisterableSites(onboarding.sites).map((site) => ({
    industryType: site.industry || "other",
    companySize: site.companySize || null,
    companyName: site.siteName.trim(),
    location: site.region.trim(),
  }));

  return parseRegisterRequest({
    fullName: signup.fullName,
    email: signup.email,
    passwordHash: signup.password,
    isDemo: false,
    roleId: DEFAULT_ROLE_ID,
    organizationId: DEFAULT_ORGANIZATION_ID,
    organizationName: onboarding.organizationName.trim(),
    activatedModules,
    subcompany,
  });
}
