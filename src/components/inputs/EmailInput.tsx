import { useId, type InputHTMLAttributes, type ReactNode } from "react";

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
    labelClassName = "ehs-label",
    wrapperClassName = "ehs-field",
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
      className={["ehs-input", className].filter(Boolean).join(" ")}
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
