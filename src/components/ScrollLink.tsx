"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";
import { ehsLinkClass } from "@/lib/ehs-classes";

export type ScrollLinkProps = Readonly<ComponentProps<typeof Link>>;

function resolveHref(href: ScrollLinkProps["href"]): string {
  if (typeof href === "string") {
    return href;
  }
  if (href && typeof href === "object" && "pathname" in href && href.pathname) {
    return href.pathname;
  }
  return "";
}

export function ScrollLink(props: Readonly<ScrollLinkProps>) {
  const { href, onClick, className, ...rest } = props;
  const pathname = usePathname();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (pathname === resolveHref(href)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    onClick?.(e);
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={[ehsLinkClass, className].filter(Boolean).join(" ")}
      {...rest}
    />
  );
}
