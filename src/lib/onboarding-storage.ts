import {
  initialModuleState,
  initialSites,
  MODULES,
  type ModuleState,
  type SiteInfo,
} from "@/components/onboarding/constants";

export const ONBOARDING_STORAGE_KEY = "neptune-onboarding";

export type OnboardingInvite = Readonly<{
  id: string;
  email: string;
  role: string;
}>;

export type OnboardingPersistedState = Readonly<{
  currentStep: number;
  organizationName: string;
  sites: SiteInfo[];
  moduleState: ModuleState;
  invites: OnboardingInvite[];
}>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeModuleState(value: unknown): ModuleState {
  const defaults = initialModuleState;

  if (!isRecord(value)) {
    return defaults;
  }

  return Object.fromEntries(
    MODULES.map((module) => [
      module.id,
      typeof value[module.id] === "boolean"
        ? value[module.id]
        : defaults[module.id],
    ]),
  ) as ModuleState;
}

function normalizeSites(value: unknown): SiteInfo[] {
  if (!Array.isArray(value) || value.length === 0) {
    return initialSites;
  }

  const sites = value
    .filter(isRecord)
    .map((site, index) => ({
      id: typeof site.id === "string" ? site.id : `site-${index}`,
      siteName: typeof site.siteName === "string" ? site.siteName : "",
      region: typeof site.region === "string" ? site.region : "",
      industry: typeof site.industry === "string" ? site.industry : "",
      companySize: typeof site.companySize === "string" ? site.companySize : "",
    }))
    .map((site) => site as SiteInfo);

  return sites.length > 0 ? sites : initialSites;
}

function normalizeInvites(value: unknown): OnboardingInvite[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((invite, index) => ({
      id: typeof invite.id === "string" ? invite.id : `invite-${index}`,
      email: typeof invite.email === "string" ? invite.email : "",
      role: typeof invite.role === "string" ? invite.role : "",
    }))
    .filter((invite) => invite.email.length > 0);
}

function normalizePersistedState(
  value: unknown,
): OnboardingPersistedState | null {
  if (!isRecord(value)) {
    return null;
  }

  const currentStep =
    typeof value.currentStep === "number" &&
    value.currentStep >= 1 &&
    value.currentStep <= 3
      ? value.currentStep
      : 1;

  return {
    currentStep,
    organizationName:
      typeof value.organizationName === "string" ? value.organizationName : "",
    sites: normalizeSites(value.sites),
    moduleState: normalizeModuleState(value.moduleState),
    invites: normalizeInvites(value.invites),
  };
}

export function loadOnboardingState(): OnboardingPersistedState | null {
  if (globalThis.window === undefined) {
    return null;
  }

  try {
    const raw = globalThis.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return normalizePersistedState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveOnboardingState(state: OnboardingPersistedState) {
  if (globalThis.window === undefined) {
    return;
  }

  globalThis.localStorage.setItem(
    ONBOARDING_STORAGE_KEY,
    JSON.stringify(state),
  );
}

export function clearOnboardingState() {
  if (globalThis.window === undefined) {
    return;
  }

  globalThis.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
}
