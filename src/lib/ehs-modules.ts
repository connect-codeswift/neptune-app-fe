/**
 * Canonical EHS module codes returned by the backend in `activatedModules`.
 * Aligns with neptune-admin-fe `src/lib/ehs-modules.ts`.
 */
export type EhsModuleCode =
  | "INCIDENT"
  | "NEAR_MISS"
  | "HAZARD"
  | "LOCKOUT_TAGOUT"
  | "CAPA"
  | "AUDITS"
  | "INSPECTIONS"
  | "POLICY_MAKER"
  | "REGULATORY_COMPLIANCE"
  | "BEHAVIOUR_BASED_SAFETY"
  | "WALK_AND_TALKS"
  | "PPE_MANAGEMENT"
  | "INDUSTRIAL_HYGIENE"
  | "HAZCOM";

const ALL_MODULE_CODES: readonly EhsModuleCode[] = [
  "INCIDENT",
  "NEAR_MISS",
  "HAZARD",
  "LOCKOUT_TAGOUT",
  "CAPA",
  "AUDITS",
  "INSPECTIONS",
  "POLICY_MAKER",
  "REGULATORY_COMPLIANCE",
  "BEHAVIOUR_BASED_SAFETY",
  "WALK_AND_TALKS",
  "PPE_MANAGEMENT",
  "INDUSTRIAL_HYGIENE",
  "HAZCOM",
];

/** Backend API tokens that differ from our canonical nav module codes. */
const API_CODE_ALIASES: Readonly<Record<string, EhsModuleCode>> = {
  HAZARDS: "HAZARD",
  POLICY_MAKERS: "POLICY_MAKER",
};

function normalizeModuleKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[%&]+/g, " ")
    .replace(/[/\\]+/g, " ")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ");
}

/** Maps backend/onboarding/admin labels to one or more API module codes. Keys are {@link normalizeModuleKey} values. */
const MODULE_ALIASES: Readonly<Record<string, readonly EhsModuleCode[]>> = {
  incident: ["INCIDENT"],
  "incident management": ["INCIDENT"],
  "near miss": ["NEAR_MISS"],
  hazard: ["HAZARD"],
  "hazard near miss": ["HAZARD", "NEAR_MISS"],
  "lockout tagout": ["LOCKOUT_TAGOUT"],
  loto: ["LOCKOUT_TAGOUT"],
  capa: ["CAPA"],
  "capa investigations": ["CAPA"],
  audits: ["AUDITS"],
  audit: ["AUDITS"],
  inspections: ["INSPECTIONS"],
  inspection: ["INSPECTIONS"],
  "audits inspection": ["AUDITS", "INSPECTIONS"],
  "policy maker": ["POLICY_MAKER"],
  "regulatory compliance": ["REGULATORY_COMPLIANCE"],
  bbs: ["BEHAVIOUR_BASED_SAFETY"],
  "behaviour based safety": ["BEHAVIOUR_BASED_SAFETY"],
  "behavior based safety": ["BEHAVIOUR_BASED_SAFETY"],
  "walk and talks": ["WALK_AND_TALKS"],
  "walk & talk": ["WALK_AND_TALKS"],
  ppe: ["PPE_MANAGEMENT"],
  "ppe management": ["PPE_MANAGEMENT"],
  "industrial hygiene": ["INDUSTRIAL_HYGIENE"],
  hazcom: ["HAZCOM"],
  "training competency": ["HAZCOM"],
  environmental: ["INDUSTRIAL_HYGIENE"],
};

function resolveModuleToken(token: string): readonly EhsModuleCode[] {
  const trimmed = token.trim();
  if (!trimmed) {
    return [];
  }

  const upper = trimmed.toUpperCase();
  const apiAlias = API_CODE_ALIASES[upper];
  if (apiAlias) {
    return [apiAlias];
  }

  if (ALL_MODULE_CODES.includes(upper as EhsModuleCode)) {
    return [upper as EhsModuleCode];
  }

  const normalized = normalizeModuleKey(trimmed);
  const aliasMatch = MODULE_ALIASES[normalized];
  if (aliasMatch) {
    return aliasMatch;
  }

  const underscored = normalized.replace(/\s+/g, "_").toUpperCase();
  if (ALL_MODULE_CODES.includes(underscored as EhsModuleCode)) {
    return [underscored as EhsModuleCode];
  }

  return [];
}

/** Parse comma-separated backend module values into canonical API codes. */
function parseActivatedModuleCodes(
  value: string | null | undefined,
): string[] {
  if (!value?.trim()) {
    return [];
  }

  const codes = new Set<string>();

  for (const entry of value.split(",")) {
    for (const code of resolveModuleToken(entry)) {
      codes.add(code);
    }
  }

  return [...codes];
}

/** Set helper for sidebar filtering. */
export function parseActivatedModuleSet(
  value: string | null | undefined,
): Set<string> {
  return new Set(parseActivatedModuleCodes(value));
}
