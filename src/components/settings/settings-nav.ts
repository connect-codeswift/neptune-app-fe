export type SettingsSectionId = "incident-rates";

export type SettingsSection = Readonly<{
  id: SettingsSectionId;
  label: string;
  href: string;
  description: string;
}>;

/** Subsections under /dashboard/settings — add new entries here as settings grow. */
export const SETTINGS_SECTIONS: readonly SettingsSection[] = [
  {
    id: "incident-rates",
    label: "Incident rates",
    href: "/dashboard/settings/incident-rates",
    description:
      "Site work hours for Recordable Rate (RIR) and Lost Time Incident Rate (LTIR). Rates use YTD recordable incidents ÷ YTD hours × 200,000.",
  },
];

export const DEFAULT_SETTINGS_HREF = SETTINGS_SECTIONS[0]!.href;

export function getSettingsSectionById(
  id: string,
): SettingsSection | undefined {
  return SETTINGS_SECTIONS.find((section) => section.id === id);
}

export function isSettingsSectionActive(
  pathname: string,
  href: string,
): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
