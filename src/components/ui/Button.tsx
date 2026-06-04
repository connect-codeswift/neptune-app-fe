import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonProps = Readonly<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    variant: "primary" | "secondary" | "tertiary";
    type: "button" | "submit" | "reset";
  }
>;

const variantClassName: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "ehs-btn-primary",
  secondary: "ehs-btn-secondary",
  tertiary: "ehs-btn-tertiary",
};

export function Button(props: Readonly<ButtonProps>) {
  const { children, variant, className, type, ...rest } = props;

  return (
    <button
      type={type}
      className={["ehs-btn", variantClassName[variant], className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
