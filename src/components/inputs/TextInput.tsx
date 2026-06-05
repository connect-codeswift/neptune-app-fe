import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { ehsFieldClass, ehsInputClass, ehsLabelClass } from "@/lib/ehs-classes";

export type TextInputProps = Readonly<
  InputHTMLAttributes<HTMLInputElement> & {
    label?: ReactNode;
    labelClassName?: string;
    wrapperClassName?: string;
  }
>;

export function TextInput(props: Readonly<TextInputProps>) {
  const {
    label,
    labelClassName = ehsLabelClass,
    wrapperClassName = ehsFieldClass,
    className,
    type = "text",
    id: idProp,
    ...rest
  } = props;

  const generatedId = useId();
  const id = idProp ?? generatedId;

  const input = (
    <input
      id={id}
      type={type}
      className={[ehsInputClass, className].filter(Boolean).join(" ")}
      {...rest}
    />
  );

  if (!label) {
    return input;
  }

  return (
    <div className={wrapperClassName}>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      {input}
    </div>
  );
}
