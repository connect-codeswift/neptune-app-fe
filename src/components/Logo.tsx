import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";

import {
  authLogoIconBoxClass,
  authLogoIconClass,
  authLogoRootClass,
  authLogoTextClass,
} from "@/lib/auth-cqw-classes";

export type LogoIconProps = Readonly<{
  className?: string;
  variant?: "dark" | "light";
  fluid?: boolean;
}>;

export function Logo(props: Readonly<LogoIconProps>) {
  const { className = "", variant = "dark", fluid = false } = props;
  const textClassName =
    variant === "light" ? "text-ehs-light-text" : "text-ehs-darker";

  return (
    <div
      className={[
        "flex items-center",
        fluid ? authLogoRootClass : "gap-2",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={
          fluid
            ? authLogoIconBoxClass
            : "bg-ehs-normal-blue flex h-8 w-8 items-center justify-center rounded-lg"
        }
      >
        <Icon
          icon="mdi:waves"
          className={
            fluid
              ? authLogoIconClass
              : "text-ehs-light-text text-lg"
          }
          aria-hidden="true"
        />
      </div>
      <Text
        as="span"
        className={[
          fluid ? authLogoTextClass : "text-base font-semibold tracking-tight",
          textClassName,
        ].join(" ")}
      >
        Neptune
      </Text>
    </div>
  );
}
