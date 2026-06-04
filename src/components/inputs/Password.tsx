"use client";

import { Icon } from "@iconify/react";
import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";

const inputClassName =
  "w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none transition focus:border-ehs-normal-blue focus:ring-2 focus:ring-ehs-normal-blue/20";
const defaultLabelClassName = "block text-sm font-medium text-gray-700";
const defaultWrapperClassName = "space-y-1.5";

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
    labelClassName = defaultLabelClassName,
    wrapperClassName = defaultWrapperClassName,
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
        className={[inputClassName, className].filter(Boolean).join(" ")}
        {...rest}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
