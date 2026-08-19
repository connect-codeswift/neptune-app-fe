import { Icon } from "@iconify/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Text } from "@/components/Text";

export type HazcomBreadcrumbItem = Readonly<{
  label: string;
  /** When set, the crumb navigates like other module detail headers. */
  href?: string;
}>;

export type HazcomPageHeaderProps = Readonly<{
  breadcrumb: readonly (string | HazcomBreadcrumbItem)[];
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}>;

function normalizeCrumb(
  item: string | HazcomBreadcrumbItem,
): HazcomBreadcrumbItem {
  return typeof item === "string" ? { label: item } : item;
}

const crumbMuted =
  "text8 text-ehs-muted-text transition-colors hover:text-ehs-gray";
const crumbActive = "text8 text-ehs-gray";

export function HazcomPageHeader(props: Readonly<HazcomPageHeaderProps>) {
  const { breadcrumb, title, subtitle, actions } = props;
  const crumbs = breadcrumb.map(normalizeCrumb);

  return (
    <div className="backdrop-blur-2.5 relative flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-ehs-border-ink/8 bg-ehs-surface/62 px-4 py-4 shadow-(--ehs-shadow-panel) before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:content-[''] sm:px-6">
      <div className="relative z-1 flex min-w-0 flex-1 flex-col gap-1.5">
        {crumbs.length > 0 ? (
          <nav
            aria-label="Breadcrumb"
            className="flex min-w-0 flex-wrap items-center gap-1"
          >
            {crumbs.map((crumb, index) => {
              const isLast = index === crumbs.length - 1;
              const showLink = Boolean(crumb.href) && !isLast;

              return (
                <span
                  key={`${crumb.label}-${String(index)}`}
                  className="flex min-w-0 items-center gap-1"
                >
                  {index > 0 ? (
                    <Icon
                      icon="mdi:chevron-right"
                      className="size-3 shrink-0 text-ehs-muted-text"
                      aria-hidden="true"
                    />
                  ) : null}
                  {showLink && crumb.href ? (
                    <Link href={crumb.href} className={crumbMuted}>
                      {crumb.label}
                    </Link>
                  ) : (
                    <Text
                      as="span"
                      className={[
                        isLast ? crumbActive : "text8 text-ehs-muted-text",
                        isLast ? "truncate" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {crumb.label}
                    </Text>
                  )}
                </span>
              );
            })}
          </nav>
        ) : null}

        <div className="flex min-w-0 flex-col gap-0.5">
          <Text as="h1" className="text1 text-ehs-darker">
            {title}
          </Text>
          {subtitle ? (
            <Text as="p" className="text8 text-ehs-muted-text">
              {subtitle}
            </Text>
          ) : null}
        </div>
      </div>

      {actions ? (
        <div className="relative z-1 flex flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
