"use client";

import { Icon } from "@iconify/react";
import {
  useId,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { PasswordStrengthMeter } from "@/components/inputs/PasswordStrengthMeter";
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
    showStrengthMeter?: boolean;
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
    showStrengthMeter = false,
    onChange,
    value,
    ...rest
  } = props;

  const generatedId = useId();
  const id = idProp ?? generatedId;
  const [visible, setVisible] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState("");

  const strengthPassword =
    typeof value === "string" ? value : uncontrolledValue;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (showStrengthMeter && value === undefined) {
      setUncontrolledValue(event.target.value);
    }

    onChange?.(event);
  };

  const field = (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={[ehsInputClass, "pr-10", className].filter(Boolean).join(" ")}
          onChange={handleChange}
          value={value}
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
      {showStrengthMeter ? (
        <PasswordStrengthMeter password={strengthPassword} />
      ) : null}
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
