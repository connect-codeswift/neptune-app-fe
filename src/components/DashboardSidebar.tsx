"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Text } from "@/components/Text";

type SidebarNavItem = Readonly<{
  label: string;
  href: string;
  icon: string;
  badge?: number;
}>;

type SidebarNavGroup = Readonly<{
  title: string;
  items: readonly SidebarNavItem[];
}>;

const NAV_GROUPS: readonly SidebarNavGroup[] = [
  {
    title: "Dashboard",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: "mdi:view-grid-outline",
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
        badge: 12,
      },
      {
        label: "Near Miss",
        href: "/dashboard/near-miss",
        icon: "mdi:eye-outline",
        badge: 19,
      },
      {
        label: "Hazard",
        href: "/dashboard/hazard",
        icon: "mdi:alert-triangle-outline",
        badge: 44,
      },
      {
        label: "Lockout/Tagout",
        href: "/dashboard/lockout-tagout",
        icon: "mdi:lock-outline",
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
      },
      {
        label: "Inspections",
        href: "/dashboard/inspections",
        icon: "mdi:clipboard-text-outline",
      },
      {
        label: "Regulatory Compliance",
        href: "/dashboard/regulatory-compliance",
        icon: "mdi:file-document-outline",
      },
      {
        label: "PPE Management",
        href: "/dashboard/ppe-management",
        icon: "mdi:tshirt-crew-outline",
      },
      {
        label: "Policy Maker",
        href: "/dashboard/policy-maker",
        icon: "mdi:folder-outline",
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
        label: "Emissions",
        href: "/dashboard/health-emissions",
        icon: "mdi:leaf",
      },
    ],
  },
];

export type SidebarProps = Readonly<{
  className?: string;
}>;

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarNavLink(
  props: Readonly<{ item: SidebarNavItem; active: boolean }>,
) {
  const { item, active } = props;

  return (
    <Link
      href={item.href}
      className={[
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-ehs-light-blue text-ehs-darker font-medium"
          : "text-ehs-gray hover:bg-white/35",
      ].join(" ")}
    >
      <Icon
        icon={item.icon}
        className={[
          "shrink-0 text-lg",
          active ? "text-ehs-normal-blue" : "text-ehs-muted-text",
        ].join(" ")}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.badge === undefined ? null : (
        <span className="text-ehs-muted-text shrink-0 text-xs font-medium tabular-nums">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export function DashboardSidebar(props: Readonly<SidebarProps>) {
  const { className = "" } = props;
  const pathname = usePathname();

  return (
    <aside
      className={[
        "my-4 ml-4 flex h-[calc(100vh-2rem)] w-64 shrink-0 flex-col rounded-3xl bg-[#fafafa] shadow-white backdrop-blur-3xl",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="border-b border-white/40 px-5 py-5">
        <Logo text="EHS PLATFORM" />
      </div>

      <nav className="flex flex-1 scrollbar-none flex-col gap-6 overflow-y-auto px-4 py-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="flex flex-col gap-1">
            <Text
              as="p"
              className="text-ehs-muted-text px-3 pb-1 text-[10px] font-semibold tracking-wider uppercase"
            >
              {group.title}
            </Text>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <SidebarNavLink
                  key={`${group.title}-${item.label}-${item.href}`}
                  item={item}
                  active={isActivePath(pathname, item.href)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/40 px-4 py-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div
            className="bg-ehs-normal-blue text-ehs-light-text flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold"
            aria-hidden="true"
          >
            SM
          </div>
          <div className="min-w-0">
            <Text
              as="p"
              className="text-ehs-darker truncate text-sm font-semibold"
            >
              Sarah Mitchell
            </Text>
            <Text as="p" className="text-ehs-muted-text truncate text-xs">
              EHS Manager · Plant A
            </Text>
          </div>
        </div>
      </div>
    </aside>
  );
}
