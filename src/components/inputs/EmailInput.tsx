import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import {
  authFieldClass,
  authInputClass,
  authLabelClass,
} from "@/lib/auth-cqw-classes";
import { ehsFieldClass, ehsInputClass, ehsLabelClass } from "@/lib/ehs-classes";

export type EmailInputProps = Readonly<
  Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "placeholder"> & {
    label?: ReactNode;
    placeholder: string;
    labelClassName?: string;
    wrapperClassName?: string;
    scale?: "auth";
  }
>;

export function EmailInput(props: Readonly<EmailInputProps>) {
  const {
    label,
    placeholder,
    scale,
    labelClassName,
    wrapperClassName,
    className,
    autoComplete = "email",
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

  const input = (
    <input
      id={id}
      type="email"
      placeholder={placeholder}
      autoComplete={autoComplete}
      className={[baseInputClass, className].filter(Boolean).join(" ")}
      {...rest}
    />
  );

  if (!label) {
    return input;
  }

  return (
    <div className={resolvedWrapperClassName}>
      <label htmlFor={id} className={resolvedLabelClassName}>
        {label}
      </label>
      {input}
    </div>
  );
}
