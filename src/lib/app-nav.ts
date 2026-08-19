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
  /** Any one granted permission shows the item (unless Admin). */
  requiredPermissions: readonly string[];
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
    // code — the assistant is not a licensed EHS module, and an item with neither a moduleCode
    // nor alwaysVisible is rejected outright by the licence gate.
    title: "Neptune AI",
    items: [
      {
        label: "Chat",
        href: NEPTUNE_AI_HREF,
        icon: "ri:chat-ai-line",
        alwaysVisible: true,
        requiredPermissions: [],
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
        requiredPermissions: ["View Dashboard"],
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
        requiredPermissions: [
          "View Incidents",
          "Create Incidents",
          "Edit Incidents",
        ],
      },
      {
        label: "Near Miss",
        href: "/dashboard/near-miss",
        icon: "mdi:eye-outline",
        moduleCode: "NEAR_MISS",
        requiredPermissions: ["View Incidents", "Submit Observations"],
      },
      {
        label: "Hazard",
        href: "/dashboard/hazard",
        icon: "mdi:alert-octagon-outline",
        moduleCode: "HAZARD",
        requiredPermissions: ["Manage Hazards", "Submit Observations"],
      },
      {
        label: "Lockout/Tagout",
        href: "/dashboard/lockout-tagout",
        icon: "mdi:lock-outline",
        moduleCode: "LOCKOUT_TAGOUT",
        requiredPermissions: ["Manage LOTO", "View LOTO Records"],
      },
      {
        label: "Fleet Management",
        href: "/dashboard/fleet-management",
        icon: "mdi:steering",
        requiredPermissions: ["View Permits", "Create Permits"],
      },
      {
        label: "CAPA",
        href: "/dashboard/capa",
        icon: "mdi:refresh",
        moduleCode: "CAPA",
        requiredPermissions: [
          "Manage Actions",
          "View Action Plans",
          "Assign Actions",
        ],
      },
      {
        label: "HazCom",
        href: "/dashboard/hazcom",
        icon: "healthicons:chemical-burn",
        moduleCode: "HAZCOM",
        requiredPermissions: ["View Documents", "Manage Training"],
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
        requiredPermissions: ["Manage Audits", "Manage Field Audits"],
      },
      {
        label: "Inspections",
        href: "/dashboard/inspections",
        icon: "mdi:clipboard-text-outline",
        moduleCode: "INSPECTIONS",
        requiredPermissions: ["Conduct Inspections"],
      },
      {
        label: "BBS",
        href: "/dashboard/bbs",
        icon: "mdi:clipboard-outline",
        moduleCode: "BEHAVIOUR_BASED_SAFETY",
        requiredPermissions: ["Submit Observations"],
      },
      {
        label: "Walk & Talk",
        href: "/dashboard/walk-talk",
        icon: "mdi:account-multiple-outline",
        moduleCode: "WALK_AND_TALKS",
        requiredPermissions: ["Submit Observations"],
      },
      {
        label: "Regulatory Compliance",
        href: "/dashboard/regulatory-compliance",
        icon: "mdi:file-document-outline",
        moduleCode: "REGULATORY_COMPLIANCE",
        requiredPermissions: ["View Regulations", "Manage Regulations"],
      },
      {
        label: "PPE Management",
        href: "/dashboard/ppe-management",
        icon: "mdi:tshirt-crew-outline",
        moduleCode: "PPE_MANAGEMENT",
        requiredPermissions: [
          "Manage PPE",
          "View PPE Records",
          "View PPE Assignments",
        ],
      },
      {
        label: "Policy Maker",
        href: "/dashboard/policy-maker",
        icon: "mdi:folder-outline",
        moduleCode: "POLICY_MAKER",
        requiredPermissions: ["View Documents", "Upload Docs", "Approve Docs"],
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
        requiredPermissions: ["View Analytics"],
      },
      {
        label: "Reports",
        href: "/dashboard/reports",
        icon: "mdi:file-chart-outline",
        requiredPermissions: ["Export Reports", "View Reports"],
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
        requiredPermissions: ["View Analytics", "Export Data"],
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
        requiredPermissions: ["View Claims", "View Medical Records"],
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
        requiredPermissions: [],
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
 * The `page:*` permission prefix an item belongs to, derived from its href.
 *
 * `/dashboard/incidents` -> `page:incidents`, which covers `page:incidents-list`,
 * `page:incidents-dashboard`, `page:incidents-report` and the rest. Deriving it beats a
 * per-item field: the seed in 20260807163258_UiPermissions was generated from these same
 * routes, so a new page cannot drift out of sync with a list someone forgot to update.
 */
function pagePermissionPrefix(href: string): string {
  const slug = href.replace(/^\/dashboard\/?/, "");
  return slug ? `page:${slug}` : "page:dashboard";
}

/**
 * Does the caller hold any page permission for this item?
 *
 * Prefix rather than exact match, because one sidebar entry fronts several pages — a role
 * granted only `page:incidents-report` should still see Incidents in the nav and land
 * somewhere it can read.
 */
function hasPagePermission(href: string, permissions: Set<string>): boolean {
  const prefix = pagePermissionPrefix(href);
  for (const permission of permissions) {
    if (permission === prefix || permission.startsWith(`${prefix}-`)) {
      return true;
    }
  }
  return false;
}

function passesModuleLicenseGate(
  item: AppNavItem,
  activatedModules: Set<string>,
): boolean {
  if (item.moduleCode) {
    return activatedModules.has(item.moduleCode.toUpperCase());
  }

  return item.alwaysVisible === true;
}

function isNavItemVisible(
  item: AppNavItem,
  activatedModules: Set<string>,
  userPermissions: Set<string>,
  role: string | null,
  moduleOnlyGating: boolean,
): boolean {
  if (!passesModuleLicenseGate(item, activatedModules)) {
    return false;
  }

  // First, and deliberately ahead of both bypasses below: an allowedRoles list is a
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

  // The role gate, and the point of the whole thing: a licensed module still only appears
  // for a role granted one of its page permissions — which is exactly what an admin ticks
  // in the role editor's Pages tab.
  //
  // Applied only when the caller actually carries page claims. A token minted before these
  // were granted, or a session bootstrapped from Org/me, carries none — and hiding every
  // module because the claims are unreadable would lock people out of a working app. The
  // API refuses anything they should not reach regardless.
  const holdsAnyPagePermission = [...userPermissions].some((p) =>
    p.startsWith("page:"),
  );

  // alwaysVisible items sit outside the page catalogue — Settings has no page: row of its
  // own, and every user needs it for their own account, so the page gate must not hide it.
  // The company-wide tab inside Settings does its own role check.
  if (holdsAnyPagePermission && item.alwaysVisible !== true) {
    return hasPagePermission(item.href, userPermissions);
  }

  // No page claims to go on — fall back to the licence being the only gate.
  if (moduleOnlyGating) {
    return true;
  }

  if (item.requiredPermissions.length === 0) {
    return true;
  }

  return item.requiredPermissions.some((permission) =>
    userPermissions.has(permission),
  );
}

export function getVisibleNavGroups(
  groups: readonly AppNavGroup[],
  activatedModules: Set<string>,
  userPermissions: Set<string>,
  role: string | null,
  moduleOnlyGating = false,
): AppNavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        isNavItemVisible(
          item,
          activatedModules,
          userPermissions,
          role,
          moduleOnlyGating,
        ),
      ),
    }))
    .filter((group) => group.items.length > 0);
}
