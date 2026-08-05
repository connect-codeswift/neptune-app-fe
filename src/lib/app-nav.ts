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
}>;

export type AppNavGroup = Readonly<{
  title: string;
  items: readonly AppNavItem[];
}>;

/** Static sidebar catalog — filtered at runtime by licensed modules + JWT permissions. */
export const APP_NAV_GROUPS: readonly AppNavGroup[] = [
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
        href: "/dashboard/health-emissions",
        icon: "mdi:leaf",
        moduleCode: "INDUSTRIAL_HYGIENE",
        requiredPermissions: ["View Claims", "View Medical Records"],
      },
    ],
  },
];

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

  if (isAdminRole(role)) {
    return true;
  }

  // Licensed modules from Org/me — skip permission checks entirely.
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
