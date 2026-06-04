import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonProps = Readonly<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    variant: "primary" | "secondary" | "outline";
    type: "button" | "submit" | "reset";
  }
>;

const baseClassName =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";

const variantClassName: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-ehs-normal-blue text-white shadow-sm hover:bg-ehs-normal-blue-hover focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/20",
  secondary:
    "bg-ehs-light-blue text-ehs-darker shadow-sm hover:bg-ehs-light-blue-hover focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/20",
  outline:
    "border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/20",
};

export function Button(props: Readonly<ButtonProps>) {
  const { children, variant, className, type, ...rest } = props;

  return (
    <button
      type={type}
      className={[baseClassName, variantClassName[variant], className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
