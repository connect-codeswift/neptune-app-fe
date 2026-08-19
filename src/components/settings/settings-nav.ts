export type SettingsSectionId =
  | "profile"
  | "security"
  | "appearance"
  | "incident-rates";

export type SettingsSection = Readonly<{
  id: SettingsSectionId;
  label: string;
  href: string;
  description: string;
  /** Iconify name shown on the tab. */
  icon: string;
  /**
   * Company-wide configuration, visible to admins only.
   *
   * The distinction is what makes one Settings page able to hold both kinds of thing: the
   * personal sections below belong to whoever is signed in and must never be gated, while the
   * company ones belong to the organization. Gating the whole route — which is what happened
   * before these sections moved here — would have locked every non-admin out of their own
   * profile and password.
   */
  adminOnly?: boolean;
}>;

/** Subsections under /dashboard/settings — add new entries here as settings grow. */
export const SETTINGS_SECTIONS: readonly SettingsSection[] = [
  {
    id: "profile",
    label: "Profile",
    href: "/dashboard/settings/profile",
    icon: "mdi:account-outline",
    description:
      "Your photo, name and contact details, and which notifications reach you.",
  },
  {
    id: "security",
    label: "Security",
    href: "/dashboard/settings/security",
    icon: "mdi:shield-lock-outline",
    description:
      "Your password and two-factor authentication for this account.",
  },
  {
    id: "appearance",
    label: "Appearance",
    href: "/dashboard/settings/appearance",
    icon: "mdi:theme-light-dark",
    description: "How Neptune looks on this device.",
  },
  {
    id: "incident-rates",
    label: "Incident rates",
    href: "/dashboard/settings/incident-rates",
    icon: "mdi:chart-timeline-variant",
    adminOnly: true,
    description:
      "Site work hours for Recordable Rate (RIR) and Lost Time Incident Rate (LTIR). Rates use YTD recordable incidents ÷ YTD hours × 200,000.",
  },
];

/** Personal settings — the landing tab, and the one section everyone can reach. */
export const DEFAULT_SETTINGS_HREF = SETTINGS_SECTIONS[0]!.href;

export function getSettingsSection(
  id: SettingsSectionId,
): SettingsSection | undefined {
  return SETTINGS_SECTIONS.find((section) => section.id === id);
}

/** The tabs a given user may see. `isAdmin` comes from the JWT role. */
export function getVisibleSettingsSections(
  isAdmin: boolean,
): readonly SettingsSection[] {
  return SETTINGS_SECTIONS.filter((section) => isAdmin || !section.adminOnly);
}

export function isSettingsSectionActive(
  pathname: string,
  href: string,
): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
