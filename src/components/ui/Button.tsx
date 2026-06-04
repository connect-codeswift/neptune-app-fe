import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  ehsButtonBaseClass,
  ehsButtonPrimaryClass,
  ehsButtonSecondaryClass,
  ehsButtonTertiaryClass,
} from "@/components/ui/ehs-classes";

export type ButtonProps = Readonly<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    variant: "primary" | "secondary" | "tertiary";
    type: "button" | "submit" | "reset";
  }
>;

const variantClassName: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: ehsButtonPrimaryClass,
  secondary: ehsButtonSecondaryClass,
  tertiary: ehsButtonTertiaryClass,
};

export function Button(props: Readonly<ButtonProps>) {
  const { children, variant, className, type, ...rest } = props;

  return (
    <button
      type={type}
      className={[ehsButtonBaseClass, variantClassName[variant], className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
