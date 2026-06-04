import { useId, type InputHTMLAttributes, type ReactNode } from "react";

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
    labelClassName = "ehs-label",
    wrapperClassName = "ehs-field",
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
