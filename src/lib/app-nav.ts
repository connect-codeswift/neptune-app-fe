import { NEPTUNE_AI_HREF } from "@/components/neptune-ai/neptune-ai-routes";
import type { EhsModuleCode } from "@/lib/ehs-modules";
import { isAdminRole } from "@/lib/jwt-permissions";

export type AppNavItem = Readonly<{
  label: string;
  href: string;
  icon: string;
  badge?: number;
  /** When set, the org must have this EHSS module licensed. */
  moduleCode?: EhsModuleCode;
  /** Shown even when org module list is the only gate (e.g. home dashboard). */
  alwaysVisible?: boolean;
  /**
   * When set, only these roles see the item. Checked before every other rule — including
   * the admin bypass and module-only gating — so nothing can widen it.
   *
   * Hiding a nav item is not access control. The route still has to refuse anyone who
   * types the URL, and the API refuses them regardless of either.
   */
  allowedRoles?: readonly string[];
}>;

export type AppNavGroup = Readonly<{
  title: string;
  items: readonly AppNavItem[];
}>;

/** Static sidebar catalog — filtered at runtime by licensed modules + JWT permissions. */
export const APP_NAV_GROUPS: readonly AppNavGroup[] = [
  {
    // The assistant's single sidebar home: one heading, one entry. "Chat" routes to the full
    // workspace page; the floating launcher covers the quick popup from anywhere. No module
    // code — the assistant is not a licensed EHS module — and alwaysVisible, because it has
    // no `page:` row in the catalogue for the page gate to check.
    title: "Neptune AI",
    items: [
      {
        label: "Chat",
        href: NEPTUNE_AI_HREF,
        icon: "ri:chat-ai-line",
        alwaysVisible: true,
      },
    ],
  },
  {
    title: "Dashboard",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: "mdi:view-grid-outline",
        alwaysVisible: true,
      },
    ],
  },
  {
    title: "Safety",
    items: [
      {
        label: "Incidents",
        href: "/dashboard/incidents",
        icon: "mdi:alert-outline",
        moduleCode: "INCIDENT",
      },
      {
        label: "Near Miss",
        href: "/dashboard/near-miss",
        icon: "mdi:eye-outline",
        moduleCode: "NEAR_MISS",
      },
      {
        label: "Hazard",
        href: "/dashboard/hazard",
        icon: "mdi:alert-octagon-outline",
        moduleCode: "HAZARD",
      },
      {
        label: "Lockout/Tagout",
        href: "/dashboard/lockout-tagout",
        icon: "mdi:lock-outline",
        moduleCode: "LOCKOUT_TAGOUT",
      },
      {
        label: "Fleet Management",
        href: "/dashboard/fleet-management",
        icon: "mdi:steering",
      },
      {
        label: "CAPA",
        href: "/dashboard/capa",
        icon: "mdi:refresh",
        moduleCode: "CAPA",
      },
      {
        label: "HazCom",
        href: "/dashboard/hazcom",
        icon: "healthicons:chemical-burn",
        moduleCode: "HAZCOM",
      },
    ],
  },
  {
    title: "Compliance",
    items: [
      {
        label: "Audits",
        href: "/dashboard/audits",
        icon: "mdi:shield-check-outline",
        moduleCode: "AUDITS",
      },
      {
        label: "Inspections",
        href: "/dashboard/inspections",
        icon: "mdi:clipboard-text-outline",
        moduleCode: "INSPECTIONS",
      },
      {
        label: "BBS",
        href: "/dashboard/bbs",
        icon: "mdi:clipboard-outline",
        moduleCode: "BEHAVIOUR_BASED_SAFETY",
      },
      {
        label: "Walk & Talk",
        href: "/dashboard/walk-talk",
        icon: "mdi:account-multiple-outline",
        moduleCode: "WALK_AND_TALKS",
      },
      {
        label: "Regulatory Compliance",
        href: "/dashboard/regulatory-compliance",
        icon: "mdi:file-document-outline",
        moduleCode: "REGULATORY_COMPLIANCE",
      },
      {
        label: "PPE Management",
        href: "/dashboard/ppe-management",
        icon: "mdi:tshirt-crew-outline",
        moduleCode: "PPE_MANAGEMENT",
      },
      {
        label: "Policy Maker",
        href: "/dashboard/policy-maker",
        icon: "mdi:folder-outline",
        moduleCode: "POLICY_MAKER",
      },
    ],
  },
  {
    title: "Insights",
    items: [
      {
        label: "Analytics",
        href: "/dashboard/analytics",
        icon: "mdi:chart-line",
      },
      {
        label: "Reports",
        href: "/dashboard/reports",
        icon: "mdi:file-chart-outline",
      },
    ],
  },
  {
    title: "Environment",
    items: [
      {
        label: "Emissions",
        href: "/dashboard/emissions",
        icon: "mdi:leaf",
      },
    ],
  },
  {
    title: "Health",
    items: [
      {
        label: "Industrial Hygiene",
        href: "/dashboard/industrial-hygiene",
        icon: "mdi:flask-outline",
        moduleCode: "INDUSTRIAL_HYGIENE",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: "mdi:cog-outline",
        alwaysVisible: true,
        // Deliberately open to every role. This used to be Ehs_Director only, when the page
        // held nothing but company-wide incident-rate configuration. It now also holds each
        // user's own profile, password, two-factor and theme, and hiding it would leave an
        // ordinary user with no route to their own account. The company-only tab inside is
        // gated separately — see components/settings/settings-nav.ts.
      },
    ],
  },
];

