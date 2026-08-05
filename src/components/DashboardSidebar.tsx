"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Text } from "@/components/Text";
import { useSessionBootstrap } from "@/hooks/use-session-bootstrap";
import type { AppNavItem } from "@/lib/app-nav";

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
  props: Readonly<{ item: AppNavItem; active: boolean }>,
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

function SidebarNavSkeleton() {
  return (
    <div className="flex flex-col gap-6 px-4 py-5">
      {Array.from({ length: 4 }).map((_, groupIndex) => (
        <div key={groupIndex} className="flex flex-col gap-2">
          <div className="bg-ehs-light-bg mx-3 h-2.5 w-16 animate-pulse rounded" />
          {Array.from({ length: 3 }).map((__, itemIndex) => (
            <div
              key={itemIndex}
              className="bg-ehs-light-bg mx-2 h-9 animate-pulse rounded-lg"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function DashboardSidebar(props: Readonly<SidebarProps>) {
  const { className = "" } = props;
  const pathname = usePathname();
  const { navGroups, isLoading, user } = useSessionBootstrap();

  return (
    <aside
      className={[
        "my-4 ml-4 flex h-[calc(100vh-2rem)] w-64 shrink-0 flex-col rounded-3xl bg-[#FFFFFF] shadow-lg backdrop-blur-3xl",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col items-center px-5 pt-5">
        <Logo />
        <div
          className="border-ehs-border mt-4 w-full border-t"
          aria-hidden="true"
        />
      </div>

      <nav className="flex flex-1 scrollbar-none flex-col gap-6 overflow-y-auto px-4 py-5">
        {isLoading ? (
          <SidebarNavSkeleton />
        ) : (
          navGroups.map((group) => (
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
          ))
        )}
      </nav>

      <div className="border-t border-white/40 px-4 py-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div
            className="bg-ehs-normal-blue text-ehs-light-text flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold"
            aria-hidden="true"
          >
            {user.initials}
          </div>
          <div className="min-w-0">
            <Text
              as="p"
              className="text-ehs-darker truncate text-sm font-semibold"
            >
              {user.displayName}
            </Text>
            <Text as="p" className="text-ehs-muted-text truncate text-xs">
              {user.role}
              {user.siteName ? ` · ${user.siteName}` : ""}
            </Text>
          </div>
        </div>
      </div>
    </aside>
  );
}
