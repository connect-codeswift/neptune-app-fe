import { Icon } from "@iconify/react";
import type { ReactNode } from "react";
import { Text } from "@/components/Text";

export type HazcomPageHeaderProps = Readonly<{
  breadcrumb: readonly string[];
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}>;

export function HazcomPageHeader(props: Readonly<HazcomPageHeaderProps>) {
  const { breadcrumb, title, subtitle, actions } = props;

  return (
    <div className="border-ehs-border bg-ehs-light-text flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-6 py-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {breadcrumb.length > 0 ? (
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1"
          >
            {breadcrumb.map((label, index) => {
              const isLast = index === breadcrumb.length - 1;

              return (
                <span
                  key={`${label}-${index}`}
                  className="flex items-center gap-1"
                >
                  {index > 0 ? (
                    <Icon
                      icon="mdi:chevron-right"
                      className="text-ehs-muted-text size-3.5"
                      aria-hidden="true"
                    />
                  ) : null}
                  <Text
                    as="span"
                    className={[
                      "text8",
                      isLast ? "text-ehs-gray" : "text-ehs-muted-text",
                    ].join(" ")}
                  >
                    {label}
                  </Text>
                </span>
              );
            })}
          </nav>
        ) : null}

        <Text as="h1" className="text1 text-ehs-darker">
          {title}
        </Text>

        {subtitle ? (
          <Text as="p" className="text4 text-ehs-muted-text">
            {subtitle}
          </Text>
        ) : null}
      </div>

      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
