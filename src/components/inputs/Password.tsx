"use client";

import { Icon } from "@iconify/react";
import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";

export type PasswordProps = Readonly<
  Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
    label?: ReactNode;
    labelClassName?: string;
    wrapperClassName?: string;
  }
>;

export function Password(props: Readonly<PasswordProps>) {
  const {
    label,
    labelClassName = "ehs-label",
    wrapperClassName = "ehs-field",
    className,
    autoComplete = "current-password",
    id: idProp,
    ...rest
  } = props;

  const generatedId = useId();
  const id = idProp ?? generatedId;
  const [visible, setVisible] = useState(false);

  const field = (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        className={["ehs-input", "ehs-input-password", className].filter(Boolean).join(" ")}
        {...rest}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        className="ehs-icon-btn absolute right-3 top-1/2 -translate-y-1/2"
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
    <div className={wrapperClassName}>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      {field}
    </div>
  );
}
