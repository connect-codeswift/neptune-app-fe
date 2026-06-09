"use client";

import { Icon } from "@iconify/react";
import {
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
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
  }
>;

export function Password(props: Readonly<PasswordProps>) {
  const {
    label,
    placeholder,
    labelClassName = ehsLabelClass,
    wrapperClassName = ehsFieldClass,
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
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={[ehsInputClass, "pr-10", className].filter(Boolean).join(" ")}
        {...rest}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        className={`absolute top-1/2 right-3 -translate-y-1/2 ${ehsIconButtonClass}`}
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
