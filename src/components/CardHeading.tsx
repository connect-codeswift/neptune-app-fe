import { Icon } from "@iconify/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Text } from "@/components/Text";

/**
 * Title / subtitle / "View all" row shared by every command-center card
 * (Figma node 6154:27047). Kept in one place so the six cards on the dashboard
 * can't drift apart on type scale or spacing.
 *
 * `action` replaces the "View all" link for cards that put a control there
 * instead — the Incident Trends segmented filter, for example.
 */
export type CardHeadingProps = Readonly<{
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  action?: ReactNode;
  className?: string;
}>;

export function CardHeading(props: Readonly<CardHeadingProps>) {
  const { title, subtitle, viewAllHref, action, className = "" } = props;

  return (
    <div
      className={[
        "flex flex-wrap items-center justify-between gap-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex min-w-0 flex-col gap-[2px]">
        <Text
          as="h2"
          className="text-ehs-dark-bg text-3.5 leading-normal font-bold tracking-[-0.14px]"
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            as="p"
            className="text-ehs-muted-text text-[11px] leading-normal"
          >
            {subtitle}
          </Text>
        ) : null}
      </div>

      {action ??
        (viewAllHref ? (
          <Link
            href={viewAllHref}
            className="text-ehs-gray hover:bg-ehs-light-bg hover:text-ehs-dark-bg inline-flex shrink-0 items-center gap-2 rounded-[10px] px-2 py-[4.5px] text-[11.5px] transition-colors"
          >
            View all
            <Icon
              icon="mdi:arrow-right"
              className="size-3 shrink-0"
              aria-hidden="true"
            />
          </Link>
        ) : null)}
    </div>
  );
}
