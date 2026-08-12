"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Text } from "@/components/Text";
import {
  isSettingsSectionActive,
  SETTINGS_SECTIONS,
  type SettingsSectionId,
} from "@/components/settings/settings-nav";

export type SettingsShellProps = Readonly<{
  activeSection: SettingsSectionId;
  children: ReactNode;
}>;

function SettingsBreadcrumb(props: Readonly<{ sectionLabel: string }>) {
  const { sectionLabel } = props;

  const items: readonly { label: string; href?: string }[] = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Settings", href: "/dashboard/settings/incident-rates" },
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

function SettingsSectionNav(
  props: Readonly<{ activeSection: SettingsSectionId }>,
) {
  const { activeSection } = props;
  const pathname = usePathname();

  return (
    <nav
      aria-label="Settings sections"
      className="border-ehs-border inline-flex max-w-full shrink-0 flex-col gap-1 self-start overflow-x-auto rounded-xl border bg-white/60 p-1.25 sm:flex-row"
    >
      {SETTINGS_SECTIONS.map((section) => {
        const isActive =
          section.id === activeSection ||
          isSettingsSectionActive(pathname, section.href);

        return (
          <Link
            key={section.id}
            href={section.href}
            aria-current={isActive ? "page" : undefined}
            className={[
              "inline-flex w-fit items-center rounded-2.25 px-4 py-2.25 transition-colors",
              isActive
                ? "bg-ehs-normal-blue text5 text-ehs-light-text shadow-[0px_4px_12px_-4px_var(--ehs-normal-blue)]"
                : "text4 text-ehs-gray hover:bg-white/70",
            ].join(" ")}
          >
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SettingsShell(props: Readonly<SettingsShellProps>) {
  const { activeSection, children } = props;
  const section =
    SETTINGS_SECTIONS.find((entry) => entry.id === activeSection) ??
    SETTINGS_SECTIONS[0]!;

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <div className="flex min-w-0 flex-1 flex-col gap-5 px-3 pb-8 pt-4 sm:px-6">
        <header className="flex flex-col gap-3">
          <SettingsBreadcrumb sectionLabel={section.label} />

          <Text as="h1" className="text1 text-ehs-darker">
            Settings
          </Text>

          <Text as="p" className="text4 text-ehs-muted-text max-w-2xl">
            {section.description}
          </Text>

          <SettingsSectionNav activeSection={activeSection} />
        </header>

        {children}
      </div>
    </div>
  );
}
