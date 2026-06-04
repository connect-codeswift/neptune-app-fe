import { useId, type InputHTMLAttributes, type ReactNode } from "react";

const inputClassName =
  "w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none transition focus:border-ehs-normal-blue focus:ring-2 focus:ring-ehs-normal-blue/20";

const defaultLabelClassName = "block text-sm font-medium text-gray-700";
const defaultWrapperClassName = "space-y-1.5";

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
    labelClassName = defaultLabelClassName,
    wrapperClassName = defaultWrapperClassName,
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
      className={[inputClassName, className].filter(Boolean).join(" ")}
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
