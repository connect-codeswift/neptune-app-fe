export const ONBOARDING_STEPS = [
  { label: "Company setup", description: "Org & sites" },
  { label: "Modules", description: "Pick your tools" },
  { label: "Invite team", description: "Bring people in" },
] as const;

export const MODULES = [
  {
    id: "incident-management",
    title: "Incident Management",
    description: "Report, route & close incidents",
    icon: "mdi:alert-outline",
    defaultEnabled: false,
  },
  {
    id: "hazard-near-miss",
    title: "Hazard & Near-Miss",
    description: "Spot risks before they escalate",
    icon: "mdi:alert-outline",
    defaultEnabled: false,
  },
  {
    id: "capa-investigations",
    title: "CAPA & Investigations",
    description: "Corrective & preventive actions",
    icon: "mdi:clipboard-text-outline",
    defaultEnabled: false,
  },
  {
    id: "audits & inspection",
    title: "Audits & Inspection",
    description: "Scheduled checks & compliance",
    icon: "mdi:clipboard-check-outline",
    defaultEnabled: false,
  },
  {
    id: "training-competency",
    title: "Training & Competency",
    description: "Certifications & refreshers",
    icon: "mdi:medal-outline",
    defaultEnabled: false,
  },
  {
    id: "environmental",
    title: "Environmental",
    description: "Emissions, waste & water",
    icon: "mdi:leaf",
    defaultEnabled: false,
  },
] as const;

export type ModuleId = (typeof MODULES)[number]["id"];

export type ModuleState = Record<ModuleId, boolean>;

export const initialModuleState: ModuleState = Object.fromEntries(
  MODULES.map((module) => [module.id, module.defaultEnabled]),
) as ModuleState;

export function hasActiveModule(moduleState: ModuleState) {
  return MODULES.some((module) => moduleState[module.id]);
}

export function countActiveModules(moduleState: ModuleState) {
  return MODULES.filter((module) => moduleState[module.id]).length;
}

export const INDUSTRY_OPTIONS = [
  { value: "agriculture", label: "Agriculture" },
  { value: "chemicals", label: "Chemicals" },
  { value: "construction", label: "Construction" },
  { value: "energy-utilities", label: "Energy & Utilities" },
  { value: "food-beverage", label: "Food & Beverage" },
  { value: "government", label: "Government & Public Sector" },
  { value: "healthcare", label: "Healthcare" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "mining", label: "Mining" },
  { value: "oil-gas", label: "Oil & Gas" },
  { value: "other", label: "Other" },
  { value: "pharmaceuticals", label: "Pharmaceuticals" },
  { value: "retail", label: "Retail" },
  { value: "technology", label: "Technology" },
  { value: "transport-logistics", label: "Transportation & Logistics" },
] as const;

export type Industry = (typeof INDUSTRY_OPTIONS)[number]["value"] | "";

export function getIndustryLabel(value: Industry) {
  if (!value) {
    return "Not set";
  }

  const option = INDUSTRY_OPTIONS.find((item) => item.value === value);
  return option?.label ?? "Not set";
}

export const COMPANY_SIZE_OPTIONS = [
  { value: "1-50", label: "1-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-1000", label: "201-1,000 employees" },
  { value: "1001-plus", label: "1,001+ employees" },
] as const;

export type CompanySize = (typeof COMPANY_SIZE_OPTIONS)[number]["value"] | "";

export function getCompanySizeLabel(value: CompanySize) {
  if (!value) {
    return "Not set";
  }

  const option = COMPANY_SIZE_OPTIONS.find((item) => item.value === value);
  return option?.label ?? "Not set";
}

export type SiteInfo = Readonly<{
  id: string;
  siteName: string;
  region: string;
  industry: Industry;
  companySize: CompanySize;
}>;

export function countConfiguredSites(sites: readonly SiteInfo[]) {
  const configured = sites.filter(
    (site) =>
      site.siteName.trim() ||
      site.region.trim() ||
      site.industry ||
      site.companySize,
  ).length;

  return configured > 0 ? configured : sites.length;
}

export const emptySiteInfo = (id: string): SiteInfo => ({
  id,
  siteName: "",
  region: "",
  industry: "",
  companySize: "",
});

export const initialSites: SiteInfo[] = [emptySiteInfo("primary")];

export const SITE_ORDINALS = [
  "Primary",
  "Second",
  "Third",
  "Fourth",
  "Fifth",
  "Sixth",
  "Seventh",
  "Eighth",
  "Ninth",
  "Tenth",
] as const;

export function getSiteSectionTitle(index: number) {
  const ordinal = SITE_ORDINALS[index] ?? `${index + 1}th`;
  return `${ordinal} Site Info`;
}
