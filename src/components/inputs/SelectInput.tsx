import { useId, type ReactNode, type SelectHTMLAttributes } from "react";
import {
  authFieldClass,
  authLabelClass,
  authSelectClass,
} from "@/lib/auth-cqw-classes";
import { ehsFieldClass, ehsLabelClass, ehsSelectClass } from "@/lib/ehs-classes";

export type SelectOption = Readonly<{
  value: string;
  label: string;
}>;

export type SelectInputProps = Readonly<
  Omit<SelectHTMLAttributes<HTMLSelectElement>, "placeholder"> & {
    label?: ReactNode;
    placeholder: string;
    options: readonly SelectOption[];
    labelClassName?: string;
    wrapperClassName?: string;
    scale?: "auth";
  }
>;

export function SelectInput(props: Readonly<SelectInputProps>) {
  const {
    label,
    placeholder,
    options,
    scale,
    labelClassName,
    wrapperClassName,
    className,
    value,
    id: idProp,
    ...rest
  } = props;

  const isAuthScale = scale === "auth";
  const resolvedLabelClassName =
    labelClassName ?? (isAuthScale ? authLabelClass : ehsLabelClass);
  const resolvedWrapperClassName =
    wrapperClassName ?? (isAuthScale ? authFieldClass : ehsFieldClass);
  const baseSelectClass = isAuthScale ? authSelectClass : ehsSelectClass;

  const generatedId = useId();
  const id = idProp ?? generatedId;
  const hasValue = value !== undefined && value !== "";

  const select = (
    <select
      id={id}
      value={value}
      className={[
        baseSelectClass,
        hasValue ? "text-ehs-darker" : "text-ehs-muted-text",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  if (!label) {
    return select;
  }

  return (
    <div className={resolvedWrapperClassName}>
      <label htmlFor={id} className={resolvedLabelClassName}>
        {label}
      </label>
      {select}
    </div>
  );
}
