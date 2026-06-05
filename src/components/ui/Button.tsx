import type { ButtonHTMLAttributes, ReactNode } from "react";
import { authButtonSizeClass } from "@/lib/auth-cqw-classes";
import {
  ehsButtonBaseClass,
  ehsButtonPrimaryClass,
  ehsButtonSecondaryClass,
  ehsButtonTertiaryClass,
} from "@/lib/ehs-classes";

export type ButtonProps = Readonly<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    variant: "primary" | "secondary" | "tertiary";
    type: "button" | "submit" | "reset";
    scale?: "auth";
  }
>;

const variantClassName: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: ehsButtonPrimaryClass,
  secondary: ehsButtonSecondaryClass,
  tertiary: ehsButtonTertiaryClass,
};

export function Button(props: Readonly<ButtonProps>) {
  const { children, variant, className, type, scale, ...rest } = props;

  return (
    <button
      type={type}
      className={[
        ehsButtonBaseClass,
        variantClassName[variant],
        scale === "auth" ? authButtonSizeClass : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
