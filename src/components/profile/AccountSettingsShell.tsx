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

/** Sentence-case form labels for account settings fields. */
const settingsLabelClass = "text7 text-ehs-darker block";

function AccountSettingsTabs(
  props: Readonly<{ activeTab: AccountSettingsTab }>,
) {
  const { activeTab } = props;

  const tabs: readonly {
    id: AccountSettingsTab;
    label: string;
    href: string;
  }[] = [
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
              "rounded-lg px-4 py-2 transition-colors",
              isActive
                ? "bg-ehs-light-blue text5 text-ehs-normal-blue"
                : "text4 text-ehs-darker hover:text-ehs-gray",
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

export function AccountSettingsShell(
  props: Readonly<AccountSettingsShellProps>,
) {
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
      <div className="flex flex-1 flex-col gap-3.5 px-4 pt-4 pb-8">
        <header className="flex flex-col gap-3">
          <BreadcrumbTrail />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <Text as="h1" className="text1 text-ehs-darker">
              Account Settings
            </Text>

            {showActions ? (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text4 text-ehs-darker hover:text-ehs-gray cursor-pointer bg-transparent px-1 py-2 transition-colors"
                >
                  Cancel
                </button>
                <Button
                  type="button"
                  variant="primary"
                  className="text4 rounded-lg px-5 py-2.5"
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
