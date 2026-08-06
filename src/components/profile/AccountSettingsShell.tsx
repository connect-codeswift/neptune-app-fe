"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";

export type AccountSettingsTab = "profile" | "security";

export type AccountSettingsShellProps = Readonly<{
  activeTab: AccountSettingsTab;
  children: ReactNode;
  onSave?: () => void;
  onCancel?: () => void;
  showActions?: boolean;
}>;

const settingsLabelClass =
  "text-ehs-muted-text text-[10px] font-semibold tracking-wider uppercase";

function AccountSettingsTabs(
  props: Readonly<{ activeTab: AccountSettingsTab }>,
) {
  const { activeTab } = props;

  const tabs: readonly { id: AccountSettingsTab; label: string; href: string }[] =
    [
      {
        id: "profile",
        label: "Profile",
        href: "/dashboard/my-profile/settings",
      },
      {
        id: "security",
        label: "Security",
        href: "/dashboard/my-profile/security",
      },
    ];

  return (
    <div className="inline-flex items-center gap-2">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={[
              "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              isActive
                ? "bg-ehs-light-blue text-ehs-normal-blue"
                : "text-ehs-darker hover:text-ehs-gray",
            ].join(" ")}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

function BreadcrumbTrail() {
  const items: readonly { label: string; href?: string }[] = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "My Account", href: "/dashboard/my-profile" },
    { label: "Settings" },
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
                className="text-ehs-muted-text text-sm"
                aria-hidden="true"
              />
            ) : null}

            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-ehs-muted-text hover:text-ehs-gray text-xs transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={[
                  "text-xs font-medium",
                  isLast ? "text-ehs-normal-blue" : "text-ehs-muted-text",
                ].join(" ")}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function AccountSettingsShell(props: Readonly<AccountSettingsShellProps>) {
  const {
    activeTab,
    children,
    onSave,
    onCancel,
    showActions = activeTab === "profile",
  } = props;
  const router = useRouter();

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }

    router.push("/dashboard/my-profile");
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-[14px] px-4 pt-4 pb-8">
        <header className="flex flex-col gap-3">
          <BreadcrumbTrail />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <Text
              as="h1"
              className="text-ehs-darker text-[28px] leading-tight font-bold tracking-tight"
            >
              Account Settings
            </Text>

            {showActions ? (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-ehs-darker hover:text-ehs-gray cursor-pointer bg-transparent px-1 py-2 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <Button
                  type="button"
                  variant="primary"
                  className="rounded-lg px-5 py-2.5 text-sm"
                  onClick={onSave}
                >
                  Save Changes
                </Button>
              </div>
            ) : null}
          </div>

          <AccountSettingsTabs activeTab={activeTab} />
        </header>

        {children}
      </div>
    </div>
  );
}

export { settingsLabelClass };
