import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  ehsButtonBaseClass,
  ehsButtonDangerClass,
  ehsButtonPrimaryClass,
  ehsButtonSecondaryClass,
  ehsButtonTertiaryClass,
} from "@/lib/ehs-classes";

export type ButtonProps = Readonly<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    variant: "primary" | "secondary" | "tertiary" | "danger";
    type: "button" | "submit" | "reset";
    /**
     * Shows a spinner, disables the button, and marks it aria-busy.
     *
     * Use it for the action's own button — the one that started the request.
     * A Cancel button sitting next to it should take plain `disabled`: two
     * spinners for one action reads as two things happening.
     */
    isLoading?: boolean;
  }
>;

/**
 * Inline rather than an <Icon> so Button pulls in no icon runtime and stays
 * usable from a server component. Spins the whole <svg>, which takes a
 * centre transform-origin as a replaced element.
 */
function ButtonSpinner() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="size-4 shrink-0 animate-spin motion-reduce:animate-none"
    >
      <circle
        cx="8"
        cy="8"
        r="6.5"
        stroke="currentColor"
        strokeWidth="2"
        className="opacity-25"
      />
      <path
        d="M14.5 8A6.5 6.5 0 0 0 8 1.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const variantClassName: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: ehsButtonPrimaryClass,
  secondary: ehsButtonSecondaryClass,
  tertiary: ehsButtonTertiaryClass,
  danger: ehsButtonDangerClass,
};

export function Button(props: Readonly<ButtonProps>) {
  const {
    children,
    variant,
    className,
    type,
    isLoading = false,
    disabled,
    ...rest
  } = props;

  return (
    <button
      type={type}
      // A button mid-request must not be pressable again, so isLoading implies
      // disabled without every call site having to say both.
      disabled={disabled === true || isLoading}
      aria-busy={isLoading || undefined}
      className={[ehsButtonBaseClass, variantClassName[variant], className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {isLoading ? <ButtonSpinner /> : null}
      {children}
    </button>
  );
}
