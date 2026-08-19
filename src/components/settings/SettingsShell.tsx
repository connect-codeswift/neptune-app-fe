"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Text } from "@/components/Text";
import {
  getSettingsSection,
  getVisibleSettingsSections,
  isSettingsSectionActive,
  SETTINGS_SECTIONS,
  type SettingsSection,
  type SettingsSectionId,
} from "@/components/settings/settings-nav";
import { useSessionBootstrap } from "@/hooks/use-session-bootstrap";
import { isAdminRole } from "@/lib/jwt-permissions";

export type SettingsShellProps = Readonly<{
  activeSection: SettingsSectionId;
  children: ReactNode;
  /** Right-hand controls in the header row — Save / Cancel on the editable tabs. */
  actions?: ReactNode;
}>;

function SettingsBreadcrumb(props: Readonly<{ sectionLabel: string }>) {
  const { sectionLabel } = props;

  const items: readonly { label: string; href?: string }[] = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Settings", href: SETTINGS_SECTIONS[0]!.href },
    { label: sectionLabel },
  ];

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={item.label} className="flex items-center gap-1">
            {index > 0 ? (
              <Icon
                icon="mdi:chevron-right"
                className="text-ehs-muted-text size-3.5"
                aria-hidden="true"
              />
            ) : null}

            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text8 text-ehs-muted-text hover:text-ehs-gray transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <Text
                as="span"
                className={[
                  "text8",
                  isLast ? "text-ehs-normal-blue" : "text-ehs-muted-text",
                ].join(" ")}
              >
                {item.label}
              </Text>
            )}
          </span>
        );
      })}
    </nav>
  );
}

/**
 * One tab in the segmented control.
 *
 * The active tab is a raised surface pill with brand-coloured text, not a solid brand fill.
 * A filled tab needs a coloured drop shadow to sit properly on the track, and that glow is a
 * light-theme device — over a dark page it haloes. A pill in the surface colour reads as
 * "lifted out of the track" in both themes using the same two ingredients the cards use.
 */
function SettingsTab(
  props: Readonly<{ section: SettingsSection; isActive: boolean }>,
) {
  const { section, isActive } = props;

  const stateClass = isActive
    ? "bg-ehs-surface text5 text-ehs-normal-blue shadow-(--ehs-shadow-tab-active)"
    : "text4 text-ehs-gray hover:bg-ehs-surface/50 hover:text-ehs-darker";

  return (
    <Link
      href={section.href}
      aria-current={isActive ? "page" : undefined}
      className={[
        "rounded-2.5 relative inline-flex w-fit shrink-0 items-center gap-2 px-3.5 py-2 whitespace-nowrap transition-all duration-150",
        stateClass,
      ].join(" ")}
    >
      <Icon
        icon={section.icon}
        className={[
          "size-4.5 shrink-0 transition-colors",
          isActive ? "text-ehs-normal-blue" : "text-ehs-muted-text",
        ].join(" ")}
        aria-hidden="true"
      />
      {section.label}
    </Link>
  );
}

function SettingsSectionNav(
  props: Readonly<{ activeSection: SettingsSectionId; isAdmin: boolean }>,
) {
  const { activeSection, isAdmin } = props;
  const pathname = usePathname();

  return (
    <nav
      aria-label="Settings sections"
      /* An inset track rather than a raised bar: the tabs are what lift out of it, so the
         container reads as a groove and the active pill as the thing sitting in it. */
      className="border-ehs-border bg-ehs-surface-inverse/4 scrollbar-none inline-flex max-w-full gap-1 self-start overflow-x-auto rounded-3 border p-1"
    >
      {getVisibleSettingsSections(isAdmin).map((section) => (
        <SettingsTab
          key={section.id}
          section={section}
          isActive={
            section.id === activeSection ||
            isSettingsSectionActive(pathname, section.href)
          }
        />
      ))}
    </nav>
  );
}

/**
 * The frame every settings tab renders inside: breadcrumb, title, the tab strip, and the
 * active section's one-line description.
 *
 * Personal settings (profile, security, appearance) and company settings (incident rates) share
 * this one page deliberately — they used to live apart, with account settings under
 * `/dashboard/my-profile/*` and a separate admin-only `/dashboard/settings`, which meant two
 * different tab strips, two breadcrumb trails and no single place to look for "a setting".
 */
export function SettingsShell(props: Readonly<SettingsShellProps>) {
  const { activeSection, children, actions } = props;
  const { user } = useSessionBootstrap();
  const isAdmin = isAdminRole(user.role);
  const section = getSettingsSection(activeSection) ?? SETTINGS_SECTIONS[0]!;

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <div className="flex min-w-0 flex-1 flex-col gap-5 px-3 pt-4 pb-8 sm:px-6">
        <header className="flex flex-col gap-3">
          <SettingsBreadcrumb sectionLabel={section.label} />

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1">
              <Text as="h1" className="text1 text-ehs-darker">
                Settings
              </Text>
              <Text as="p" className="text4 text-ehs-muted-text max-w-2xl">
                {section.description}
              </Text>
            </div>

            {actions ? (
              <div className="flex flex-wrap items-center gap-3">{actions}</div>
            ) : null}
          </div>

          <SettingsSectionNav
            activeSection={activeSection}
            isAdmin={isAdmin}
          />
        </header>

        {children}
      </div>
    </div>
  );
}
