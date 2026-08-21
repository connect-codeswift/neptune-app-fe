import { NEPTUNE_AI_HREF } from "@/components/neptune-ai/neptune-ai-routes";
import type { EhsModuleCode } from "@/lib/ehs-modules";

export type AppNavItem = Readonly<{
  label: string;
  href: string;
  icon: string;
  badge?: number;
  /** When set, the org must have this EHSS module licensed. */
  moduleCode?: EhsModuleCode;
  /**
   * The capability that makes this item visible — `Incident.View`.
   *
   * Stated per item rather than derived from the href. The href-derived
   * `page:` scheme meant a third catalogue of permissions that had to be
   * regenerated from route slugs whenever a route moved, and it expressed the
   * same fact the API gate already expressed: `page:hazard-id-edit` and
   * `Hazard.Update` were one capability written twice. There is one vocabulary
   * now, and this is where a route declares which word of it it needs.
   */
  capability?: string;
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
        capability: "Incident.View",
        icon: "mdi:alert-outline",
        moduleCode: "INCIDENT",
      },
      {
        label: "Near Miss",
        href: "/dashboard/near-miss",
        capability: "NearMiss.View",
        icon: "mdi:eye-outline",
        moduleCode: "NEAR_MISS",
      },
      {
        label: "Hazard",
        href: "/dashboard/hazard",
        capability: "Hazard.View",
        icon: "mdi:alert-octagon-outline",
        moduleCode: "HAZARD",
      },
      {
        label: "Lockout/Tagout",
        href: "/dashboard/lockout-tagout",
        capability: "Loto.View",
        icon: "mdi:lock-outline",
        moduleCode: "LOCKOUT_TAGOUT",
      },
      {
        label: "Fleet Management",
        href: "/dashboard/fleet-management",
        capability: "FleetManagement.View",
        moduleCode: "FLEET_MANAGEMENT",
        icon: "mdi:steering",
      },
      {
        label: "CAPA",
        href: "/dashboard/capa",
        capability: "CAPA.View",
        icon: "mdi:refresh",
        moduleCode: "CAPA",
      },
      {
        label: "HazCom",
        href: "/dashboard/hazcom",
        capability: "HazCom.View",
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
        capability: "Audit.View",
        icon: "mdi:shield-check-outline",
        moduleCode: "AUDITS",
      },
      {
        label: "Inspections",
        href: "/dashboard/inspections",
        capability: "Inspection.View",
        icon: "mdi:clipboard-text-outline",
        moduleCode: "INSPECTIONS",
      },
      {
        label: "BBS",
        href: "/dashboard/bbs",
        capability: "Bbs.View",
        icon: "mdi:clipboard-outline",
        moduleCode: "BEHAVIOUR_BASED_SAFETY",
      },
      {
        label: "Walk & Talk",
        href: "/dashboard/walk-talk",
        capability: "WalkTalk.View",
        icon: "mdi:account-multiple-outline",
        moduleCode: "WALK_AND_TALKS",
      },
      {
        label: "Regulatory Compliance",
        href: "/dashboard/regulatory-compliance",
        capability: "Compliance.View",
        icon: "mdi:file-document-outline",
        moduleCode: "REGULATORY_COMPLIANCE",
      },
      {
        label: "PPE Management",
        href: "/dashboard/ppe-management",
        capability: "PPE.View",
        icon: "mdi:tshirt-crew-outline",
        moduleCode: "PPE_MANAGEMENT",
      },
      {
        label: "Policy Maker",
        href: "/dashboard/policy-maker",
        capability: "Document.View",
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
        capability: "Analytics.View",
        moduleCode: "ANALYTICS",
        icon: "mdi:chart-line",
      },
      {
        label: "Reports",
        href: "/dashboard/reports",
        capability: "Reports.View",
        moduleCode: "REPORTS",
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
        capability: "Emissions.View",
        moduleCode: "EMISSIONS",
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
        capability: "IndustrialHygiene.View",
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
 * The org's plan gate. An item naming a `moduleCode` needs that module licensed.
 *
 * Every EHS entry names one now, including the four that used to be exempt because they
 * had no module to name — Analytics, Reports, Emissions and Fleet Management are
 * licensable modules in their own right, sold like any other and shipped switched off
 * until their backends exist.
 *
 * Items with no `moduleCode` are the ones outside the catalogue entirely: Chat, Dashboard
 * and Settings.
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
  // The licence is the outermost gate and nothing below can widen it. It bounds
  // Ehs_Director too: the backend applies the same rule when it mints the token, so a
  // module the company has not bought carries no claims for anyone.
  if (!passesModuleLicenseGate(item, activatedModules)) {
    return false;
  }

  // An allowedRoles list is a restriction, and a restriction any later rule can widen is
  // not one.
  if (
    item.allowedRoles &&
    !item.allowedRoles.some((r) => matchesRole(role, r))
  ) {
    return false;
  }

  // Chat, Dashboard and Settings sit outside the module catalogue and have no capability
  // to check. Every user needs Settings to reach their own account. The company-wide tab
  // inside Settings does its own role check.
  if (item.alwaysVisible === true) {
    return true;
  }

  // The gate, and the point of the whole thing: a licensed module appears only for a role
  // granted its View — exactly the box an admin ticks in Roles & Rights.
  //
  // There used to be an `isAdminRole(role)` bypass here that returned true for
  // Ehs_Director before any capability was consulted. It has been removed. The backend
  // deliberately has no such bypass — PermissionHandler says so outright — so the two
  // layers disagreed, and the practical cost was that nobody could ever see what a
  // director actually sees. Ehs_Director holds every capability as real grants, so the
  // ordinary check below already returns true for them; it now does so for a reason that
  // is testable.
  //
  // There is deliberately no fallback for a caller carrying no claims. There used to be
  // one, and it is what made "untick everything" show the entire sidebar instead of none
  // of it: a role holding nothing read as "claims unreadable" and fell through to the
  // licence being the only gate. Claims are refreshed on the next token refresh, and the
  // org/me payload carries the same set for the UI in the meantime.
  //
  // Hiding a nav item is not access control. `requireCapability` refuses anyone who types
  // the URL, and the API refuses them regardless of either.
  if (!item.capability) {
    return false;
  }

  return userPermissions.has(item.capability);
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

/** Every nav item, flattened. */
export function getAllNavItems(): AppNavItem[] {
  return APP_NAV_GROUPS.flatMap((group) => [...group.items]);
}

/**
 * The nav entry a route belongs to, by longest matching href.
 *
 * Longest wins so `/dashboard/hazcom/sds/12` resolves to HazCom rather than to Dashboard,
 * which every `/dashboard/*` path would otherwise prefix-match.
 */
export function findNavItemForPath(pathname: string): AppNavItem | undefined {
  return getAllNavItems()
    .filter(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    .toSorted((left, right) => right.href.length - left.href.length)
    .at(0);
}
