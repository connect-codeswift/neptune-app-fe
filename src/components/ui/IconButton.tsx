import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  ehsIconButtonBaseClass,
  ehsIconButtonGhostClass,
  ehsIconButtonPrimaryClass,
  ehsIconButtonSecondaryClass,
  ehsIconButtonTertiaryClass,
} from "@/lib/ehs-classes";

export type IconButtonProps = Readonly<
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    children: ReactNode;
    variant: "primary" | "secondary" | "tertiary" | "ghost";
    type: "button" | "submit" | "reset";
    "aria-label": string;
  }
>;

const variantClassName: Record<IconButtonProps["variant"], string> = {
  primary: ehsIconButtonPrimaryClass,
  secondary: ehsIconButtonSecondaryClass,
  tertiary: ehsIconButtonTertiaryClass,
  ghost: ehsIconButtonGhostClass,
};

export function IconButton(props: Readonly<IconButtonProps>) {
  const { children, variant, className, type, ...rest } = props;

  return (
    <button
      type={type}
      className={[ehsIconButtonBaseClass, variantClassName[variant], className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
