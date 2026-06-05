"use client";

import { Icon } from "@iconify/react";
import {
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import {
  authFieldClass,
  authInputClass,
  authLabelClass,
} from "@/lib/auth-cqw-classes";
import {
  ehsFieldClass,
  ehsIconButtonClass,
  ehsInputClass,
  ehsLabelClass,
} from "@/lib/ehs-classes";

export type PasswordProps = Readonly<
  Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "placeholder"> & {
    label?: ReactNode;
    placeholder: string;
    labelClassName?: string;
    wrapperClassName?: string;
    scale?: "auth";
  }
>;

export function Password(props: Readonly<PasswordProps>) {
  const {
    label,
    placeholder,
    scale,
    labelClassName,
    wrapperClassName,
    className,
    autoComplete = "current-password",
    id: idProp,
    ...rest
  } = props;

  const isAuthScale = scale === "auth";
  const resolvedLabelClassName =
    labelClassName ?? (isAuthScale ? authLabelClass : ehsLabelClass);
  const resolvedWrapperClassName =
    wrapperClassName ?? (isAuthScale ? authFieldClass : ehsFieldClass);
  const baseInputClass = isAuthScale ? authInputClass : ehsInputClass;

  const generatedId = useId();
  const id = idProp ?? generatedId;
  const [visible, setVisible] = useState(false);

  const field = (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={[
          baseInputClass,
          isAuthScale ? "pr-[2.136cqw]" : "pr-10",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        className={`absolute top-1/2 -translate-y-1/2 ${ehsIconButtonClass} ${isAuthScale ? "right-[0.8cqw] text-[1.064cqw]" : "right-3"}`}
        onClick={() => setVisible((v) => !v)}
      >
        <Icon icon={visible ? "mdi:eye-off-outline" : "mdi:eye-outline"} />
      </button>
    </div>
  );

  if (!label) {
    return field;
  }

  return (
    <div className={resolvedWrapperClassName}>
      <label htmlFor={id} className={resolvedLabelClassName}>
        {label}
      </label>
      {field}
    </div>
  );
}
