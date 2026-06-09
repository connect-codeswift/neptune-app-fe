import { useId, type ReactNode, type SelectHTMLAttributes } from "react";
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
  }
>;

export function SelectInput(props: Readonly<SelectInputProps>) {
  const {
    label,
    placeholder,
    options,
    labelClassName = ehsLabelClass,
    wrapperClassName = ehsFieldClass,
    className,
    value,
    id: idProp,
    ...rest
  } = props;

  const generatedId = useId();
  const id = idProp ?? generatedId;
  const hasValue = value !== undefined && value !== "";

  const select = (
    <select
      id={id}
      value={value}
      className={[
        ehsSelectClass,
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
    <div className={wrapperClassName}>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      {select}
    </div>
  );
}