/**
 * Role names arrive in the JWT exactly as they sit in the database (`Ehs_Director`), but
 * have been seen spaced or cased differently in older tokens, so compare loosely rather
 * than let a stray space silently hide someone's screen.
 */
function matchesRole(role: string | null, expected: string): boolean {
  const normalize = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, "");
  return role != null && normalize(role) === normalize(expected);
}

/**
 * The `page:*` permission an item is gated on, derived from its href.
 *
 * `/dashboard/hazcom` -> `page:hazcom`. Deriving it beats a per-item field: the catalogue
 * is generated from these same routes, so a new page cannot drift out of sync with a list
 * someone forgot to update.
 */
function pagePermission(href: string): string {
  const slug = href.replace(/^\/dashboard\/?/, "");
  return slug ? `page:${slug}` : "page:dashboard";
}

/**
 * Does the caller hold this item's page permission?
 *
 * Exact match, deliberately. This used to accept anything under the prefix as well, so a
 * role still holding `page:hazcom-sds` kept HazCom in the sidebar after an admin unticked
 * `page:hazcom` — unticking the module row did nothing, and actually hiding HazCom meant
 * clearing all thirteen of its child rows without missing one. Every sidebar entry now has
 * a module-level row of its own (`SeedModulePagePermissions`), so the exact string is
 * always there to untick and one box hides one module.
 *
 * The child rows still matter — they gate the routes inside the module, not the nav entry.
 */
function hasPagePermission(href: string, permissions: Set<string>): boolean {
  return permissions.has(pagePermission(href));
}

/**
 * The org's plan gate. An item naming a `moduleCode` needs that module licensed.
 *
 * An item without one — Analytics, Reports, Emissions, Fleet Management — is not a licensed
 * EHSS module and is left to its page permission alone. This used to require `alwaysVisible`
 * here, which hid those four from every role including Ehs_Director, even though all four
 * have a `page:` row in the catalogue.
 */
function passesModuleLicenseGate(
  item: AppNavItem,
  activatedModules: Set<string>,
): boolean {
  if (item.moduleCode) {
    return activatedModules.has(item.moduleCode.toUpperCase());
  }

  return true;
}

function isNavItemVisible(
  item: AppNavItem,
  activatedModules: Set<string>,
  userPermissions: Set<string>,
  role: string | null,
): boolean {
  if (!passesModuleLicenseGate(item, activatedModules)) {
    return false;
  }

  // First, and deliberately ahead of the bypass below: an allowedRoles list is a
  // restriction, and a restriction that any later rule can widen is not one.
  if (
    item.allowedRoles &&
    !item.allowedRoles.some((r) => matchesRole(role, r))
  ) {
    return false;
  }

  if (isAdminRole(role)) {
    return true;
  }

  // alwaysVisible items sit outside the page catalogue — the AI chat and Settings have no
  // `page:` row of their own, and every user needs Settings to reach their own account, so
  // the page gate must not hide them. The company-wide tab inside Settings does its own
  // role check.
  if (item.alwaysVisible === true) {
    return true;
  }

  // The gate, and the point of the whole thing: a licensed module appears only for a role
  // granted its module-level page permission — exactly the box an admin unticks in Roles &
  // Rights.
  //
  // There is deliberately no fallback for a caller carrying no `page:` claims. There used
  // to be one, and it is what made "untick every page" show the entire sidebar instead of
  // none of it: a role holding nothing read as "claims unreadable" and fell through to the
  // licence being the only gate. Claims are minted at login, so anyone still on a token
  // from before these rows existed sees only Chat, Dashboard and Settings until they log
  // out and back in.
  //
  // Hiding a nav item is not access control. The route still has to refuse anyone who types
  // the URL, and the API refuses them regardless of either.
  return hasPagePermission(item.href, userPermissions);
}

export function getVisibleNavGroups(
  groups: readonly AppNavGroup[],
  activatedModules: Set<string>,
  userPermissions: Set<string>,
  role: string | null,
): AppNavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        isNavItemVisible(item, activatedModules, userPermissions, role),
      ),
    }))
    .filter((group) => group.items.length > 0);
}
