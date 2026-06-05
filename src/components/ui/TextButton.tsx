import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ehsTextButtonClass } from "@/lib/ehs-classes";

export type TextButtonProps = Readonly<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    type: "button" | "submit" | "reset";
  }
>;

export function TextButton(props: Readonly<TextButtonProps>) {
  const { children, className, type, ...rest } = props;

  return (
    <button
      type={type}
      className={[ehsTextButtonClass, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
