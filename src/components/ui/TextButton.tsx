import type { ButtonHTMLAttributes, ReactNode } from "react";
import { authTextButtonClass } from "@/lib/auth-cqw-classes";
import { ehsTextButtonClass } from "@/lib/ehs-classes";

export type TextButtonProps = Readonly<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    type: "button" | "submit" | "reset";
    scale?: "auth";
  }
>;

export function TextButton(props: Readonly<TextButtonProps>) {
  const { children, className, type, scale, ...rest } = props;
  const baseClass = scale === "auth" ? authTextButtonClass : ehsTextButtonClass;

  return (
    <button
      type={type}
      className={[baseClass, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
