import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import {
  authFieldClass,
  authInputClass,
  authLabelClass,
} from "@/lib/auth-cqw-classes";
import { ehsFieldClass, ehsInputClass, ehsLabelClass } from "@/lib/ehs-classes";

export type TextInputProps = Readonly<
  Omit<InputHTMLAttributes<HTMLInputElement>, "placeholder"> & {
    label?: ReactNode;
    placeholder: string;
    labelClassName?: string;
    wrapperClassName?: string;
    scale?: "auth";
  }
>;

export function TextInput(props: Readonly<TextInputProps>) {
  const {
    label,
    placeholder,
    scale,
    labelClassName,
    wrapperClassName,
    className,
    type = "text",
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
      type={type}
      placeholder={placeholder}
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
