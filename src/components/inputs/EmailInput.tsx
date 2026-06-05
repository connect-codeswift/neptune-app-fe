import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { ehsFieldClass, ehsInputClass, ehsLabelClass } from "@/lib/ehs-classes";

export type EmailInputProps = Readonly<
  Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
    label?: ReactNode;
    labelClassName?: string;
    wrapperClassName?: string;
  }
>;

export function EmailInput(props: Readonly<EmailInputProps>) {
  const {
    label,
    labelClassName = ehsLabelClass,
    wrapperClassName = ehsFieldClass,
    className,
    autoComplete = "email",
    id: idProp,
    ...rest
  } = props;

  const generatedId = useId();
  const id = idProp ?? generatedId;

  const input = (
    <input
      id={id}
      type="email"
      autoComplete={autoComplete}
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
