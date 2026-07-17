"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";

export type BreadCrumbItem = Readonly<{
  label: string;
  href?: string;
}>;

export type BreadCrumbAction = Readonly<{
  label: string;
  variant?: "primary" | "secondary" | "tertiary";
  icon?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}>;

export type BreadCrumbTabProps = Readonly<{
  breadcrumbs: readonly BreadCrumbItem[];
  title: string;
  subtitle?: string;
  actions?: readonly BreadCrumbAction[];
  className?: string;
}>;

const actionButtonClass = "shrink-0 rounded-lg px-4 py-2 text-xs";

function BreadcrumbTrail(
  props: Readonly<{ items: readonly BreadCrumbItem[] }>,
) {
  const { items } = props;

  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span
            key={`${item.label}-${index}`}
            className="flex items-center gap-1"
          >
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
                  "text-xs",
                  isLast ? "text-ehs-gray" : "text-ehs-muted-text",
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

export function BreadCrumbTab(props: Readonly<BreadCrumbTabProps>) {
  const { breadcrumbs, title, subtitle, actions, className = "" } = props;
  const hasActions = actions !== undefined && actions.length > 0;

  return (
    <div
      className={[
        "border-ehs-border bg-ehs-light-text flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-6 py-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <BreadcrumbTrail items={breadcrumbs} />

        <Text
          as="h1"
          className="text-ehs-darker text-2xl font-bold tracking-tight"
        >
          {title}
        </Text>

        {subtitle ? (
          <Text as="p" className="text-ehs-muted-text text-sm">
            {subtitle}
          </Text>
        ) : null}
      </div>

      {hasActions ? (
        <div className="flex flex-wrap items-center gap-2">
          {actions.map((action) => (
            <Button
              key={action.label}
              type={action.type ?? "button"}
              variant={action.variant ?? "tertiary"}
              onClick={action.onClick}
              className={actionButtonClass}
            >
              {action.icon ? (
                <Icon
                  icon={action.icon}
                  className="text-base"
                  aria-hidden="true"
                />
              ) : null}
              {action.label}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
